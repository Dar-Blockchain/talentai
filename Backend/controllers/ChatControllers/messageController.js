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
    const { conversationId, receiverId, text, type, attachment, replyTo } = req.body;
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
    } catch (socketError) {
      console.error("Error emitting WebSocket event:", socketError);
    }

    res.status(201).json({ success: true, data: message });
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

    const result = await messageService.getConversationMessages(conversationId, userId, options);

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
 * Delete message
 * DELETE /chat/messages/:messageId?scope=me|everyone
 */
module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;
    const userIdStr = userId.toString();

    const Message = require("../../models/Message.model");
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    const conversationIdRaw = message.conversation;
    const conversationId = conversationIdRaw ? conversationIdRaw.toString() : conversationIdRaw;
    const senderId = message.sender ? message.sender.toString() : null;
    const receiverId = message.receiver ? message.receiver.toString() : null;

    const scopeRaw = req.query.scope;
    const scope = scopeRaw === "me" || scopeRaw === "everyone" ? scopeRaw : undefined;

    const result = await messageService.deleteMessage(messageId, userId, { scope });

    try {
      const io = socket.getIO();
      const chatNamespace = io.of("/chat");

      if (result.scope === "everyone") {
        const payload = { message: result.message, conversationId };
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
      message: result.scope === "everyone" ? "Message deleted for everyone" : "Message removed from your view",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteMessage controller:", error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Failed to delete message",
    });
  }
};
