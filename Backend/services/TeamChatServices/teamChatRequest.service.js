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

const listIncomingRequests = async (currentUser, auth = null, options = {}) => {
  const companyId = await resolveAndAssertCompanyContext(currentUser, auth);

  const { page = 1, limit = 20 } = options;
  const query = {
    companyId,
    targetUserId: currentUser._id,
    status: "pending",
  };

  const requests = await TeamChatRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await TeamChatRequest.countDocuments(query);

  return {
    requests: await Promise.all(
      requests.map((request) => formatRequest(request, currentUser._id)),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const listOutgoingRequests = async (currentUser, auth = null, options = {}) => {
  const companyId = await resolveAndAssertCompanyContext(currentUser, auth);

  const { page = 1, limit = 20 } = options;
  const query = {
    companyId,
    requesterId: currentUser._id,
  };

  const requests = await TeamChatRequest.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await TeamChatRequest.countDocuments(query);

  return {
    requests: await Promise.all(
      requests.map((request) => formatRequest(request, currentUser._id)),
    ),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const acceptRequest = async (currentUser, requestId, auth = null) => {
  const request = await TeamChatRequest.findById(requestId);
  if (!request) {
    throw createHttpError("Chat request not found", 404);
  }

  if (request.targetUserId.toString() !== currentUser._id.toString()) {
    throw createHttpError("Only the recipient can accept this chat request", 403);
  }

  if (request.status !== "pending") {
    throw createHttpError("Only pending chat requests can be accepted", 400);
  }

  await assertSameCompanyPair(currentUser, request.requesterId, auth);

  let conversation = await TeamConversation.findOne({
    companyId: request.companyId,
    participantKey: request.participantKey,
  });

  if (!conversation) {
    conversation = await TeamConversation.create({
      companyId: request.companyId,
      participants: [request.requesterId, request.targetUserId],
      participantKey: request.participantKey,
      requestId: request._id,
      unreadCount: new Map([
        [request.requesterId.toString(), 0],
        [request.targetUserId.toString(), 0],
      ]),
      status: "active",
    });
  }

  request.status = "accepted";
  request.conversationId = conversation._id;
  request.respondedAt = new Date();
  await request.save();

  return {
    request: {
      _id: request._id,
      status: request.status,
      conversationId: request.conversationId,
      respondedAt: request.respondedAt,
    },
    conversation: {
      _id: conversation._id,
      companyId: conversation.companyId,
      participants: conversation.participants,
      unreadCount: 0,
      updatedAt: conversation.updatedAt,
    },
  };
};

const rejectRequest = async (currentUser, requestId) => {
  const request = await TeamChatRequest.findById(requestId);
  if (!request) {
    throw createHttpError("Chat request not found", 404);
  }

  if (request.targetUserId.toString() !== currentUser._id.toString()) {
    throw createHttpError("Only the recipient can reject this chat request", 403);
  }

  if (request.status !== "pending") {
    throw createHttpError("Only pending chat requests can be rejected", 400);
  }

  request.status = "rejected";
  request.respondedAt = new Date();
  await request.save();

  return {
    _id: request._id,
    status: request.status,
    respondedAt: request.respondedAt,
  };
};

module.exports = {
  createRequest,
  listIncomingRequests,
  listOutgoingRequests,
  acceptRequest,
  rejectRequest,
};
