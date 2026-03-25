let io;

module.exports = {
  init: (server) => {
    const corsOrigins = [
      "https://staging.talentai.bid",
      "https://backend.staging.talentai.bid",
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:5173",
      "https://app.talentai.bid"
    ];
    if (process.env.FRONTEND_URL && !corsOrigins.includes(process.env.FRONTEND_URL)) {
      corsOrigins.push(process.env.FRONTEND_URL);
    }

    io = require('socket.io')(server, {
      cors: {
        origin: corsOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
      },
      allowEIO3: true, // Allow Engine.IO v3 clients
      transports: ['websocket', 'polling'], // Support both transports
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 30000,
      maxHttpBufferSize: 1e6,
      allowUpgrades: true,
      perMessageDeflate: false,
      httpCompression: true,
      cookie: false, // Disable cookies to avoid session issues
      path: '/socket.io/', // Explicitly set the path
      serveClient: false
    });

    // Log connection attempts for debugging
    io.engine.on("connection_error", (err) => {
      console.error('❌ Socket.IO Engine connection error:', err);
      console.error('Request URL:', err.req?.url);
      console.error('Request headers:', err.req?.headers);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
    });

    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io n'est pas initialisé !");
    }
    return io;
  }
}; 