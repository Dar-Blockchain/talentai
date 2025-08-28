const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const blockPostmanRequests = require("./middleware/blockPostmanRequests");

const http = require("http");
const connectDB = require("./config/database");
const socket = require("./socket");

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
const notificationRouter = require("./routes/notificationRouter");
const postStepsRouter = require("./routes/postStepsRouter");
const candidatePostStepProgressRouter = require("./routes/candidatePostStepProgressRouter");
const hederaToolsRouter = require("./routes/hederaToolsRouter");
const hcs11Router = require("./routes/hcs11Router");
const hrAgentRouter = require("./routes/hrAgentRouter");
const recruitementStepRouter = require("./routes/recruitementStepRouter");

require("dotenv").config();

const app = express();

// Initialize database connection
const initializeApp = async () => {
  console.log('🔄 Starting TalentAI Backend...');
  console.log('📦 Loading environment configuration...');
  
  try {
    console.log('🔗 Connecting to database...');
    // Connect to MongoDB first
    await connectDB();
    
    console.log('⚡ Initializing server...');
    // Start the server only after successful DB connection
    server.listen(process.env.PORT, () => {
      console.log('');
      console.log('🎉 TalentAI Backend successfully started!');
      console.log(`🚀 Server running on port ${process.env.PORT}`);
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
app.use("/notification", notificationRouter);
app.use("/post-steps", postStepsRouter);
app.use("/candidate-progress", candidatePostStepProgressRouter);
app.use("/hedera-tools", hederaToolsRouter);
app.use("/api/hcs11", hcs11Router);
app.use("/hr-agents", hrAgentRouter);
app.use("/recruitementStep", recruitementStepRouter)

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
io.on('connection', (sock) => {
  console.log('Utilisateur connecté à Socket.IO :', sock.id);
  sock.on('join', (userId) => {
    sock.join(userId);
    console.log(`Utilisateur ${userId} a rejoint sa room.`);
  });
  sock.on('disconnect', () => {
    console.log('Utilisateur déconnecté de Socket.IO :', sock.id);
  });
});

// Initialize the application
initializeApp();
