const Message = require('../../models/Message.model');
const Conversation = require('../../models/Conversations.model');
const User = require('../../models/User.model');

/**
 * Send a new message
 */
module.exports.sendMessage = async (conversationId, senderId, receiverId, text, options = {}) => {
  try {
    const { type = 'text', attachment = null, replyTo = null } = options;

    // Validate message content - block emails and phone numbers
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,4}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{1,4}[\s-]?\d{1,9}|\d{10,}/;

    if (emailPattern.test(text)) {
      throw new Error('You cannot share email addresses in messages. Please use the platform\'s communication features.');
    }

    if (phonePattern.test(text)) {
      throw new Error('You cannot share phone numbers in messages. Please use the platform\'s communication features.');
    }

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

    // Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text,
      type,
      attachment,
      replyTo,
      status: 'sent',
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

    // Update conversation's last message
    await conversation.updateLastMessage({
      text,
      sender: senderId,
      createdAt: message.createdAt,
    });

    // Increment unread count for receiver
    await conversation.incrementUnreadCount(receiverId);

    return message;
  } catch (error) {
    console.error('Error in sendMessage service:', error);
    throw error;
  }
};

/**
 * Get messages for a conversation
 */
module.exports.getConversationMessages = async (conversationId, userId, options = {}) => {
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

    // Get messages
    const result = await Message.getConversationMessages(conversationId, userId, options);

    return result;
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
 * Delete message for user
 * If user is a Company, delete for both participants (hard delete)
 * If user is a Candidate, only soft delete for themselves
 */
module.exports.deleteMessage = async (messageId, userId) => {
  try {
    const message = await Message.findById(messageId).populate('sender receiver');

    if (!message) {
      throw new Error('Message not found');
    }

    // Verify user is sender or receiver
    if (!message.belongsToUser(userId)) {
      throw new Error('Unauthorized: You can only delete your own messages');
    }

    // Get the user to check their role
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // If user is a Company, perform hard delete for both users
    if (user.role === 'Company') {
      // Mark message as fully deleted and add both participants to deletedBy
      message.isDeleted = true;
      message.deletedBy = [message.sender._id, message.receiver._id];
      await message.save();

      console.log(`Company ${userId} deleted message ${messageId} for both participants`);
      return { success: true, message: 'Message deleted successfully for all participants' };
    }
    // If user is a Candidate, only soft delete for themselves
    else {
      await message.deleteForUser(userId);

      console.log(`Candidate ${userId} deleted message ${messageId} for themselves only`);
      return { success: true, message: 'Message deleted successfully' };
    }
  } catch (error) {
    console.error('Error in deleteMessage service:', error);
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
