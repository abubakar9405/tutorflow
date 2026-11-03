const Session = require('../models/Session');

exports.getSessions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.student) filter.student = req.query.student;
    if (req.query.from || req.query.to) {
      filter.startTime = {};
      if (req.query.from) filter.startTime.$gte = new Date(req.query.from);
      if (req.query.to) filter.startTime.$lte = new Date(req.query.to);
    }
    const sessions = await Session.find(filter).populate('student', 'name grade').sort({ startTime: 1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// repeatWeeks = 0 makes one session; repeatWeeks = 4 makes 5 weekly sessions
exports.createSession = async (req, res) => {
  try {
    const { repeatWeeks = 0, ...data } = req.body;
    const first = new Date(data.startTime);
    const seriesId = repeatWeeks > 0 ? Date.now().toString() : undefined;
    const docs = [];
    for (let i = 0; i <= repeatWeeks; i++) {
      const start = new Date(first);
      start.setDate(start.getDate() + i * 7);
      docs.push({ ...data, startTime: start, seriesId });
    }
    const created = await Session.insertMany(docs);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.cancelSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(req.params.id, { status: 'cancelled' }, { new: true });
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      { attendance: req.body.attendance, status: 'completed' },
      { new: true, runValidators: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};