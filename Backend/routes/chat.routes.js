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
router.get('/conversations/:conversationId', conversationController.getConversationById);
router.delete('/conversations/:conversationId', conversationController.deleteConversation);

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
 * /chat/messages/{messageId}:
 *   delete:
 *     tags: [Chat]
 *     summary: Delete a message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: scope
 *         schema: { type: string, enum: [me, everyone] }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router;
