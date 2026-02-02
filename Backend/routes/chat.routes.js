const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/ChatControllers/conversationController');
const messageController = require('../controllers/ChatControllers/messageController');
const { requireAuthUser } = require('../middleware/auth.middleware');

// All chat routes require authentication
router.use(requireAuthUser);

// ============================================
// CONVERSATION ROUTES
// ============================================

// POST /chat/conversations - Find or create conversation
router.post('/conversations', conversationController.findOrCreateConversation);

// GET /chat/conversations - Get user's conversations
router.get('/conversations', conversationController.getUserConversations);

// GET /chat/conversations/search - Search conversations
router.get('/conversations/search', conversationController.searchConversations);

// GET /chat/conversations/unread-count - Get total unread count
router.get('/conversations/unread-count', conversationController.getTotalUnreadCount);

// GET /chat/conversations/:conversationId - Get conversation by ID
router.get('/conversations/:conversationId', conversationController.getConversationById);

// PUT /chat/conversations/:conversationId/read - Mark conversation as read
router.put('/conversations/:conversationId/read', conversationController.markConversationAsRead);

// PUT /chat/conversations/:conversationId/archive - Archive conversation
router.put('/conversations/:conversationId/archive', conversationController.archiveConversation);

// PUT /chat/conversations/:conversationId/unarchive - Unarchive conversation
router.put('/conversations/:conversationId/unarchive', conversationController.unarchiveConversation);

// PUT /chat/conversations/:conversationId/block - Block conversation
router.put('/conversations/:conversationId/block', conversationController.blockConversation);

// PUT /chat/conversations/:conversationId/unblock - Unblock conversation
router.put('/conversations/:conversationId/unblock', conversationController.unblockConversation);

// DELETE /chat/conversations/:conversationId - Delete conversation
router.delete('/conversations/:conversationId', conversationController.deleteConversation);

// GET /chat/unread-count - Get total unread count
router.get('/unread-count', conversationController.getTotalUnreadCount);

// ============================================
// MESSAGE ROUTES
// ============================================

// POST /chat/messages - Send message
router.post('/messages', messageController.sendMessage);

// GET /chat/messages/:conversationId - Get conversation messages
router.get('/messages/:conversationId', messageController.getConversationMessages);

// GET /chat/messages/:conversationId/unread - Get unread messages
router.get('/messages/:conversationId/unread', messageController.getUnreadMessages);

// GET /chat/messages/:conversationId/search - Search messages in conversation
router.get('/messages/:conversationId/search', messageController.searchMessages);

// GET /chat/messages/single/:messageId - Get message by ID
router.get('/messages/single/:messageId', messageController.getMessageById);

// PUT /chat/messages/:messageId/read - Mark message as read
router.put('/messages/:messageId/read', messageController.markMessageAsRead);

// PUT /chat/messages/:conversationId/read-all - Mark all messages as read
router.put('/messages/:conversationId/read-all', messageController.markAllMessagesAsRead);

// DELETE /chat/messages/:messageId - Delete message
router.delete('/messages/:messageId', messageController.deleteMessage);

// POST /chat/messages/:messageId/reaction - Add reaction to message
router.post('/messages/:messageId/reaction', messageController.addReaction);

// DELETE /chat/messages/:messageId/reaction - Remove reaction from message
router.delete('/messages/:messageId/reaction', messageController.removeReaction);

module.exports = router;
