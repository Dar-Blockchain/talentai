const mongoose = require('mongoose');
const Message = require('./message.model');
const Conversation = require('./conversation.model');
const { detectContactSharing } = require('../../helpers/messageContactPolicy');

const LAST_MESSAGE_BLOCKED_PREVIEW = '[Not delivered]';
const LAST_MESSAGE_DELETED_SENTINEL = '__DELETED__';
const MESSAGE_BODY_TOMBSTONE = '__CHAT_MESSAGE_DELETED__';

async function recomputeConversationLastMessage(conversationId) {
  const newest = await Message.findOne({
    conversation: conversationId,
    $or: [{ isDeletedForEveryone: true }, { isDeleted: { $ne: true } }],
  }).sort({ createdAt: -1 }).lean();

  const conv = await Conversation.findById(conversationId);
  if (!conv) return;
  if (!newest) {
    conv.lastMessage = undefined;
    await conv.save();
    return;
  }
  const previewText = newest.isDeletedForEveryone
    ? LAST_MESSAGE_DELETED_SENTINEL
    : newest.deliveryBlocked ? LAST_MESSAGE_BLOCKED_PREVIEW : newest.text;
  await conv.updateLastMessage({ text: previewText, sender: newest.sender, createdAt: newest.createdAt });
  conv.messageCount = Math.max(0, (conv.messageCount || 1) - 1);
  await conv.save();
}

module.exports.sendMessage = async (conversationId, senderId, receiverId, text, options = {}) => {
  try {
    const { type = 'text', attachment = null, replyTo = null } = options;
    const contactCheck = detectContactSharing(text);

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.toString() === senderId.toString());
    if (!isParticipant) throw new Error('Unauthorized: Not a participant of this conversation');
    if (conversation.status === 'blocked') throw new Error('Cannot send message: Conversation is blocked');

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text, type, attachment, replyTo,
      status: 'sent',
      deliveryBlocked: contactCheck.blocked,
      ...(contactCheck.blocked ? { blockedReason: contactCheck.reason } : {}),
    });

    const populateUser = (path) => ({ path, select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } });
    await message.populate(populateUser('sender'));
    await message.populate(populateUser('receiver'));
    if (replyTo) {
      await message.populate({ path: 'replyTo', select: 'text sender createdAt', populate: populateUser('sender') });
    }

    if (!contactCheck.blocked) {
      await conversation.updateLastMessage({ text, sender: senderId, createdAt: message.createdAt });
      await conversation.incrementUnreadCount(receiverId);
    } else {
      await conversation.updateLastMessage({ text: LAST_MESSAGE_BLOCKED_PREVIEW, sender: senderId, createdAt: message.createdAt });
    }

    return message;
  } catch (error) {
    throw error;
  }
};

function formatMessageForClient(message) {
  if (!message) return message;
  const delEveryone = !!message.isDeletedForEveryone;
  return {
    ...message,
    text: delEveryone ? '' : message.text,
    isDeletedForEveryone: delEveryone,
    deletedAt: message.deletedAt || null,
    deletedForEveryoneBy: message.deletedForEveryoneBy ? String(message.deletedForEveryoneBy) : undefined,
  };
}

module.exports.getConversationMessages = async (conversationId, userId, options = {}) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) throw new Error('Unauthorized access to messages');

    const result = await Message.getConversationMessages(conversationId, userId, options);
    return { ...result, messages: (result.messages || []).map(formatMessageForClient) };
  } catch (error) {
    throw error;
  }
};

module.exports.deleteMessage = async (messageId, userId, options = {}) => {
  try {
    const rawScope = options.scope;
    const scope = String(rawScope || 'me').toLowerCase() === 'everyone' ? 'everyone' : 'me';

    const message = await Message.findById(messageId);
    if (!message) throw new Error('Message not found');
    if (!message.belongsToUser(userId)) throw new Error('Unauthorized: You can only delete messages you are part of');

    const conversationId = String(message.conversation);

    if (scope === 'everyone') {
      const senderId = (message.sender?._id ?? message.sender)?.toString();
      if (senderId !== userId.toString()) {
        const err = new Error('Only the sender can delete this message for everyone');
        err.status = 403;
        throw err;
      }
      if (message.isDeletedForEveryone) {
        return { success: true, scope: 'everyone', messageId: String(message._id), conversationId, message: formatMessageForClient(message.toObject ? message.toObject() : message) };
      }

      await Message.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(String(message._id)) },
        { $set: { isDeletedForEveryone: true, deletedAt: new Date(), deletedForEveryoneBy: new mongoose.Types.ObjectId(String(userId)), text: MESSAGE_BODY_TOMBSTONE } }
      );

      await recomputeConversationLastMessage(conversationId);
      const fresh = await Message.findById(messageId).lean();
      return { success: true, scope: 'everyone', messageId: String(message._id), conversationId, message: formatMessageForClient(fresh) };
    }

    await message.deleteForUser(userId);
    return { success: true, scope: 'me', messageId: String(message._id), conversationId };
  } catch (error) {
    throw error;
  }
};
