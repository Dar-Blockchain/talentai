const messageService = require("../../services/ChatServices/message.service");
const socket = require("../../socket");

/**
 * Send message
 * POST /chat/messages
 */
module.exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text, type, attachment, replyTo } =
      req.body;
    const senderId = req.user._id;

    if (!conversationId || !receiverId || !text) {
      return res.status(400).json({
        success: false,
        message: "conversationId, receiverId, and text are required",
      });
    }

    const message = await messageService.sendMessage(
      conversationId,
      senderId,
      receiverId,
      text,
      { type, attachment, replyTo },
    );

    // Emit WebSocket event to notify all participants in the conversation
    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");

      // Emit to conversation room (all participants including sender)
      chatNamespace
        .to(`conversation:${conversationId}`)
        .emit("new_message", message);

      // Also emit to receiver's personal room for notifications
      chatNamespace.to(`user:${receiverId}`).emit("message_notification", {
        message,
        conversationId,
        sender: {
          _id: senderId,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
        },
      });

      console.log(
        `📨 Message broadcast via WebSocket to conversation ${conversationId}`,
      );
    } catch (socketError) {
      console.error("Error emitting WebSocket event:", socketError);
      // Don't fail the request if WebSocket broadcast fails
    }

    res.status(201).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send message",
    });
  }
};

/**
 * Get conversation messages
 * GET /chat/messages/:conversationId
 */
module.exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { page = 1, limit = 50, before } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      before,
    };

    const result = await messageService.getConversationMessages(
      conversationId,
      userId,
      options,
    );

    res.status(200).json({
      success: true,
      data: result.messages,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getConversationMessages controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get messages",
    });
  }
};

/**
 * Mark message as read
 * PUT /chat/messages/:messageId/read
 */
module.exports.markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await messageService.markMessageAsRead(messageId, userId);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in markMessageAsRead controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark message as read",
    });
  }
};

/**
 * Mark all messages as read in conversation
 * PUT /chat/messages/:conversationId/read-all
 */
module.exports.markAllMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await messageService.markAllMessagesAsRead(conversationId, userId);

    res.status(200).json({
      success: true,
      message: "All messages marked as read",
    });
  } catch (error) {
    console.error("Error in markAllMessagesAsRead controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark messages as read",
    });
  }
};

/**
 * Delete message
 * DELETE /chat/messages/:messageId
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    // Get message details before deletion for socket notification
    const Message = require("../../models/message.model");
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversationId = message.conversation;
    const result = await messageService.deleteMessage(messageId, userId);

    // Emit WebSocket event to notify other participant
    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");

      // Emit to conversation room to update all participants
      chatNamespace
        .to(`conversation:${conversationId}`)
        .emit("message_deleted", {
          messageId,
          conversationId,
          deletedBy: userId,
        });

      console.log(
        `📨 Message deletion broadcast via WebSocket to conversation ${conversationId}`,
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
    console.error("Error in deleteMessage controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};

/**
 * Get unread messages
 * GET /chat/messages/:conversationId/unread
 */
module.exports.getUnreadMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const messages = await messageService.getUnreadMessages(
      conversationId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getUnreadMessages controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread messages",
    });
  }
};

/**
 * Search messages
 * GET /chat/messages/:conversationId/search
 */
module.exports.searchMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;
    const { q: searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const messages = await messageService.searchMessages(
      conversationId,
      searchTerm,
      userId,
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in searchMessages controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to search messages",
    });
  }
};

/**
 * Add reaction to message
 * POST /chat/messages/:messageId/reaction
 */
module.exports.addReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const message = await messageService.addReaction(messageId, userId, emoji);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in addReaction controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add reaction",
    });
  }
};

/**
 * Remove reaction from message
 * DELETE /chat/messages/:messageId/reaction
 */
module.exports.removeReaction = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await messageService.removeReaction(messageId, userId);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in removeReaction controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove reaction",
    });
  }
};

/**
 * Get message by ID
 * GET /chat/messages/single/:messageId
 */
module.exports.getMessageById = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await messageService.getMessageById(messageId, userId);

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error in getMessageById controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get message",
    });
  }
};
