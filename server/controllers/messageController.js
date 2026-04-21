const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/messages/conversations — list user's conversations
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user._id,
        })
            .populate('participants', 'name profilePic')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });

        // For each conversation, attach unread count
        const results = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversation: conv._id,
                    readBy: { $ne: req.user._id },
                    sender: { $ne: req.user._id },
                });
                return { ...conv.toObject(), unreadCount };
            })
        );

        res.json(results);
    } catch (err) {
        console.error('getConversations error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/messages/conversations — create or get existing conversation
exports.createConversation = async (req, res) => {
    try {
        const { participantId } = req.body;
        if (!participantId) return res.status(400).json({ error: 'participantId required' });
        if (!mongoose.isValidObjectId(participantId)) {
            return res.status(400).json({ error: 'Invalid participant ID' });
        }
        if (participantId === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot message yourself' });
        }

        // Check if user exists
        const otherUser = await User.findById(participantId);
        if (!otherUser) return res.status(404).json({ error: 'User not found' });

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user._id, participantId], $size: 2 },
        })
            .populate('participants', 'name profilePic')
            .populate('lastMessage');

        if (conversation) return res.json(conversation);

        // Create new conversation
        conversation = await Conversation.create({
            participants: [req.user._id, participantId],
        });
        conversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name profilePic')
            .populate('lastMessage');

        res.status(201).json(conversation);
    } catch (err) {
        console.error('createConversation error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/messages/conversations/:id — get messages in a conversation
exports.getMessages = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid conversation ID' });
        }
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        // Ensure user is a participant
        if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Not a participant' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const messages = await Message.find({ conversation: req.params.id })
            .populate('sender', 'name profilePic')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Reverse so the messages are returned chronologically (oldest to newest) for UI rendering
        messages.reverse();

        const total = await Message.countDocuments({ conversation: req.params.id });

        res.json({ messages, total, page, pages: Math.ceil(total / limit) });
    } catch (err) {
        console.error('getMessages error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// POST /api/messages/conversations/:id — send a message
exports.sendMessage = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text?.trim()) return res.status(400).json({ error: 'Message text required' });
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid conversation ID' });
        }

        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Not a participant' });
        }

        const message = await Message.create({
            conversation: conversation._id,
            sender: req.user._id,
            text: text.trim(),
            readBy: [req.user._id], // sender has read it
        });

        // Update conversation's lastMessage
        conversation.lastMessage = message._id;
        await conversation.save();

        const populated = await Message.findById(message._id)
            .populate('sender', 'name profilePic');

        // Emit via Socket.IO if available
        const io = req.app.get('io');
        if (io) {
            conversation.participants.forEach(participantId => {
                if (participantId.toString() !== req.user._id.toString()) {
                    io.to(participantId.toString()).emit('newMessage', {
                        message: populated,
                        conversationId: conversation._id,
                    });
                }
            });
        }

        res.status(201).json(populated);
    } catch (err) {
        console.error('sendMessage error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// PUT /api/messages/conversations/:id/read — mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid conversation ID' });
        }
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        if (!conversation.participants.some(p => p.toString() === req.user._id.toString())) {
            return res.status(403).json({ error: 'Not a participant' });
        }

        await Message.updateMany(
            {
                conversation: req.params.id,
                readBy: { $ne: req.user._id },
            },
            { $addToSet: { readBy: req.user._id } }
        );

        res.json({ success: true });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/messages/unread-count — total unread messages for navbar badge
exports.getUnreadCount = async (req, res) => {
    try {
        // Find all conversations the user is in
        const conversations = await Conversation.find({ participants: req.user._id }).select('_id');
        const conversationIds = conversations.map(c => c._id);

        const count = await Message.countDocuments({
            conversation: { $in: conversationIds },
            readBy: { $ne: req.user._id },
            sender: { $ne: req.user._id },
        });

        res.json({ count });
    } catch (err) {
        console.error('getUnreadCount error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
