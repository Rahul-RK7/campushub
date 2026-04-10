const User = require('../models/User');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.updateMe = async (req, res) => {
    try {
        const { name, bio, department } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (bio !== undefined) updates.bio = bio.trim();
        if (department !== undefined) updates.department = department.trim();

        const user = await User.findByIdAndUpdate(
            req.user._id, updates, { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
