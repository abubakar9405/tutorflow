const Assignment = require('../models/Assignment');
const assignments = require('../services/assignments.service');

exports.getAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.status) filter.status = req.query.status;
    const list = await Assignment.find(filter).populate('student', 'name grade').sort({ dueDate: 1 });
    res.json(list.map((a) => ({ ...a.toObject(), overdue: assignments.isOverdue(a) })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const created = await Assignment.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { title, subject, description, dueDate, maxMarks } = req.body;
    const a = await Assignment.findByIdAndUpdate(
      req.params.id,
      { title, subject, description, dueDate, maxMarks },
      { new: true, runValidators: true, omitUndefined: true }
    );
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const a = await Assignment.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted', submittedAt: new Date() },
      { new: true }
    );
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.gradeAssignment = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    const marks = Number(req.body.marksObtained);
    if (!assignments.validMarks(marks, a.maxMarks)) {
      return res.status(400).json({ message: `Marks must be between 0 and ${a.maxMarks}` });
    }
    a.marksObtained = marks;
    a.feedback = req.body.feedback;
    a.status = 'graded';
    if (!a.submittedAt) a.submittedAt = new Date();
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const a = await Assignment.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
