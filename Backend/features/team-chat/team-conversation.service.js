const TeamConversation = require('./team-conversation.model');
const TeamMessage = require('./team-message.model');
const {
  resolveAndAssertCompanyContext,
  assertSameCompanyPair,
  buildParticipantKey,
  populateParticipantSummary,
  createHttpError,
  assertValidObjectId,
  assertConversationNotHiddenForUser,
} = require('../../helpers/team-chat-access.helpers');

const LAST_MESSAGE_DELETED_SENTINEL = '__DELETED__';

const getUnreadCountForUser = (conversation, userId) => {
  const unreadCountMap = conversation.unreadCount || new Map();
  if (typeof unreadCountMap.get === 'function') {
    return unreadCountMap.get(userId.toString()) || 0;
  }
  return unreadCountMap[userId.toString()] || 0;
};

const formatConversation = async (conversation, viewerUserId) => {
  const participantIds = conversation.participants.map((p) => p.toString());
  const otherUserId = participantIds.find((id) => id !== viewerUserId.toString());
  const last = conversation.lastMessage;
  const lastIsDeletedPreview = last?.text === LAST_MESSAGE_DELETED_SENTINEL;
  return {
    _id: conversation._id,
    companyId: conversation.companyId,
    participants: participantIds,
    otherParticipant: await populateParticipantSummary(otherUserId),
    lastMessage: last
      ? { text: lastIsDeletedPreview ? '' : last.text, senderId: last.senderId, timestamp: last.timestamp, isDeletedForEveryone: lastIsDeletedPreview }
      : null,
    unreadCount: getUnreadCountForUser(conversation, viewerUserId),
    status: conversation.status,
    updatedAt: conversation.updatedAt,
  };
};

const listConversations = async (currentUser, auth = null, options = {}) => {
  const companyId = await resolveAndAssertCompanyContext(currentUser, auth);
  const { page = 1, limit = 20 } = options;
  const query = { companyId, participants: currentUser._id, status: 'active', hiddenForParticipants: { $nin: [currentUser._id] } };
  const conversations = await TeamConversation.find(query).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await TeamConversation.countDocuments(query);
  return {
    conversations: await Promise.all(conversations.map((c) => formatConversation(c, currentUser._id))),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
  };
};

const getConversationById = async (currentUser, conversationId, auth = null) => {
  await resolveAndAssertCompanyContext(currentUser, auth);
  assertValidObjectId(conversationId, 'conversationId');
  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === currentUser._id.toString());
  if (!isParticipant) throw createHttpError('Unauthorized access to conversation', 403);
  assertConversationNotHiddenForUser(conversation, currentUser);
  return formatConversation(conversation, currentUser._id);
};

const hideConversationForCurrentUser = async (currentUser, conversationId, auth = null) => {
  await resolveAndAssertCompanyContext(currentUser, auth);
  assertValidObjectId(conversationId, 'conversationId');
  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === currentUser._id.toString());
  if (!isParticipant) throw createHttpError('Unauthorized access to conversation', 403);
  await conversation.hideForParticipant(currentUser._id);
  return { success: true, conversationId: String(conversation._id) };
};

const markConversationAsRead = async (currentUser, conversationId, auth = null) => {
  await resolveAndAssertCompanyContext(currentUser, auth);
  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === currentUser._id.toString());
  if (!isParticipant) throw createHttpError('Unauthorized access to conversation', 403);
  assertConversationNotHiddenForUser(conversation, currentUser);
  await TeamMessage.markConversationAsRead(conversationId, currentUser._id);
  await conversation.resetUnreadCount(currentUser._id);
  return conversationId;
};

const createOrGetConversation = async (currentUser, targetUserId, auth = null) => {
  const companyId = await assertSameCompanyPair(currentUser, targetUserId, auth);
  const currentUserId = currentUser._id.toString();
  const participantKey = buildParticipantKey(currentUserId, targetUserId);

  let conversation = await TeamConversation.findOne({ companyId, participantKey });
  if (conversation && conversation.status !== 'active') {
    conversation.status = 'active';
    await conversation.save();
  }

  if (!conversation) {
    try {
      conversation = await TeamConversation.create({
        companyId,
        participants: [currentUserId, targetUserId],
        participantKey,
        unreadCount: new Map([[currentUserId, 0], [targetUserId.toString(), 0]]),
        status: 'active',
      });
    } catch (error) {
      if (error?.code === 11000) {
        conversation = await TeamConversation.findOne({ companyId, participantKey });
      }
      if (!conversation) throw error;
    }
  }

  await TeamConversation.updateOne(
    { _id: conversation._id },
    { $pull: { hiddenForParticipants: currentUser._id }, $unset: { [`clearedAtForUsers.${currentUserId}`]: '', [`messageVisibilityCutoffByParticipant.${currentUserId}`]: '' } }
  );

  const refreshed = await TeamConversation.findById(conversation._id);
  if (!refreshed) throw createHttpError('Conversation not found', 404);
  return formatConversation(refreshed, currentUser._id);
};

const getTotalUnreadCount = async (currentUser, auth = null) => {
  const companyId = await resolveAndAssertCompanyContext(currentUser, auth);
  const conversations = await TeamConversation.find({ companyId, participants: currentUser._id, status: 'active', hiddenForParticipants: { $nin: [currentUser._id] } });
  return conversations.reduce((total, c) => total + getUnreadCountForUser(c, currentUser._id), 0);
};

module.exports = { listConversations, getConversationById, markConversationAsRead, hideConversationForCurrentUser, getTotalUnreadCount, createOrGetConversation, formatConversation };
