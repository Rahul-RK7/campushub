const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    // Check if email already used
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    // Hash password (never store plain text)
    const hashed = await bcrypt.hash(password, 10);

    // Create user with status: pending
    const user = await User.create({
      name, email, password: hashed, department
    });

    res.status(201).json({ message: 'Registration submitted. Awaiting faculty approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Block pending and rejected users
    if (user.status === 'pending')
      return res.status(403).json({ error: 'Account pending approval' });
    if (user.status === 'rejected')
      return res.status(403).json({ error: 'Account rejected' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user: { _id: user._id, name: user.name,
      email: user.email, role: user.role, status: user.status } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
