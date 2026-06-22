const express = require('express');
const router = express.Router();
const teamRequestController = require('./team-request.controller');
const teamConversationController = require('./team-conversation.controller');
const teamMessageController = require('./team-message.controller');
const { requireAuth } = require('../../middleware/security/auth.middleware');
const { controledAcces } = require('../../middleware/authorize.middleware');

router.use(requireAuth, controledAcces(['Company', 'Employee']));

router.post('/requests', teamRequestController.createRequest);
router.get('/conversations', teamConversationController.listConversations);
router.get('/unread-count', teamConversationController.getTotalUnreadCount);
router.get('/conversations/:conversationId', teamConversationController.getConversationById);
router.put('/conversations/:conversationId/read', teamConversationController.markConversationAsRead);
router.post('/conversations/:conversationId/hide-for-me', teamConversationController.deleteConversation);
router.delete('/messages/:messageId', teamMessageController.deleteMessage);
router.get('/messages/:conversationId', teamMessageController.getConversationMessages);
router.post('/messages', teamMessageController.sendMessage);

module.exports = router;
