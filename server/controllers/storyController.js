const Story = require('../models/Story');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinaryConfig');

exports.createStory = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Media file is required for a story' });
        }

        const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);

        const story = await Story.create({
            user: req.user._id,
            mediaUrl: result.secure_url,
            mediaType: req.file.mimetype.startsWith('video/') ? 'video' : 'image',
            mediaPublicId: result.public_id,
        });

        const populated = await Story.findById(story._id).populate('user', 'name profilePic');
        res.status(201).json(populated);
    } catch (err) {
        console.error('createStory error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getStories = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const followingIds = user.following.map(id => id.toString());
        const targetUserIds = [...followingIds, req.user._id.toString()];

        const activeStories = await Story.find({
            user: { $in: targetUserIds },
            expiresAt: { $gt: new Date() }
        })
            .populate('user', 'name profilePic')
            .sort({ createdAt: 1 });

        const grouped = {};
        for (const story of activeStories) {
            const userId = story.user._id.toString();
            if (!grouped[userId]) {
                grouped[userId] = {
                    user: story.user,
                    stories: []
                };
            }
            grouped[userId].stories.push({
                _id: story._id,
                mediaUrl: story.mediaUrl,
                mediaType: story.mediaType,
                createdAt: story.createdAt,
                expiresAt: story.expiresAt
            });
        }

        const groupedArray = Object.values(grouped);
        // Move current user to front if they have active stories
        const currentUserIndex = groupedArray.findIndex(g => g.user._id.toString() === req.user._id.toString());
        if (currentUserIndex > 0) {
            const currentUserGroup = groupedArray.splice(currentUserIndex, 1)[0];
            groupedArray.unshift(currentUserGroup);
        }

        res.json(groupedArray);
    } catch (err) {
        console.error('getStories error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
