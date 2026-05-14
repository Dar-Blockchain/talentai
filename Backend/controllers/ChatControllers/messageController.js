const messageService = require("../../services/ChatServices/message.service");
const socket = require("../../socket");

const senderRoomDiffersFromReceiver = (senderStr, receiverStr) =>
  senderStr && receiverStr && senderStr !== receiverStr;

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

    // Emit per-user rooms (mirrors team-chat behaviour). Every socket auto-joins
    // `user:${userId}`, so this delivers reliably even when the receiver has not
    // yet opened the conversation (no `conversation:` room join required).
    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");
      const senderStr = senderId.toString();
      const receiverStr = receiverId.toString();
      const payload = { message, conversationId };

      if (message.deliveryBlocked) {
        chatNamespace.to(`user:${senderStr}`).emit("new_message", payload);
      } else if (senderRoomDiffersFromReceiver(senderStr, receiverStr)) {
        chatNamespace.to(`user:${senderStr}`).emit("new_message", payload);
        chatNamespace.to(`user:${receiverStr}`).emit("new_message", payload);
      } else {
        chatNamespace.to(`user:${senderStr}`).emit("new_message", payload);
      }

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

    const pageNum = Number.parseInt(String(page), 10);
    const limitNum = Number.parseInt(String(limit), 10);
    const options = {
      page: Number.isFinite(pageNum) && pageNum > 0 ? pageNum : 1,
      limit: Number.isFinite(limitNum) && limitNum > 0 ? Math.min(limitNum, 100) : 50,
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
 * DELETE /chat/messages/:messageId?scope=me|everyone
 *
 * scope=me       → hide message for the caller only.
 * scope=everyone → tombstone the message for both participants (sender only).
 *
 * Socket protocol (mirrors team-chat):
 *  - scope=me       → emit `message_deleted` to the caller's user room only.
 *  - scope=everyone → emit `message_updated` (with the tombstone row) to every
 *                     participant so the UI can swap the message in-place to a
 *                     "This message was deleted" placeholder.
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const userIdStr = userId.toString();

    const Message = require("../../models/Message.model");
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversationIdRaw = message.conversation;
    const conversationId = conversationIdRaw ? conversationIdRaw.toString() : conversationIdRaw;
    const senderId = message.sender ? message.sender.toString() : null;
    const receiverId = message.receiver ? message.receiver.toString() : null;

    const scopeRaw = req.query.scope;
    const scope =
      scopeRaw === "me" || scopeRaw === "everyone" ? scopeRaw : undefined;

    const result = await messageService.deleteMessage(messageId, userId, { scope });

    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");

      if (result.scope === "everyone") {
        const payload = {
          message: result.message,
          conversationId,
        };
        const targets = new Set(
          [senderId, receiverId].filter((id) => typeof id === "string" && id.length > 0),
        );
        targets.forEach((participantId) => {
          chatNamespace.to(`user:${participantId}`).emit("message_updated", payload);
        });
      } else {
        chatNamespace.to(`user:${userIdStr}`).emit("message_deleted", {
          messageId,
          conversationId,
          scope: "me",
          deletedBy: userIdStr,
        });
      }
    } catch (socketError) {
      console.error("Error emitting WebSocket event:", socketError);
    }

    res.status(200).json({
      success: true,
      message:
        result.scope === "everyone"
          ? "Message deleted for everyone"
          : "Message removed from your view",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error);
    const status = error.status || 500;
    res.status(status).json({
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
