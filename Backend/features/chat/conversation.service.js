const Conversation = require('./conversation.model');
const Message = require('./message.model');
const User = require('../users/user.model');

module.exports.findOrCreateConversation = async (candidateId, companyId, relatedPost = null) => {
  try {
    return await Conversation.findOrCreateConversation(candidateId, companyId, relatedPost);
  } catch (error) {
    throw error;
  }
};

module.exports.getUserConversations = async (userId, options = {}) => {
  try {
    const result = await Conversation.getUserConversations(userId, options);
    result.conversations = result.conversations.map((conv) => {
      const unreadCountMap = conv.unreadCount || {};
      return { ...conv, unreadCount: unreadCountMap[userId.toString()] || 0 };
    });
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports.getConversationById = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId)
      .populate({ path: 'participants', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
      .populate({ path: 'lastMessage.sender', select: 'email profile', populate: { path: 'profile', select: 'firstName lastName type companyDetails.name' } })
      .lean();

    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p._id.toString() === userId.toString());
    if (!isParticipant) throw new Error('Unauthorized access to conversation');

    const unreadCountMap = conversation.unreadCount || {};
    conversation.unreadCount = unreadCountMap[userId.toString()] || 0;
    return conversation;
  } catch (error) {
    throw error;
  }
};

module.exports.markConversationAsRead = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) throw new Error('Unauthorized access to conversation');

    await conversation.resetUnreadCount(userId);
    await Message.markAsRead(conversationId, userId);
    return conversation;
  } catch (error) {
    throw error;
  }
};

module.exports.deleteConversation = async (conversationId, userId) => {
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const isParticipant = conversation.participants.some((p) => p.toString() === userId.toString());
    if (!isParticipant) throw new Error('Unauthorized access to conversation');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.role === 'Company') {
      await Message.updateMany(
        { conversation: conversationId },
        { $set: { isDeleted: true, deletedBy: conversation.participants } }
      );
      await Conversation.findByIdAndDelete(conversationId);
      return { success: true, message: 'Conversation deleted successfully for all participants' };
    } else {
      await conversation.archiveForUser(userId);
      await Message.updateMany({ conversation: conversationId }, { $addToSet: { deletedBy: userId } });
      return { success: true, message: 'Conversation deleted successfully' };
    }
  } catch (error) {
    throw error;
  }
};

module.exports.getTotalUnreadCount = async (userId) => {
  try {
    return await Conversation.getTotalUnreadCount(userId);
  } catch (error) {
    throw error;
  }
};
