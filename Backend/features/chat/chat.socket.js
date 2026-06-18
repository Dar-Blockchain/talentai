module.exports.initializeChatNamespace = (io) => {
  const chatNamespace = io.of('/chat');

  chatNamespace.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;
    console.log(`🟢 Chat: User ${userId} connected (socket: ${socket.id})`);

    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} joined personal room`);
    }

    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation:${conversationId}`);
        console.log(`💬 User ${userId} joined conversation room: ${conversationId}`);
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      if (conversationId) {
        socket.leave(`conversation:${conversationId}`);
        console.log(`👋 User ${userId} left conversation room: ${conversationId}`);
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
      console.log(`🔴 Chat: User ${userId} disconnected (reason: ${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Chat socket error for user ${userId}:`, error);
    });
  });

  console.log('✅ Chat namespace /chat initialized and ready');
  return chatNamespace;
};
