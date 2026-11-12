const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    subject: { type: String, required: true, trim: true },
    startTime: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
    attendance: { type: String, enum: ['unmarked', 'present', 'absent', 'late'], default: 'unmarked' },
    seriesId: { type: String },
    meetLink: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);