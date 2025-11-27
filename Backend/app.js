// Suppress noisy deprecation warnings for the builtin `punycode` module
// (some older nested dependencies still require it). We only silence
// the specific DEP0040 punycode deprecation so other warnings remain visible.
process.on('warning', (warning) => {
  try {
    if (warning.name === 'DeprecationWarning' && /punycode/.test(warning.stack || warning.message)) {
      // intentionally ignore punycode deprecation
      return;
    }
  } catch (e) {
    // if anything goes wrong, fall back to default logging below
  }
  console.warn(warning.name + ': ' + warning.message);
});

const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const blockPostmanRequests = require("./middleware/blockPostmanRequests");
const resetQuotaJob = require("./cron/resetQuota");

const http = require("http");
const connectDB = require("./config/database");
const socket = require("./socket");
const { initializeAgenda } = require("./services/agendaService");

const authRouter = require("./routes/authRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const profileRouter = require("./routes/profileRouter");
const evaluationRouter = require("./routes/evaluationRouter");
const linkedinPostRouter = require("./routes/linkedinPostRouter");
const postRouter = require("./routes/postRouter");
const matchingRoutes = require("./routes/matchingRouter");
const resumeRouter = require("./routes/resumeRouter");
const todoRouter = require("./routes/todoRouter");
const feedbackRouter = require("./routes/feedbackRoutes");
const logRoutes = require("./routes/logRoutes");
const interviewDetailsRouter = require("./routes/interviewDetailsRouter");
const InterviewAssessmentRoutes = require("./routes/InterviewAssessmentRoutes");
const notificationSystemRouter = require("./routes/notificationSystemRoutes");
const postStepsRouter = require("./routes/postStepsRouter");
const candidatePostStepProgressRouter = require("./routes/candidatePostStepProgressRouter");
const hederaToolsRouter = require("./routes/hederaToolsRouter");
const hcs11Router = require("./routes/hcs11Router");
const hrAgentRouter = require("./routes/hrAgentRouter");
const recruitementStepRouter = require("./routes/recruitementStepRouter");
const taskRouter = require("./routes/taskRouter");
const agentConfigRouter = require("./routes/agentConfigRouter");
const tokenRouter = require("./routes/tokenRouter");
const stripRouter = require("./routes/StripRouter");

const paymentRouter = require("./routes/paymentRouter");

require("dotenv").config();


// 🧠 Import et exécution automatique du CRON job
require("./cron/resetQuota");

// Stripe payment routes

const app = express();
const initializeApp = async () => {
  console.log('🔄 Starting TalentAI Backend...');
  console.log('📦 Loading environment configuration...');
  
  try {
    console.log('🔗 Connecting to database...');
    // Connect to MongoDB first
    await connectDB();
    // Initialize Agenda scheduler after DB connection
    await initializeAgenda();

    console.log('🤖 Initializing intelligent interview service...');
    // Initialize intelligent interview service
    const serviceInitialized = await intelligentInterviewService.initialize();
    console.log(`${serviceInitialized ? '✅' : '⚠️ '} Interview service initialization ${serviceInitialized ? 'completed' : 'completed with warnings'}`);

    if (!serviceInitialized) {
      console.warn('⚠️  Interview features may be limited');
    }

    console.log('⚡ Starting HTTP server...');
    // Start the server only after successful DB connection
    const host = process.env.HOST || '0.0.0.0';
    server.listen(process.env.PORT, host, () => {
      console.log('');
      console.log('🎉 TalentAI Backend successfully started!');
      console.log(`🚀 Server running on ${host}:${process.env.PORT}`);
      console.log(`🌐 Accessible from Windows at: http://172.23.207.114:${process.env.PORT}`);
      console.log(`🌐 Accessible from WSL at: http://localhost:${process.env.PORT}`);
      console.log('');

      // Initialize interview namespace AFTER server is listening
      console.log('🎙️  Initializing interview WebSocket namespace...');
      intelligentInterviewController.initializeHandlers(io);
      console.log('✅ Interview namespace /interview initialized and ready');
      console.log(`🔌 WebSocket endpoint: ws://172.23.207.114:${process.env.PORT}/socket.io/`);
      console.log('');

      console.log(`📖 API Documentation: http://localhost:${process.env.PORT}/api/docs`);
      console.log(`💡 Hedera clients will initialize on first use (lazy loading)`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    process.exit(1);
  }
};
// Middleware
//app.use(blockPostmanRequests);
app.use(express.json());
app.use(
  cors({
    // origin: "https://app.talentai.bid", // Permet toutes les origines
    origin: "*", // Permet toutes les origines
    methods: "GET, POST, PUT, DELETE, PATCH",
    allowedHeaders:
      "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev")); //combined
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/dashboard", dashboardRouter);
app.use("/profiles", profileRouter);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/evaluation", evaluationRouter);
app.use("/linkedinPost", linkedinPostRouter);
app.use("/feedback", feedbackRouter);
app.use("/post", postRouter);
app.use("/matching", matchingRoutes);
app.use("/resume", resumeRouter);
app.use("/todo", todoRouter);
app.use("/logs", logRoutes);
app.use("/interviewDetails", interviewDetailsRouter);
app.use("/InterviewAssessment", InterviewAssessmentRoutes);
app.use("/notification-system", notificationSystemRouter);
app.use("/post-steps", postStepsRouter);
app.use("/candidate-progress", candidatePostStepProgressRouter);
app.use("/hedera-tools", hederaToolsRouter);
app.use("/api/hcs11", hcs11Router);
app.use("/hr-agents", hrAgentRouter);
app.use("/recruitementStep", recruitementStepRouter);
app.use("/task", taskRouter);
app.use('/agent-config', agentConfigRouter);
app.use("/tokens", tokenRouter);
app.use("/payment", paymentRouter);
app.use('/api/stripe', stripRouter);

app.get("/some-route", (req, res) => {
  res.json("Route accessible");
});
// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Express!" });
});

// Démarrage du serveur HTTP
const server = http.createServer(app);

// Initialisation centralisée de Socket.IO
const io = socket.init(server);

// Require services at module level (but don't initialize namespace yet)
const intelligentInterviewService = require('./services/intelligentInterviewService');
const intelligentInterviewController = require('./controllers/intelligentInterviewController');

// Basic Socket.IO default namespace handler
io.on('connection', (sock) => {
  console.log('Utilisateur connecté à Socket.IO (default namespace):', sock.id);
  sock.on('join', (userId) => {
    sock.join(userId);
    console.log(`Utilisateur ${userId} a rejoint sa room.`);
  });
  // Allow clients to request the server to create a system notification
  sock.on('sendSystemNotification', async (data) => {
    try {
      const { recipient, content, url } = data || {};
      const notificationService = require('./services/notificationSystemService');
      const notification = await notificationService.createSystemNotification(recipient, content, url);
      // Acknowledge to sender
      sock.emit('notificationCreated', notification);
    } catch (err) {
      console.error('Failed to create system notification via socket:', err);
      sock.emit('notificationError', { error: err.message || 'Unknown error' });
    }
  });

  // Allow broadcasting to multiple recipients via socket
  sock.on('broadcastSystemNotification', async (data) => {
    try {
      const { recipients, content, url } = data || {};
      const notificationService = require('./services/notificationSystemService');
      const results = await notificationService.broadcastSystemNotification(recipients, content, url);
      sock.emit('broadcastCreated', { created: results.length });
    } catch (err) {
      console.error('Failed to broadcast system notifications via socket:', err);
      sock.emit('notificationError', { error: err.message || 'Unknown error' });
    }
  });
  sock.on('disconnect', () => {
    console.log('Utilisateur déconnecté de Socket.IO :', sock.id);
  });
});

// Initialize the application
initializeApp();
