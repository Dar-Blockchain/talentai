const Conversation = require('../../models/Conversations.model');
const Message = require('../../models/Message.model');
const User = require('../../models/User.model');

/**
 * Find or create a conversation between candidate and company
 */
module.exports.findOrCreateConversation = async (candidateId, companyId, relatedPost = null) => {
  try {
    const conversation = await Conversation.findOrCreateConversation(
      candidateId,
      companyId,
      relatedPost
    );

    return conversation;
  } catch (error) {
    console.error('Error in findOrCreateConversation service:', error);
    throw error;
  }
};

/**
 * Get user's conversations with pagination
 */
module.exports.getUserConversations = async (userId, options = {}) => {
  try {
    const result = await Conversation.getUserConversations(userId, options);

    // Add unread count for each conversation (handle Map object from lean())
    result.conversations = result.conversations.map((conv) => {
      const unreadCountMap = conv.unreadCount || {};
      const unreadCount = unreadCountMap[userId.toString()] || 0;
      return {
        ...conv,
        unreadCount,
      };
    });

    return result;
  } catch (error) {
    console.error('Error in getUserConversations service:', error);
    throw error;
  }
};

/**
 * Get single conversation by ID
 */
module.exports.getConversationById = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({
        path: 'participants',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName type companyDetails.name',
        },
      })
      .populate({
        path: 'lastMessage.sender',
        select: 'email profile',
        populate: {
          path: 'profile',
          select: 'firstName lastName type companyDetails.name',
        },
      })
      .lean();

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      (p) => p._id.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized access to conversation');
    }

    // Add unread count (handle Map object from lean())
    const unreadCountMap = conversation.unreadCount || {};
    conversation.unreadCount = unreadCountMap[userId.toString()] || 0;

    return conversation;
  } catch (error) {
    console.error('Error in getConversationById service:', error);
    throw error;
  }
};

/**
 * Mark conversation as read
 */
module.exports.markConversationAsRead = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized access to conversation');
    }

    // Reset unread count
    await conversation.resetUnreadCount(userId);

    // Mark all messages as read
    await Message.markAsRead(conversationId, userId);

    return conversation;
  } catch (error) {
    console.error('Error in markConversationAsRead service:', error);
    throw error;
  }
};

/**
 * Delete conversation for user
 * If user is a Company, delete conversation and all messages for both participants
 * If user is a Candidate, only soft delete for themselves
 */
module.exports.deleteConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    // Verify user is participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === userId.toString()
    );

    if (!isParticipant) {
      throw new Error('Unauthorized access to conversation');
    }

    // Get the user to check their role
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // If user is a Company, perform hard delete for both users
    if (user.role === 'Company') {
      // Mark all messages in conversation as fully deleted for both users
      await Message.updateMany(
        { conversation: conversationId },
        {
          $set: {
            isDeleted: true,
            deletedBy: conversation.participants,
          },
        }
      );

      // Delete the conversation itself
      await Conversation.findByIdAndDelete(conversationId);

      console.log(`Company ${userId} deleted conversation ${conversationId} for both participants`);
      return { success: true, message: 'Conversation deleted successfully for all participants' };
    }
    // If user is a Candidate, only soft delete for themselves
    else {
      // Archive conversation for this user
      await conversation.archiveForUser(userId);

      // Soft delete all messages for this user
      await Message.updateMany(
        { conversation: conversationId },
        { $addToSet: { deletedBy: userId } }
      );

      console.log(`Candidate ${userId} deleted conversation ${conversationId} for themselves only`);
      return { success: true, message: 'Conversation deleted successfully' };
    }
  } catch (error) {
    console.error('Error in deleteConversation service:', error);
    throw error;
  }
};

/**
 * Get total unread count for user
 */
module.exports.getTotalUnreadCount = async (userId) => {
  try {
    const totalUnread = await Conversation.getTotalUnreadCount(userId);
    return totalUnread;
  } catch (error) {
    console.error('Error in getTotalUnreadCount service:', error);
    throw error;
  }
};
