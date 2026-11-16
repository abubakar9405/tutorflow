const fs = require('fs');
const path = require('path');
const Assignment = require('../models/Assignment');
const identity = require('../services/identity.service');
const uploadDir = require('../middleware/upload').dir;

exports.uploadAttachment = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (!req.file) return res.status(400).json({ message: 'Choose a file first' });
    if (a.attachment?.fileName) fs.unlink(path.join(uploadDir, a.attachment.fileName), () => {});
    a.attachment = {
      fileName: req.file.filename,
      originalName: req.file.originalname,
      uploadedAt: new Date(),
    };
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeAttachment = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a) return res.status(404).json({ message: 'Assignment not found' });
    if (a.attachment?.fileName) fs.unlink(path.join(uploadDir, a.attachment.fileName), () => {});
    a.attachment = undefined;
    await a.save();
    res.json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.downloadAttachment = async (req, res) => {
  try {
    const a = await Assignment.findById(req.params.id);
    if (!a || !a.attachment?.fileName) return res.status(404).json({ message: 'No file attached' });
    if (!(await identity.canAccessStudent(req.user, a.student))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.download(path.join(uploadDir, a.attachment.fileName), a.attachment.originalName);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
