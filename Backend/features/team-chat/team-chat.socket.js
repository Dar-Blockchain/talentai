module.exports.initializeTeamChatNamespace = (io) => {
  const teamChatNamespace = io.of('/team-chat');

  teamChatNamespace.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId;

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on('join_team_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`team-conversation:${conversationId}`);
      }
    });

    socket.on('leave_team_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`team-conversation:${conversationId}`);
      }
    });

    socket.on('disconnect', (reason) => {
    });
  });

  return teamChatNamespace;
};
