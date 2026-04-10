const User = require('../models/User');

exports.getPending = async (req, res) => {
  try {
    const students = await User.find({ status: 'pending' }).select('-password');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.approve = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Approved', user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.reject = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
