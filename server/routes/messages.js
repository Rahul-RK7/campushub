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
    createGroupConversation,
    addGroupMember,
    removeGroupMember,
} = require('../controllers/messageController');

router.use(protect);

router.get('/conversations', getConversations);
router.post('/conversations', createConversation);
router.post('/groups', createGroupConversation);
router.get('/conversations/:id', getMessages);
router.post('/conversations/:id', sendMessage);
router.put('/conversations/:id/read', markAsRead);
router.get('/unread-count', getUnreadCount);
router.post('/groups/:id/members', addGroupMember);
router.delete('/groups/:id/members/:userId', removeGroupMember);

module.exports = router;
