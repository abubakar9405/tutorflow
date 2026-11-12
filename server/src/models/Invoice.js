const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // e.g. 2026-11
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date },
    status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
    payments: [
      {
        amount: { type: Number, required: true, min: 1 },
        date: { type: Date, default: Date.now },
        method: { type: String, enum: ['cash', 'bank', 'online'], default: 'cash' },
      },
    ],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

// one invoice per student per month
invoiceSchema.index({ student: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
