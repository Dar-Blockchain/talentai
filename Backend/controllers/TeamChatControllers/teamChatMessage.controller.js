const teamChatMessageService = require("../../services/TeamChatServices/teamChatMessage.service");
const socket = require("../../socket");

const handleError = (res, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

module.exports.getConversationMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamChatMessageService.getConversationMessages(
      req.user,
      req.params.conversationId,
      req.auth,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 50,
      },
    );

    return res.status(200).json({
      success: true,
      data: data.messages,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error in getConversationMessages:", error);
    return handleError(res, error);
  }
};

module.exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;

    if (!conversationId || !receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "conversationId, receiverId, and text are required",
      });
    }

    const message = await teamChatMessageService.sendMessage(
      req.user,
      { conversationId, receiverId, text },
      req.auth,
    );

    try {
      const io = socket.getIO();
      const teamChatNamespace = io.of("/team-chat");

      teamChatNamespace
        .to(`team-conversation:${conversationId}`)
        .emit("new_team_message", { message, conversationId });

      teamChatNamespace.to(`user:${receiverId}`).emit("new_team_message", {
        message,
        conversationId,
      });
    } catch (socketError) {
      console.error("Team chat message socket emit failed:", socketError);
    }

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    return handleError(res, error);
  }
};
