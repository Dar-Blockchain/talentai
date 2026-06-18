const teamConversationService = require('./team-conversation.service');
const TeamConversation = require('./team-conversation.model');
const socket = require('../../socket');

const handleError = (res, error) => {
  return res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
};

module.exports.listConversations = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamConversationService.listConversations(req.user, req.auth, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    return res.status(200).json({ success: true, data: data.conversations, pagination: data.pagination });
  } catch (error) {
    console.error('Error in listConversations:', error);
    return handleError(res, error);
  }
};

module.exports.getConversationById = async (req, res) => {
  try {
    const data = await teamConversationService.getConversationById(req.user, req.params.conversationId, req.auth);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in getConversationById:', error);
    return handleError(res, error);
  }
};

module.exports.markConversationAsRead = async (req, res) => {
  try {
    await teamConversationService.markConversationAsRead(req.user, req.params.conversationId, req.auth);
    return res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error in markConversationAsRead:', error);
    return handleError(res, error);
  }
};

module.exports.getTotalUnreadCount = async (req, res) => {
  try {
    const totalUnread = await teamConversationService.getTotalUnreadCount(req.user, req.auth);
    return res.status(200).json({ success: true, data: { totalUnread } });
  } catch (error) {
    console.error('Error in getTotalUnreadCount:', error);
    return handleError(res, error);
  }
};

module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id.toString();
    const result = await teamConversationService.hideConversationForCurrentUser(req.user, conversationId, req.auth);

    try {
      const io = socket.getIO();
      const teamChatNamespace = io.of('/team-chat');
      teamChatNamespace.to(`user:${userId}`).emit('team_conversation_hidden', { conversationId: result.conversationId, hiddenBy: userId });
    } catch (socketError) {
      console.error('Team chat conversation hide socket emit failed:', socketError);
    }

    return res.status(200).json({ success: true, message: 'Conversation removed from your list', data: result });
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    return handleError(res, error);
  }
};
