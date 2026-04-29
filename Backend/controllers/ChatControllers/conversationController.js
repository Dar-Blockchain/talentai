const conversationService = require("../../services/ChatServices/conversation.service");
const socket = require("../../socket");

/**
 * Find or create conversation
 * POST /chat/conversations
 */
module.exports.findOrCreateConversation = async (req, res) => {
  try {
    const { candidateId, companyId, relatedPost } = req.body;
    const userId = req.user._id.toString();

    // Verify current user is one of the participants
    if (userId !== candidateId && userId !== companyId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You must be a participant",
      });
    }

    const conversation = await conversationService.findOrCreateConversation(
      candidateId,
      companyId,
      relatedPost,
    );

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in findOrCreateConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create conversation",
    });
  }
};

/**
 * Get user's conversations
 * GET /chat/conversations
 */
module.exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, status, includeArchived } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      includeArchived: includeArchived === "true",
    };

    const result = await conversationService.getUserConversations(
      userId,
      options,
    );

    res.status(200).json({
      success: true,
      data: result.conversations,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getUserConversations controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversations",
    });
  }
};

/**
 * Get conversation by ID
 * GET /chat/conversations/:conversationId
 */
module.exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await conversationService.getConversationById(
      conversationId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("Error in getConversationById controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get conversation",
    });
  }
};

/**
 * Mark conversation as read
 * PUT /chat/conversations/:conversationId/read
 */
module.exports.markConversationAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await conversationService.markConversationAsRead(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "Conversation marked as read",
    });
  } catch (error) {
    console.error("Error in markConversationAsRead controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark conversation as read",
    });
  }
};

/**
 * Archive conversation
 * PUT /chat/conversations/:conversationId/archive
 */
module.exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await conversationService.archiveConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    console.error("Error in archiveConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to archive conversation",
    });
  }
};

/**
 * Unarchive conversation
 * PUT /chat/conversations/:conversationId/unarchive
 */
module.exports.unarchiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await conversationService.unarchiveConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "Conversation unarchived successfully",
    });
  } catch (error) {
    console.error("Error in unarchiveConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unarchive conversation",
    });
  }
};

/**
 * Block conversation
 * PUT /chat/conversations/:conversationId/block
 */
module.exports.blockConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await conversationService.blockConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "Conversation blocked successfully",
    });
  } catch (error) {
    console.error("Error in blockConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to block conversation",
    });
  }
};

/**
 * Unblock conversation
 * PUT /chat/conversations/:conversationId/unblock
 */
module.exports.unblockConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await conversationService.unblockConversation(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "Conversation unblocked successfully",
    });
  } catch (error) {
    console.error("Error in unblockConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to unblock conversation",
    });
  }
};

/**
 * Delete conversation
 * DELETE /chat/conversations/:conversationId
 */
module.exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Get conversation details before deletion for socket notification
    const Conversation = require("../../models/Conversations.model");
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const participants = conversation.participants.map((p) => p.toString());
    const result = await conversationService.deleteConversation(
      conversationId,
      userId,
    );

    // Emit WebSocket event to notify all participants
    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");

      // Emit to all participants
      participants.forEach((participantId) => {
        chatNamespace.to(`user:${participantId}`).emit("conversation_deleted", {
          conversationId,
          deletedBy: userId.toString(),
        });
      });

      console.log(
        `📨 Conversation deletion broadcast via WebSocket to participants`,
      );
    } catch (socketError) {
      console.error("Error emitting WebSocket event:", socketError);
      // Don't fail the request if WebSocket broadcast fails
    }

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteConversation controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete conversation",
    });
  }
};

/**
 * Get total unread count
 * GET /chat/unread-count
 */
module.exports.getTotalUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const totalUnread = await conversationService.getTotalUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { totalUnread },
    });
  } catch (error) {
    console.error("Error in getTotalUnreadCount controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread count",
    });
  }
};

/**
 * Search conversations
 * GET /chat/conversations/search
 */
module.exports.searchConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const conversations = await conversationService.searchConversations(
      userId,
      searchTerm,
    );

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("Error in searchConversations controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search conversations",
    });
  }
};
