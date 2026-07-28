const teamMessageService = require('./team-message.service');
const TeamConversation = require('./team-conversation.model');
const socket = require('../../socket/io');

const handleError = (res, error) => {
  return res.status(error.status || 500).json({ success: false, message: error.message || 'Internal server error' });
};

module.exports.getConversationMessages = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const data = await teamMessageService.getConversationMessages(req.user, req.params.conversationId, req.auth, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return res.status(200).json({ success: true, data: data.messages, pagination: data.pagination });
  } catch (error) {
    console.error('Error in getConversationMessages:', error);
    return handleError(res, error);
  }
};

module.exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, receiverId, text } = req.body;
    if (!conversationId || !receiverId || !text) {
      return res.status(400).json({ success: false, message: 'conversationId, receiverId, and text are required' });
    }

    const message = await teamMessageService.sendMessage(req.user, { conversationId, receiverId, text }, req.auth);

    try {
      const io = socket.getIO();
      const teamChatNamespace = io.of('/chat');
      const payload = { message, conversationId };
      const senderRoom = `user:${req.user._id.toString()}`;
      const receiverRoom = `user:${receiverId.toString()}`;

      if (message.deliveryBlocked) {
        teamChatNamespace.to(senderRoom).emit('new_team_message', payload);
      } else if (senderRoom !== receiverRoom) {
        teamChatNamespace.to(senderRoom).emit('new_team_message', payload);
        teamChatNamespace.to(receiverRoom).emit('new_team_message', payload);
      } else {
        teamChatNamespace.to(senderRoom).emit('new_team_message', payload);
      }
    } catch (socketError) {
      console.error('Team chat message socket emit failed:', socketError);
    }

    return res.status(201).json({ success: true, data: message });
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return handleError(res, error);
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const rawScope = req.query.scope;
    const scope = Array.isArray(rawScope) ? rawScope[0] : rawScope;
    const userId = req.user._id.toString();

    const result = await teamMessageService.deleteMessage(req.user, messageId, scope, req.auth);

    try {
      const io = socket.getIO();
      const teamChatNamespace = io.of('/chat');
      const basePayload = { messageId: result.messageId, conversationId: result.conversationId, scope: result.scope, deletedBy: userId };

      if (result.scope === 'everyone') {
        const conv = await TeamConversation.findById(result.conversationId).select('participants').lean();
        const updatedPayload = { message: result.message };
        conv?.participants?.forEach((p) => {
          teamChatNamespace.to(`user:${p.toString()}`).emit('team_message_updated', updatedPayload);
        });
      } else {
        teamChatNamespace.to(`user:${userId}`).emit('team_message_deleted', basePayload);
      }
    } catch (socketError) {
      console.error('Team chat delete message socket emit failed:', socketError);
    }

    return res.status(200).json({
      success: true,
      message: result.scope === 'everyone' ? 'Message deleted for everyone' : 'Message removed from your view',
      data: result,
    });
  } catch (error) {
    console.error('Error in deleteMessage:', error);
    return handleError(res, error);
  }
};
