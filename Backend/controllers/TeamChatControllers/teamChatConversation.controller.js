const teamChatConversationService = require("../../services/TeamChatServices/teamChatConversation.service");

const handleError = (res, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports.listConversations = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamChatConversationService.listConversations(
      req.user,
      req.auth,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      },
    );

    return res.status(200).json({
      success: true,
      data: data.conversations,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error in listConversations:", error);
    return handleError(res, error);
  }
};

module.exports.getConversationById = async (req, res) => {
  try {
    const data = await teamChatConversationService.getConversationById(
      req.user,
      req.params.conversationId,
      req.auth,
    );

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in getConversationById:", error);
    return handleError(res, error);
  }
};

module.exports.markConversationAsRead = async (req, res) => {
  try {
    await teamChatConversationService.markConversationAsRead(
      req.user,
      req.params.conversationId,
      req.auth,
    );

    return res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Error in markConversationAsRead:", error);
    return handleError(res, error);
  }
};

module.exports.getTotalUnreadCount = async (req, res) => {
  try {
    const totalUnread = await teamChatConversationService.getTotalUnreadCount(
      req.user,
      req.auth,
    );

    return res.status(200).json({
      success: true,
      data: { totalUnread },
    });
  } catch (error) {
    console.error("Error in getTotalUnreadCount:", error);
    return handleError(res, error);
  }
};

/**
 * DELETE /team-chat/conversations/:conversationId
 * POST /team-chat/conversations/:conversationId/hide-for-me
 * Removes the chat from the current user's list only.
 */
module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();

    const result = await teamChatConversationService.hideConversationForCurrentUser(
      req.user,
      conversationId,
      req.auth,
    );

    try {
      const socket = require("../../socket");
      const io = socket.getIO();
      const teamChatNamespace = io.of("/team-chat");
      teamChatNamespace.to(`user:${userId}`).emit("team_conversation_hidden", {
        conversationId: result.conversationId,
        hiddenBy: userId,
      });
    } catch (socketError) {
      console.error("Team chat conversation hide socket emit failed:", socketError);
    }

    return res.status(200).json({
      success: true,
      message: "Conversation removed from your list",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteConversation:", error);
    return handleError(res, error);
  }
};
