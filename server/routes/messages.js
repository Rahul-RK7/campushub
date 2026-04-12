const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getConversations,
    createConversation,
    getMessages,
    sendMessage,
    markAsRead,
    getUnreadCount,
} = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id', sendMessage);
router.put('/conversations/:id/read', markAsRead);
router.get('/unread-count', getUnreadCount);

module.exports = router;
