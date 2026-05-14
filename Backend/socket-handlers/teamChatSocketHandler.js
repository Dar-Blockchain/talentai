module.exports.initializeTeamChatNamespace = (io) => {
  const teamChatNamespace = io.of("/team-chat");

  teamChatNamespace.on("connection", (socket) => {
    const userId = socket.handshake.auth.userId;
    console.log(`🟢 Team chat: User ${userId} connected (socket: ${socket.id})`);

    if (userId) {
      socket.join(`user:${userId}`);
    }

    socket.on("join_team_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.join(`team-conversation:${conversationId}`);
      }
    });

    socket.on("leave_team_conversation", ({ conversationId }) => {
      if (conversationId) {
        socket.leave(`team-conversation:${conversationId}`);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 Team chat: User ${userId} disconnected (reason: ${reason})`);
    });
  });

  console.log("✅ Team chat namespace /team-chat initialized and ready");
  return teamChatNamespace;
};
