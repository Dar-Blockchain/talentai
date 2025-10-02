let io;
const intelligentInterviewController = require('./controllers/intelligentInterviewController');

module.exports = {
  init: (server) => {
    io = require('socket.io')(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Initialize intelligent interview handlers
    intelligentInterviewController.initializeHandlers(io);

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io n'est pas initialisé !");
    }
    return io;
  }
}; 