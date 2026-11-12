const Student = require('../models/Student');
const Session = require('../models/Session');
const Invoice = require('../models/Invoice');
const Assignment = require('../models/Assignment');

exports.getStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [totalStudents, sessionsToday, upcoming, attendanceAgg, invoices, overdue, toGrade] = await Promise.all([
      Student.countDocuments({ active: true }),
      Session.countDocuments({
        startTime: { $gte: startOfDay, $lte: endOfDay },
        status: { $ne: 'cancelled' },
      }),
      Session.find({ startTime: { $gte: now }, status: 'scheduled' })
        .populate('student', 'name')
        .sort({ startTime: 1 })
        .limit(5),
      Session.aggregate([
        { $match: { startTime: { $gte: startOfMonth }, attendance: { $ne: 'unmarked' } } },
        { $group: { _id: '$attendance', count: { $sum: 1 } } },
      ]),
      Invoice.find({ month }),
      Assignment.countDocuments({ status: 'assigned', dueDate: { $lt: now } }),
      Assignment.countDocuments({ status: 'submitted' }),
    ]);

    const attendance = { present: 0, absent: 0, late: 0 };
    attendanceAgg.forEach((a) => {
      attendance[a._id] = a.count;
    });

    const billed = invoices.reduce((s, i) => s + i.amount, 0);
    const collected = invoices.reduce((s, i) => s + i.payments.reduce((x, p) => x + p.amount, 0), 0);

    res.json({
      totalStudents,
      sessionsToday,
      upcoming,
      attendance,
      fees: { month, billed, collected, pending: billed - collected },
      assignments: { overdue, toGrade },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
