const Student = require('../models/Student');
const Session = require('../models/Session');
const Assignment = require('../models/Assignment');
const Invoice = require('../models/Invoice');
const reports = require('../services/reports.service');

exports.getStudentReport = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    const [sessions, assignments, invoices] = await Promise.all([
      Session.find({ student: student._id, status: { $ne: 'cancelled' } }),
      Assignment.find({ student: student._id }),
      Invoice.find({ student: student._id }),
    ]);
    res.json({
      attendance: reports.attendanceSummary(sessions),
      assignments: reports.assignmentSummary(assignments),
      fees: reports.feeSummary(invoices),
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
