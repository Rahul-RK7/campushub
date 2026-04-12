const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');
const { cloudinary, uploadToCloudinary } = require('../config/cloudinaryConfig');

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password')
            .populate('followers', 'name profilePic')
            .populate('following', 'name profilePic');
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

        // Handle profile picture upload
        if (req.file) {
            const userBefore = await User.findById(req.user._id);
            // Delete old profile pic from Cloudinary if it exists
            if (userBefore.profilePicPublicId) {
                try {
                    await cloudinary.uploader.destroy(userBefore.profilePicPublicId);
                } catch (err) {
                    console.error('Old profile pic delete error:', err);
                }
            }
            const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
            updates.profilePic = result.secure_url;
            updates.profilePicPublicId = result.public_id;
        }

        const user = await User.findByIdAndUpdate(
            req.user._id, updates, { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getPostCount = async (req, res) => {
    try {
        let count;
        if (req.user.role === 'faculty') {
            count = await Post.countDocuments();
        } else {
            count = await Post.countDocuments({ author: req.user._id });
        }
        res.json({ postCount: count });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.toggleFollow = async (req, res) => {
    try {
        const targetId = req.params.id;
        if (!mongoose.isValidObjectId(targetId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const myId = req.user._id;

        if (targetId === myId.toString()) {
            return res.status(400).json({ error: 'You cannot follow yourself' });
        }

        const targetUser = await User.findById(targetId);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        const alreadyFollowing = targetUser.followers.some(id => id.equals(myId));

        if (alreadyFollowing) {
            // Unfollow
            await User.findByIdAndUpdate(targetId, { $pull: { followers: myId } });
            await User.findByIdAndUpdate(myId, { $pull: { following: targetId } });
        } else {
            // Follow
            await User.findByIdAndUpdate(targetId, { $addToSet: { followers: myId } });
            await User.findByIdAndUpdate(myId, { $addToSet: { following: targetId } });
        }

        const updatedTarget = await User.findById(targetId);
        const updatedMe = await User.findById(myId);

        res.json({
            isFollowing: !alreadyFollowing,
            followerCount: updatedTarget.followers.length,
            followingCount: updatedMe.following.length,
        });
    } catch (err) {
        console.error('Toggle follow error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getMyPosts = async (req, res) => {
    try {
        const query = req.user.role === 'faculty' ? {} : { author: req.user._id };
        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .populate('author', 'name profilePic role');
        res.json({ posts });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const user = await User.findById(req.params.id)
            .select('-password -otp -otpExpiry')
            .populate('followers', 'name profilePic')
            .populate('following', 'name profilePic');

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isFollowing = user.followers.some(f => f._id.equals(req.user._id));

        res.json({
            ...user.toObject(),
            followerCount: user.followers.length,
            followingCount: user.following.length,
            isFollowing,
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.searchUsers = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json([]);

        const users = await User.find({
            name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' },
            _id: { $ne: req.user._id },
            status: 'active',
        })
            .select('name profilePic department role')
            .limit(20);

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};
