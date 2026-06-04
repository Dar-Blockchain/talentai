const teamChatConversationService = require("../../services/TeamChatServices/teamChatConversation.service");

const handleError = (res, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports.createRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "targetUserId is required",
      });
    }

    const data = await teamChatConversationService.createOrGetConversation(
      req.user,
      targetUserId,
      req.auth,
    );

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error("Error in createRequest:", error);
    return handleError(res, error);
  }
};
