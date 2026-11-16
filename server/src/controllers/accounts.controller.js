const bcrypt = require('bcryptjs');
const User = require('../models/User');

const clean = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, createdAt: u.createdAt });

exports.listAccounts = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['student', 'parent'] } }).sort({ createdAt: -1 });
    res.json(users.map(clean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAccount = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = String(req.body.email || '').toLowerCase().trim();
    if (!['student', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Role must be student or parent' });
    }
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required' });
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already has an account' });
    }
    const user = await User.create({ name, email, role, password: await bcrypt.hash(String(password), 10) });
    res.status(201).json(clean(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findOne({ _id: req.params.id, role: { $in: ['student', 'parent'] } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    user.password = await bcrypt.hash(String(password), 10);
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: { $in: ['student', 'parent'] } });
    if (!user) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
