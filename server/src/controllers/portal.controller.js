const fs = require('fs');
const path = require('path');
const Student = require('../models/Student');
const Session = require('../models/Session');
const Assignment = require('../models/Assignment');
const Invoice = require('../models/Invoice');
const identity = require('../services/identity.service');
const reports = require('../services/reports.service');
const uploadDir = require('../middleware/upload').dir;

exports.getMe = async (req, res) => {
  try {
    const students = await identity.getLinkedStudents(req.user);
    res.json({
      role: req.user.role,
      students: students.map((s) => ({ _id: s._id, name: s.name, grade: s.grade })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOverview = async (req, res) => {
  try {
    const id = req.params.id;
    if (!(await identity.canAccessStudent(req.user, id))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const student = await Student.findById(id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const now = new Date();
    const [upcoming, past, assignments] = await Promise.all([
      Session.find({ student: id, status: 'scheduled', startTime: { $gte: now } })
        .select('-notes').sort({ startTime: 1 }).limit(10),
      Session.find({ student: id, status: { $ne: 'cancelled' }, startTime: { $lt: now } })
        .select('-notes').sort({ startTime: -1 }).limit(20),
      Assignment.find({ student: id }).sort({ dueDate: 1 }),
    ]);

    const out = {
      student: { _id: student._id, name: student.name, grade: student.grade, subjects: student.subjects },
      upcoming,
      past,
      attendance: reports.attendanceSummary(past),
      assignments: assignments.map((a) => ({
        ...a.toObject(),
        overdue: a.status === 'assigned' && new Date(a.dueDate) < now,
      })),
      assignmentSummary: reports.assignmentSummary(assignments),
    };

    // fees are for parents only
    if (req.user.role === 'parent') {
      const invoices = await Invoice.find({ student: id }).sort({ month: -1 });
      out.fees = {
        summary: reports.feeSummary(invoices),
        invoices: invoices.map((i) => ({
          _id: i._id,
          month: i.month,
          amount: i.amount,
          paid: i.payments.reduce((s, p) => s + p.amount, 0),
          status: i.status,
          dueDate: i.dueDate,
        })),
      };
    }
    res.json(out);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.uploadSubmission = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    if (!(await identity.canAccessStudent(req.user, a.student))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (!req.file) return res.status(400).json({ message: 'Choose a file first' });
    if (a.status === 'graded') {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({ message: 'This assignment is already graded' });
    }
    if (a.submission?.fileName) fs.unlink(path.join(uploadDir, a.submission.fileName), () => {});
    a.submission = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };
    a.status = 'submitted';
    a.submittedAt = new Date();
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.downloadSubmission = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a || !a.submission?.fileName) return res.status(404).json({ message: 'No file uploaded' });
    if (!(await identity.canAccessStudent(req.user, a.student))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.download(path.join(uploadDir, a.submission.fileName), a.submission.originalName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
