const TeamChatRequest = require("../../models/TeamChatRequest.model");
const teamChatRequestService = require("../../services/TeamChatServices/teamChatRequest.service");
const teamChatConversationService = require("../../services/TeamChatServices/teamChatConversation.service");

const handleError = (res, error) => {
  const status = error.status || 500;
  return res.status(status).json({
    success: false,
    message: error.message || "Internal server error",
  });
};

const emitToUser = (userId, event, payload) => {
  if (!userId) {
    return;
  }

  try {
    const io = socket.getIO();
    io.of("/team-chat").to(`user:${userId}`).emit(event, payload);
  } catch (socketError) {
    console.error("Team chat socket emit failed:", socketError);
  }
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

module.exports.listIncomingRequests = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamChatRequestService.listIncomingRequests(
      req.user,
      req.auth,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      },
    );

    return res.status(200).json({
      success: true,
      data: data.requests,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error in listIncomingRequests:", error);
    return handleError(res, error);
  }
};

module.exports.listOutgoingRequests = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamChatRequestService.listOutgoingRequests(
      req.user,
      req.auth,
      {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
      },
    );

    return res.status(200).json({
      success: true,
      data: data.requests,
      pagination: data.pagination,
    });
  } catch (error) {
    console.error("Error in listOutgoingRequests:", error);
    return handleError(res, error);
  }
};

module.exports.acceptRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const existingRequest = await TeamChatRequest.findById(requestId).lean();
    const data = await teamChatRequestService.acceptRequest(
      req.user,
      requestId,
      req.auth,
    );

    if (existingRequest?.requesterId) {
      emitToUser(
        existingRequest.requesterId,
        "team_chat_request_accepted",
        data,
      );
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    return handleError(res, error);
  }
};

module.exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const existingRequest = await TeamChatRequest.findById(requestId).lean();
    const data = await teamChatRequestService.rejectRequest(req.user, requestId);

    if (existingRequest?.requesterId) {
      emitToUser(existingRequest.requesterId, "team_chat_request_rejected", {
        requestId,
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in rejectRequest:", error);
    return handleError(res, error);
  }
};
