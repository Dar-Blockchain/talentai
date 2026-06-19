const mongoose = require('mongoose');
const TeamConversation = require('./team-conversation.model');
const TeamMessage = require('./team-message.model');
const {
  resolveAndAssertCompanyContext,
  createHttpError,
  assertValidObjectId,
  assertConversationNotHiddenForUser,
  getClearedAtForUser,
} = require('../../utils/team-chat-guards');
const { detectContactSharing } = require('../../utils/contact-sharing-detector');

const LAST_MESSAGE_BLOCKED_PREVIEW = '[Not delivered]';
const LAST_MESSAGE_DELETED_SENTINEL = '__DELETED__';
const TEAM_MESSAGE_BODY_TOMBSTONE = '__TEAM_MESSAGE_DELETED__';

const formatMessage = (message) => {
  const delAll = !!message.isDeletedForEveryone;
  const blocked = !!message.deliveryBlocked;
  return {
    _id: message._id,
    conversationId: message.conversationId,
    companyId: message.companyId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: delAll ? '' : message.text,
    type: message.type,
    isRead: message.isRead,
    readAt: message.readAt || null,
    createdAt: message.createdAt,
    isDeletedForEveryone: delAll,
    deletedAt: message.deletedAt || null,
    deletedForEveryoneBy: message.deletedForEveryoneBy ? String(message.deletedForEveryoneBy) : undefined,
    deliveryBlocked: blocked,
    ...(blocked && message.blockedReason ? { blockedReason: message.blockedReason } : {}),
  };
};

const recomputeConversationLastMessage = async (conversationId) => {
  const newest = await TeamMessage.findOne({
    conversationId,
    $or: [{ isDeletedForEveryone: true }, { isDeleted: { $ne: true } }],
  }).sort({ createdAt: -1 }).lean();

  const conv = await TeamConversation.findById(conversationId);
  if (!conv) return;
  if (!newest) {
    await TeamConversation.updateOne({ _id: conversationId }, { $unset: { lastMessage: 1 } });
    return;
  }
  const previewText = newest.isDeletedForEveryone
    ? LAST_MESSAGE_DELETED_SENTINEL
    : newest.deliveryBlocked ? LAST_MESSAGE_BLOCKED_PREVIEW : newest.text;
  await conv.updateLastMessage({ text: previewText, senderId: newest.senderId, createdAt: newest.createdAt });
};

const getConversationMessages = async (currentUser, conversationId, auth = null, options = {}) => {
  await resolveAndAssertCompanyContext(currentUser, auth);
  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);
  const isParticipant = conversation.participants.some((p) => p.toString() === currentUser._id.toString());
  if (!isParticipant) throw createHttpError('Unauthorized access to conversation', 403);
  assertConversationNotHiddenForUser(conversation, currentUser);
  const since = getClearedAtForUser(conversation, currentUser._id);
  const result = await TeamMessage.getConversationMessages(conversationId, currentUser._id, since ? { ...options, since } : options);
  return { messages: result.messages.map(formatMessage), pagination: result.pagination };
};

const sendMessage = async (currentUser, { conversationId, receiverId, text }, auth = null) => {
  await resolveAndAssertCompanyContext(currentUser, auth);

  if (!text || !text.trim()) throw createHttpError('Message text is required', 400);
  if (text.trim() === TEAM_MESSAGE_BODY_TOMBSTONE) throw createHttpError('This message text is reserved by the system.', 400);

  const contactCheck = detectContactSharing(text);
  const conversation = await TeamConversation.findById(conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);
  if (conversation.status !== 'active') throw createHttpError('Cannot send message: conversation is not active', 403);

  const senderId = currentUser._id.toString();
  const isParticipant = conversation.participants.some((p) => p.toString() === senderId);
  if (!isParticipant) throw createHttpError('Unauthorized: Not a participant of this conversation', 403);
  assertConversationNotHiddenForUser(conversation, currentUser);

  const receiverIsParticipant = conversation.participants.some((p) => p.toString() === receiverId.toString());
  if (!receiverIsParticipant || receiverId.toString() === senderId) throw createHttpError('Invalid receiver for this conversation', 400);

  const message = await TeamMessage.create({
    conversationId,
    companyId: conversation.companyId,
    senderId,
    receiverId,
    text: text.trim(),
    type: 'text',
    isRead: false,
    deliveryBlocked: contactCheck.blocked,
    ...(contactCheck.blocked ? { blockedReason: contactCheck.reason } : {}),
  });

  if (!contactCheck.blocked) {
    await conversation.updateLastMessage({ text: message.text, senderId: message.senderId, createdAt: message.createdAt });
    await conversation.incrementUnreadCount(receiverId);
    await TeamConversation.updateOne({ _id: conversation._id }, { $pull: { hiddenForParticipants: receiverId } });
  } else {
    await conversation.updateLastMessage({ text: LAST_MESSAGE_BLOCKED_PREVIEW, senderId: message.senderId, createdAt: message.createdAt });
  }

  return formatMessage(message);
};

const deleteMessage = async (currentUser, messageId, scopeRaw, auth = null) => {
  await resolveAndAssertCompanyContext(currentUser, auth);
  assertValidObjectId(messageId, 'messageId');

  const scopeFirst = Array.isArray(scopeRaw) ? scopeRaw[0] : scopeRaw;
  const scope = String(scopeFirst || 'me').toLowerCase() === 'everyone' ? 'everyone' : 'me';

  const message = await TeamMessage.findById(messageId);
  if (!message) throw createHttpError('Message not found', 404);

  const conversation = await TeamConversation.findById(message.conversationId);
  if (!conversation) throw createHttpError('Conversation not found', 404);

  const isParticipant = conversation.participants.some((p) => p.toString() === currentUser._id.toString());
  if (!isParticipant) throw createHttpError('Unauthorized access to conversation', 403);

  if (scope === 'everyone') {
    if (message.senderId.toString() !== currentUser._id.toString()) throw createHttpError('Only the sender can delete this message for everyone', 403);
    if (message.isDeletedForEveryone) throw createHttpError('Message already deleted for everyone', 400);

    const convId = message.conversationId.toString();
    const updated = await TeamMessage.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(String(message._id)) },
      { $set: { isDeletedForEveryone: true, deletedAt: new Date(), deletedForEveryoneBy: new mongoose.Types.ObjectId(String(currentUser._id)), text: TEAM_MESSAGE_BODY_TOMBSTONE } }
    );
    if (updated.matchedCount === 0) throw createHttpError('Message not found', 404);

    await recomputeConversationLastMessage(convId);
    const fresh = await TeamMessage.findById(messageId).lean();
    if (!fresh) throw createHttpError('Message not found', 404);
    return { success: true, scope: 'everyone', messageId: String(message._id), conversationId: convId, message: formatMessage(fresh) };
  }

  if (!message.belongsToUser(currentUser._id)) throw createHttpError('Unauthorized: You can only delete messages you are part of', 403);

  const uid = new mongoose.Types.ObjectId(String(currentUser._id));
  const mid = new mongoose.Types.ObjectId(String(message._id));
  await TeamMessage.collection.updateOne({ _id: mid }, { $addToSet: { deletedBy: uid } });
  const after = await TeamMessage.findById(mid).select('deletedBy').lean();
  if (after && (after.deletedBy || []).length >= 2) {
    await TeamMessage.collection.updateOne({ _id: mid }, { $set: { isDeleted: true } });
  }

  return { success: true, scope: 'me', messageId: String(message._id), conversationId: String(message.conversationId) };
};

module.exports = { getConversationMessages, sendMessage, deleteMessage, formatMessage };
