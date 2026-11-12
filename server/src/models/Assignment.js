const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['assigned', 'submitted', 'graded'], default: 'assigned' },
    submittedAt: { type: Date },
    maxMarks: { type: Number, default: 100, min: 1 },
    marksObtained: { type: Number, min: 0 },
    feedback: { type: String, trim: true },
    submission: { fileName: String, originalName: String, uploadedAt: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
