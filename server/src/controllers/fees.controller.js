const Invoice = require('../models/Invoice');
const Student = require('../models/Student');
const fees = require('../services/fees.service');

exports.getInvoices = async (req, res) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.month) filter.month = req.query.month;
    if (req.query.status) filter.status = req.query.status;
    const invoices = await Invoice.find(filter).populate('student', 'name grade').sort({ month: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// creates an invoice for every active student with a fee who has none for that month
exports.generateInvoices = async (req, res) => {
  try {
    const { month } = req.body;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || '')) {
      return res.status(400).json({ message: 'month must look like 2026-11' });
    }
    const students = await Student.find({ active: true, monthlyFee: { $gt: 0 } });
    const existing = await Invoice.find({ month }).distinct('student');
    const have = new Set(existing.map(String));
    const docs = students
      .filter((s) => !have.has(String(s._id)))
      .map((s) => ({
        student: s._id,
        month,
        amount: s.monthlyFee,
        dueDate: fees.defaultDueDate(month),
      }));
    const created = docs.length ? await Invoice.insertMany(docs) : [];
    res.status(201).json({ created: created.length, skipped: students.length - created.length });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.addPayment = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    const amount = Number(req.body.amount);
    if (!amount || amount < 1) return res.status(400).json({ message: 'Enter a valid amount' });
    invoice.payments.push({ amount, method: req.body.method, date: req.body.date });
    invoice.status = fees.computeStatus(invoice);
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    ['amount', 'dueDate', 'notes'].forEach((k) => {
      if (req.body[k] !== undefined) invoice[k] = req.body[k];
    });
    invoice.status = fees.computeStatus(invoice);
    await invoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const filter = req.query.month ? { month: req.query.month } : {};
    const invoices = await Invoice.find(filter);
    const billed = invoices.reduce((s, i) => s + i.amount, 0);
    const collected = invoices.reduce((s, i) => s + fees.totalPaid(i), 0);
    res.json({ billed, collected, pending: billed - collected, invoices: invoices.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ message: 'Invoice deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
