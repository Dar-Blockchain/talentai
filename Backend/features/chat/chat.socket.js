module.exports.initializeChatNamespace = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
      }
    });

    socket.on('typing_start', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', { userId, conversationId, isTyping: true });
      }
    });

    socket.on('typing_stop', ({ conversationId }) => {
      if (conversationId) {
        socket.to(`conversation:${conversationId}`).emit('user_typing', { userId, conversationId, isTyping: false });
      }
    });

    socket.on('disconnect', (reason) => {
    });

    socket.on('error', (error) => {
      console.error(`❌ Chat socket error for user ${userId}:`, error);
    });
  });

  return chatNamespace;
};
