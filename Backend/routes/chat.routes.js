const express = require('express');
const router = express.Router();
const conversationController = require('../controllers/ChatControllers/conversationController');
const messageController = require('../controllers/ChatControllers/messageController');
const { requireAuth } = require('../middleware/security/auth.middleware');

// All chat routes require authentication
router.use(requireAuth);

// ============================================
// CONVERSATION ROUTES
// ============================================

/**
 * @openapi
 * /chat/conversations:
 *   post:
 *     tags: [Chat]
 *     summary: Find or create a conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participantId]
 *             properties:
 *               participantId: { type: string }
 *     responses:
 *       200:
 *         description: Conversation found or created
 *   get:
 *     tags: [Chat]
 *     summary: Get all conversations for the current user
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.post('/conversations', conversationController.findOrCreateConversation);
router.get('/conversations', conversationController.getUserConversations);

/**
 * @openapi
 * /chat/conversations/search:
 *   get:
 *     tags: [Chat]
 *     summary: Search conversations
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching conversations
 */
router.get('/conversations/search', conversationController.searchConversations);

/**
 * @openapi
 * /chat/conversations/unread-count:
 *   get:
 *     tags: [Chat]
 *     summary: Get total unread message count across all conversations
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/conversations/unread-count', conversationController.getTotalUnreadCount);

/**
 * @openapi
 * /chat/conversations/unarchive-all:
 *   post:
 *     tags: [Chat]
 *     summary: Unarchive all conversations for current user
 *     responses:
 *       200:
 *         description: All conversations unarchived
 */
router.post('/conversations/unarchive-all', conversationController.unarchiveAllConversations);

/**
 * @openapi
 * /chat/conversations/{conversationId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get a conversation by ID
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get('/conversations/:conversationId', conversationController.getConversationById);

/**
 * @openapi
 * /chat/conversations/{conversationId}/read:
 *   put:
 *     tags: [Chat]
 *     summary: Mark a conversation as read
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.put('/conversations/:conversationId/read', conversationController.markConversationAsRead);

/**
 * @openapi
 * /chat/conversations/{conversationId}/archive:
 *   put:
 *     tags: [Chat]
 *     summary: Archive a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Archived
 */
router.put('/conversations/:conversationId/archive', conversationController.archiveConversation);

/**
 * @openapi
 * /chat/conversations/{conversationId}/unarchive:
 *   put:
 *     tags: [Chat]
 *     summary: Unarchive a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Unarchived
 */
router.put('/conversations/:conversationId/unarchive', conversationController.unarchiveConversation);

/**
 * @openapi
 * /chat/conversations/{conversationId}/block:
 *   put:
 *     tags: [Chat]
 *     summary: Block a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation blocked
 */
router.put('/conversations/:conversationId/block', conversationController.blockConversation);

/**
 * @openapi
 * /chat/conversations/{conversationId}/unblock:
 *   put:
 *     tags: [Chat]
 *     summary: Unblock a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation unblocked
 */
router.put('/conversations/:conversationId/unblock', conversationController.unblockConversation);

/**
 * @openapi
 * /chat/conversations/{conversationId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation deleted
 */
router.delete('/conversations/:conversationId', conversationController.deleteConversation);

/**
 * @openapi
 * /chat/unread-count:
 *   get:
 *     tags: [Chat]
 *     summary: Get total unread count (alias)
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread-count', conversationController.getTotalUnreadCount);

// ============================================
// MESSAGE ROUTES
// ============================================

/**
 * @openapi
 * /chat/messages:
 *   post:
 *     tags: [Chat]
 *     summary: Send a message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [conversationId, content]
 *             properties:
 *               conversationId: { type: string }
 *               content: { type: string }
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post('/messages', messageController.sendMessage);

/**
 * @openapi
 * /chat/messages/single/{messageId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get a message by ID
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message details
 */
router.get('/messages/single/:messageId', messageController.getMessageById);

/**
 * @openapi
 * /chat/messages/{conversationId}/unread:
 *   get:
 *     tags: [Chat]
 *     summary: Get unread messages in a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Unread messages
 */
router.get('/messages/:conversationId/unread', messageController.getUnreadMessages);

/**
 * @openapi
 * /chat/messages/{conversationId}/search:
 *   get:
 *     tags: [Chat]
 *     summary: Search messages in a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Matching messages
 */
router.get('/messages/:conversationId/search', messageController.searchMessages);

/**
 * @openapi
 * /chat/messages/{conversationId}:
 *   get:
 *     tags: [Chat]
 *     summary: Get all messages in a conversation
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: List of messages
 */
router.get('/messages/:conversationId', messageController.getConversationMessages);

/**
 * @openapi
 * /chat/messages/{messageId}/read:
 *   put:
 *     tags: [Chat]
 *     summary: Mark a message as read
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.put('/messages/:messageId/read', messageController.markMessageAsRead);

/**
 * @openapi
 * /chat/messages/{conversationId}/read-all:
 *   put:
 *     tags: [Chat]
 *     summary: Mark all messages in a conversation as read
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: All messages marked as read
 */
router.put('/messages/:conversationId/read-all', messageController.markAllMessagesAsRead);

/**
 * @openapi
 * /chat/messages/{messageId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/messages/:messageId', messageController.deleteMessage);

/**
 * @openapi
 * /chat/messages/{messageId}/reaction:
 *   post:
 *     tags: [Chat]
 *     summary: Add a reaction to a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emoji]
 *             properties:
 *               emoji: { type: string }
 *     responses:
 *       200:
 *         description: Reaction added
 *   delete:
 *     tags: [Chat]
 *     summary: Remove a reaction from a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Reaction removed
 */
router.post('/messages/:messageId/reaction', messageController.addReaction);
router.delete('/messages/:messageId/reaction', messageController.removeReaction);

module.exports = router;
