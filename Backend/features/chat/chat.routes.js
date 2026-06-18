const express = require('express');
const router = express.Router();
const conversationController = require('./conversation.controller');
const messageController = require('./message.controller');
const { requireAuth } = require('../../middleware/security/auth.middleware');

router.use(requireAuth);

router.post('/conversations', conversationController.findOrCreateConversation);
router.get('/conversations', conversationController.getUserConversations);
router.get('/conversations/unread-count', conversationController.getTotalUnreadCount);
router.post('/conversations/unarchive-all', conversationController.unarchiveAllConversations);
router.get('/conversations/:conversationId', conversationController.getConversationById);
router.delete('/conversations/:conversationId', conversationController.deleteConversation);
router.put('/conversations/:conversationId/read', conversationController.markConversationAsRead);

router.post('/messages', messageController.sendMessage);
router.get('/messages/:conversationId', messageController.getConversationMessages);
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router;
