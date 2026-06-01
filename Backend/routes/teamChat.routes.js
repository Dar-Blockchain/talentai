const express = require("express");
const router = express.Router();
const teamChatRequestController = require("../controllers/TeamChatControllers/teamChatRequest.controller");
const teamChatConversationController = require("../controllers/TeamChatControllers/teamChatConversation.controller");
const teamChatMessageController = require("../controllers/TeamChatControllers/teamChatMessage.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const { controledAcces } = require("../middleware/authorize.middleware");

router.use(requireAuth, controledAcces(["Company", "Employee"]));

/**
 * @openapi
 * /team-chat/requests:
 *   post:
 *     tags: [Team Chat]
 *     summary: Create a team chat connection request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientId]
 *             properties:
 *               recipientId: { type: string }
 *     responses:
 *       201:
 *         description: Request created
 */
router.post("/requests", teamChatRequestController.createRequest);

/**
 * @openapi
 * /team-chat/conversations:
 *   get:
 *     tags: [Team Chat]
 *     summary: List all team chat conversations for current user
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get("/conversations", teamChatConversationController.listConversations);

/**
 * @openapi
 * /team-chat/unread-count:
 *   get:
 *     tags: [Team Chat]
 *     summary: Get total unread count in team chat
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get("/unread-count", teamChatConversationController.getTotalUnreadCount);

/**
 * @openapi
 * /team-chat/conversations/{conversationId}:
 *   get:
 *     tags: [Team Chat]
 *     summary: Get a team chat conversation by ID
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Conversation details
 */
router.get(
  "/conversations/:conversationId",
  teamChatConversationController.getConversationById,
);

/**
 * @openapi
 * /team-chat/conversations/{conversationId}/read:
 *   put:
 *     tags: [Team Chat]
 *     summary: Mark a team chat conversation as read
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Marked as read
 */
router.put(
  "/conversations/:conversationId/read",
  teamChatConversationController.markConversationAsRead,
);

/**
 * @openapi
 * /team-chat/conversations/{conversationId}/hide-for-me:
 *   post:
 *     tags: [Team Chat]
 *     summary: Hide conversation for current user only
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Hidden for current user
 */
router.post(
  "/conversations/:conversationId/hide-for-me",
  teamChatConversationController.deleteConversation,
);

/**
 * @openapi
 * /team-chat/messages/{messageId}:
 *   delete:
 *     tags: [Team Chat]
 *     summary: Delete a team chat message
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Message deleted
 */
router.delete("/messages/:messageId", teamChatMessageController.deleteMessage);

/**
 * @openapi
 * /team-chat/messages/{conversationId}:
 *   get:
 *     tags: [Team Chat]
 *     summary: Get messages in a team chat conversation
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
 *         description: Messages list
 */
router.get(
  "/messages/:conversationId",
  teamChatMessageController.getConversationMessages,
);

/**
 * @openapi
 * /team-chat/messages:
 *   post:
 *     tags: [Team Chat]
 *     summary: Send a team chat message
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
router.post("/messages", teamChatMessageController.sendMessage);

module.exports = router;
