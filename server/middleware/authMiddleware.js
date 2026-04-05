const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Not authorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

exports.facultyOnly = (req, res, next) => {
  if (req.user?.role !== 'faculty')
    return res.status(403).json({ error: 'Faculty access only' });
  next();
};