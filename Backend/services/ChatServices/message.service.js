const mongoose = require('mongoose');
const Message = require('../../models/Message.model');
const Conversation = require('../../models/Conversations.model');
const { detectContactSharing } = require('../../helpers/messageContactPolicy');

const LAST_MESSAGE_BLOCKED_PREVIEW = '[Not delivered]';
/** Sidebar preview sentinel when newest visible row is "deleted for everyone". */
const LAST_MESSAGE_DELETED_SENTINEL = '__DELETED__';
/** Non-empty body stored on disk after delete-for-everyone (schema requires text). */
const MESSAGE_BODY_TOMBSTONE = '__CHAT_MESSAGE_DELETED__';

/**
 * Recompute `lastMessage` on a conversation after a deletion. Mirrors
 * team-chat's `recomputeConversationLastMessage` so sidebars stay in sync
 * (e.g. when the newest message gets deleted for everyone).
 */
async function recomputeConversationLastMessage(conversationId) {
  const newest = await Message.findOne({
    conversation: conversationId,
    $or: [
      { isDeletedForEveryone: true },
      { isDeleted: { $ne: true } },
    ],
  })
    .sort({ createdAt: -1 })
    .lean();
  const conv = await Conversation.findById(conversationId);
  if (!conv) return;
  if (!newest) {
    conv.lastMessage = undefined;
    await conv.save();
    return;
  }
  const previewText = newest.isDeletedForEveryone
    ? LAST_MESSAGE_DELETED_SENTINEL
    : newest.deliveryBlocked
      ? LAST_MESSAGE_BLOCKED_PREVIEW
      : newest.text;
  await conv.updateLastMessage({
    text: previewText,
    sender: newest.sender,
    createdAt: newest.createdAt,
  });
  // updateLastMessage increments messageCount; undo (we didn't add a new row).
  conv.messageCount = Math.max(0, (conv.messageCount || 1) - 1);
  await conv.save();
}

/**
 * Send a new message
 */
module.exports.sendMessage = async (conversationId, senderId, receiverId, text, options = {}) => {
  try {
    const { type = 'text', attachment = null, replyTo = null } = options;
    const contactCheck = detectContactSharing(text);

    // Verify conversation exists and user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized: Not a participant of this conversation');
    }

    // Check if conversation is blocked
    if (conversation.status === 'blocked') {
      throw new Error('Cannot send message: Conversation is blocked');
    }

    // Create message (contact sharing: saved for sender, not delivered to peer)
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text,
      type,
      attachment,
      replyTo,
      status: 'sent',
      deliveryBlocked: contactCheck.blocked,
      ...(contactCheck.blocked ? { blockedReason: contactCheck.reason } : {}),
    });

    // Populate sender and receiver with profile for firstName/lastName
    await message.populate({
      path: 'sender',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    });
    await message.populate({
      path: 'receiver',
      select: 'email profile',
      populate: {
        path: 'profile',
        select: 'firstName lastName type companyDetails.name',
      },
    });

    if (replyTo) {
      await message.populate({
        path: 'replyTo',
        select: 'text sender createdAt',
        populate: {
          path: 'sender',
          select: 'email profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName type companyDetails.name',
          },
        },
      });
    }

    if (!contactCheck.blocked) {
      await conversation.updateLastMessage({
        text,
        sender: senderId,
        createdAt: message.createdAt,
      });
      await conversation.incrementUnreadCount(receiverId);
    } else {
      await conversation.updateLastMessage({
        text: LAST_MESSAGE_BLOCKED_PREVIEW,
        sender: senderId,
        createdAt: message.createdAt,
      });
    }

    return message;
  } catch (error) {
    console.error('Error in sendMessage service:', error);
    throw error;
  }
};

/**
 * Sanitize a raw lean Message document before returning it to the client:
 * blank out the body when the row is a delete-for-everyone tombstone and
 * surface the boolean flag so the UI can render a placeholder row.
 */
function formatMessageForClient(message) {
  if (!message) return message;
  const delEveryone = !!message.isDeletedForEveryone;
  return {
    ...message,
    text: delEveryone ? '' : message.text,
    isDeletedForEveryone: delEveryone,
    deletedAt: message.deletedAt || null,
    deletedForEveryoneBy: message.deletedForEveryoneBy
      ? String(message.deletedForEveryoneBy)
      : undefined,
  };
}

/**
 * Get messages for a conversation
 */
module.exports.getConversationMessages = async (conversationId, userId, options = {}) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized access to messages');
    }

    const result = await Message.getConversationMessages(conversationId, userId, options);

    return {
      ...result,
      messages: (result.messages || []).map(formatMessageForClient),
    };
  } catch (error) {
    console.error('Error in getConversationMessages service:', error);
    throw error;
  }
};

/**
 * Mark message as read
 */
module.exports.markMessageAsRead = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user is the receiver
    if (message.receiver.toString() !== userId.toString()) {
      throw new Error('Unauthorized: Only receiver can mark as read');
    }

    if (!message.isRead) {
      await message.markRead();
    }

    return message;
  } catch (error) {
    console.error('Error in markMessageAsRead service:', error);
    throw error;
  }
};

/**
 * Mark all messages in conversation as read
 */
module.exports.markAllMessagesAsRead = async (conversationId, userId) => {
  try {
    const result = await Message.markAsRead(conversationId, userId);
    return result;
  } catch (error) {
    console.error('Error in markAllMessagesAsRead service:', error);
    throw error;
  }
};

/**
 * Delete message (WhatsApp / team-chat style; applies to company ↔ candidate chat).
 *
 * - `scope=me`     → soft delete for the caller only (any participant).
 * - `scope=everyone` → tombstone for both participants. Allowed only for the
 *                      sender. Body is replaced by a non-empty sentinel so
 *                      Mongoose's `text: required` constraint holds; the
 *                      `getConversationMessages` formatter blanks it before
 *                      sending it to the client.
 *
 * Returns `{ scope, messageId, conversationId, message? }`. When the scope is
 * "everyone", `message` carries the formatted tombstone row so the controller
 * can broadcast it via WebSocket and clients can replace the row in-place
 * (instead of removing it). This mirrors team-chat exactly.
 */
module.exports.deleteMessage = async (messageId, userId, options = {}) => {
  try {
    const rawScope = options.scope;
    const scope =
      String(rawScope || "me").toLowerCase() === "everyone" ? "everyone" : "me";

    const message = await Message.findById(messageId);
    if (!message) {
      throw new Error("Message not found");
    }

    if (!message.belongsToUser(userId)) {
      throw new Error("Unauthorized: You can only delete messages you are part of");
    }

    const conversationId = String(message.conversation);

    if (scope === "everyone") {
      const senderId =
        (message.sender && message.sender._id ? message.sender._id : message.sender)?.toString();
      if (senderId !== userId.toString()) {
        const err = new Error("Only the sender can delete this message for everyone");
        err.status = 403;
        throw err;
      }
      if (message.isDeletedForEveryone) {
        return {
          success: true,
          scope: "everyone",
          messageId: String(message._id),
          conversationId,
          message: formatMessageForClient(message.toObject ? message.toObject() : message),
        };
      }

      // Use the native collection driver to bypass Mongoose validation of
      // required `text`; we still write a non-empty sentinel so any code that
      // accidentally reads the raw body sees something predictable.
      await Message.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(String(message._id)) },
        {
          $set: {
            isDeletedForEveryone: true,
            deletedAt: new Date(),
            deletedForEveryoneBy: new mongoose.Types.ObjectId(String(userId)),
            text: MESSAGE_BODY_TOMBSTONE,
          },
        },
      );

      await recomputeConversationLastMessage(conversationId);

      const fresh = await Message.findById(messageId).lean();
      return {
        success: true,
        scope: "everyone",
        messageId: String(message._id),
        conversationId,
        message: formatMessageForClient(fresh),
      };
    }

    // scope = "me": per-user soft delete. If both participants have hidden the
    // message, mark it fully deleted so it falls out of every query.
    await message.deleteForUser(userId);

    return {
      success: true,
      scope: "me",
      messageId: String(message._id),
      conversationId,
    };
  } catch (error) {
    console.error("Error in deleteMessage service:", error);
    throw error;
  }
};

/**
 * Get unread messages for user in conversation
 */
module.exports.getUnreadMessages = async (conversationId, userId) => {
  try {
    const messages = await Message.getUnreadMessages(conversationId, userId);
    return messages;
  } catch (error) {
    console.error('Error in getUnreadMessages service:', error);
    throw error;
  }
};

/**
 * Search messages in conversation
 */
module.exports.searchMessages = async (conversationId, searchTerm, userId) => {
  try {
    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized access to messages');
    }

    const messages = await Message.searchMessages(conversationId, searchTerm, userId);

    return messages;
  } catch (error) {
    console.error('Error in searchMessages service:', error);
    throw error;
  }
};

/**
 * Add reaction to message
 */
module.exports.addReaction = async (messageId, userId, emoji) => {
  try {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user has access to this message
    if (!message.belongsToUser(userId)) {
      throw new Error('Unauthorized: Cannot react to this message');
    }

    await message.addReaction(userId, emoji);

    return message;
  } catch (error) {
    console.error('Error in addReaction service:', error);
    throw error;
  }
};

/**
 * Remove reaction from message
 */
module.exports.removeReaction = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new Error('Message not found');
    }

    await message.removeReaction(userId);

    return message;
  } catch (error) {
    console.error('Error in removeReaction service:', error);
    throw error;
  }
};

/**
 * Mark message as delivered
 */
module.exports.markMessageAsDelivered = async (messageId) => {
  try {
    const message = await Message.markAsDelivered(messageId);
    return message;
  } catch (error) {
    console.error('Error in markMessageAsDelivered service:', error);
    throw error;
  }
};

/**
 * Get message by ID
 */
module.exports.getMessageById = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId)
      .populate({
        path: 'sender',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName type companyDetails.name',
        },
      })
      .populate({
        path: 'receiver',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName type companyDetails.name',
        },
      })
      .populate({
        path: 'replyTo',
        select: 'text sender createdAt',
        populate: {
          path: 'sender',
          select: 'email profile',
          populate: {
            path: 'profile',
            select: 'firstName lastName type companyDetails.name',
          },
        },
      })
      .lean();

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user has access
    if (
      message.sender._id.toString() !== userId.toString() &&
      message.receiver._id.toString() !== userId.toString()
    ) {
      throw new Error('Unauthorized access to message');
    }

    return message;
  } catch (error) {
    console.error('Error in getMessageById service:', error);
    throw error;
  }
};
