const TeamChatRequest = require("../../models/TeamChatRequest.model");
const TeamConversation = require("../../models/TeamConversation.model");
const teamChatConversationService = require("./teamChatConversation.service");
const {
  assertSameCompanyPair,
  buildParticipantKey,
  populateParticipantSummary,
  resolveAndAssertCompanyContext,
  createHttpError,
} = require("../../helpers/teamChatAccess.helper");

const formatRequest = async (request, viewerUserId) => {
  const otherUserId =
    request.requesterId.toString() === viewerUserId.toString()
      ? request.targetUserId
      : request.requesterId;

  return {
    _id: request._id,
    companyId: request.companyId,
    requesterId: request.requesterId,
    targetUserId: request.targetUserId,
    status: request.status,
    conversationId: request.conversationId || null,
    respondedAt: request.respondedAt || null,
    otherParticipant: await populateParticipantSummary(otherUserId),
    createdAt: request.createdAt,
    updatedAt: request.updatedAt,
  };
};

const createRequest = async (currentUser, targetUserId, auth = null) =>
  teamChatConversationService.createOrGetConversation(currentUser, targetUserId, auth);

module.exports = {
  createRequest,
};
