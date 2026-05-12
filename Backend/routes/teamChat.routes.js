const express = require("express");
const router = express.Router();
const teamChatRequestController = require("../controllers/TeamChatControllers/teamChatRequest.controller");
const teamChatConversationController = require("../controllers/TeamChatControllers/teamChatConversation.controller");
const teamChatMessageController = require("../controllers/TeamChatControllers/teamChatMessage.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const { controledAcces } = require("../middleware/authorize.middleware");

router.use(requireAuth, controledAcces(["Company", "Employee"]));

router.post("/requests", teamChatRequestController.createRequest);
router.get("/requests/incoming", teamChatRequestController.listIncomingRequests);
router.get("/requests/outgoing", teamChatRequestController.listOutgoingRequests);
router.post("/requests/:requestId/accept", teamChatRequestController.acceptRequest);
router.post("/requests/:requestId/reject", teamChatRequestController.rejectRequest);

router.get("/conversations", teamChatConversationController.listConversations);
router.get("/unread-count", teamChatConversationController.getTotalUnreadCount);
router.get(
  "/conversations/:conversationId",
  teamChatConversationController.getConversationById,
);
router.put(
  "/conversations/:conversationId/read",
  teamChatConversationController.markConversationAsRead,
);

router.get(
  "/messages/:conversationId",
  teamChatMessageController.getConversationMessages,
);
router.post("/messages", teamChatMessageController.sendMessage);

module.exports = router;
