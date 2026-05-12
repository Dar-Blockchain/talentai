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
