const User = require('../models/User');

exports.getPending = async (req, res) => {
  const students = await User.find({ status: 'pending' }).select('-password');
  res.json(students);
};
exports.approve = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id,
    { status: 'active' }, { new: true });
  res.json({ message: 'Approved', user });
};
exports.reject = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { status: 'rejected' });
  res.json({ message: 'Rejected' });
};
