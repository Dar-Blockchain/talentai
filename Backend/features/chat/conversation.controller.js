const conversationService = require('./conversation.service');
const Conversation = require('./conversation.model');
const socket = require('../../socket/io');

module.exports.findOrCreateConversation = async (req, res) => {
  try {
    const { candidateId, companyId, relatedPost } = req.body;
    const userId = req.user._id.toString();

    if (userId !== candidateId && userId !== companyId) {
      return res.status(403).json({ success: false, message: 'Unauthorized: You must be a participant' });
    }

    if (req.user.role === 'Candidate') {
      const existing = await Conversation.findOne({ candidateId, companyId });
      if (!existing) {
        return res.status(403).json({ success: false, message: 'Candidates cannot start a new conversation' });
      }
    }

    const conversation = await conversationService.findOrCreateConversation(candidateId, companyId, relatedPost);
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error in findOrCreateConversation controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create conversation' });
  }
};

module.exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, includeArchived } = req.query;
    const pageNum = Number.parseInt(String(page), 10);
    const limitNum = Number.parseInt(String(limit), 10);
    const options = {
      page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
      limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 20,
      status,
      includeArchived: includeArchived === 'true',
    };
    const result = await conversationService.getUserConversations(userId, options);
    res.set('Cache-Control', 'private, no-store, must-revalidate');
    res.status(200).json({ success: true, data: result.conversations, pagination: result.pagination });
  } catch (error) {
    console.error('Error in getUserConversations controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get conversations' });
  }
};

module.exports.getConversationById = async (req, res) => {
  try {
    const conversation = await conversationService.getConversationById(req.params.conversationId, req.user._id);
    res.status(200).json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error in getConversationById controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get conversation' });
  }
};

module.exports.markConversationAsRead = async (req, res) => {
  try {
    await conversationService.markConversationAsRead(req.params.conversationId, req.user._id);
    res.status(200).json({ success: true, message: 'Conversation marked as read' });
  } catch (error) {
    console.error('Error in markConversationAsRead controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to mark conversation as read' });
  }
};

module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const participants = conversation.participants.map((p) => p.toString());
    const result = await conversationService.deleteConversation(conversationId, userId);

    try {
      const io = socket.getIO();
      const chatNamespace = io.of('/chat');
      const isCompanyDelete = req.user.role === 'Company';
      const recipientIds = isCompanyDelete ? participants : [userId.toString()];
      recipientIds.forEach((participantId) => {
        chatNamespace.to(`user:${participantId}`).emit('conversation_deleted', { conversationId, deletedBy: userId.toString() });
      });
    } catch (socketError) {
      console.error('Error emitting WebSocket event:', socketError);
    }

    res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Error in deleteConversation controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete conversation' });
  }
};

module.exports.getTotalUnreadCount = async (req, res) => {
  try {
    const totalUnread = await conversationService.getTotalUnreadCount(req.user._id);
    res.set('Cache-Control', 'private, no-store, must-revalidate');
    res.status(200).json({ success: true, data: { totalUnread } });
  } catch (error) {
    console.error('Error in getTotalUnreadCount controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to get unread count' });
  }
};

module.exports.unarchiveAllConversations = async (req, res) => {
  try {
    const modifiedCount = await Conversation.unarchiveAllForUser(req.user._id);
    res.status(200).json({ success: true, data: { modifiedCount }, message: `Unarchived ${modifiedCount} conversation(s)` });
  } catch (error) {
    console.error('Error in unarchiveAllConversations controller:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to unarchive conversations' });
  }
};
