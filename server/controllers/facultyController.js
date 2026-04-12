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
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'student') return res.status(400).json({ error: 'Can only approve students' });
    if (user.status !== 'pending') return res.status(400).json({ error: 'User is not pending approval' });
    user.status = 'active';
    await user.save();
    res.json({ message: 'Approved', user: { _id: user._id, name: user.name, email: user.email, status: user.status } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.reject = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role !== 'student') return res.status(400).json({ error: 'Can only reject students' });
    if (user.status !== 'pending') return res.status(400).json({ error: 'User is not pending' });
    user.status = 'rejected';
    await user.save();
    res.json({ message: 'Rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
