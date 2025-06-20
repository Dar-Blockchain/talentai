const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const blockPostmanRequests = require('./middleware/blockPostmanRequests');

const http = require("http");
const connectDB = require("./config/database");

const authRouter = require("./routes/authRouter");
const dashboardRouter = require("./routes/dashboardRouter");
const agentIARouter = require("./routes/agentIARouter");
const profileRouter = require("./routes/profileRouter");
const evaluationRouter = require("./routes/evaluationRouter");
const linkedinPostRouter = require("./routes/linkedinPostRouter");
const postRouter = require("./routes/postRouter");
const matchingRoutes = require("./routes/matchingRouter");
const resumeRouter = require("./routes/resumeRouter");
const todoRouter = require("./routes/todoRouter");
const feedbackRouter = require("./routes/feedbackRoutes");
const logRoutes = require("./routes/logRoutes");
require("dotenv").config();

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
//app.use(blockPostmanRequests);
app.use(express.json());
app.use(
  cors({
    origin: "https://app.talentai.bid", // Permet toutes les origines
    // origin: "*", // Permet toutes les origines
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
app.use("/api", agentIARouter);
app.use("/feedback", feedbackRouter);
app.use("/post", postRouter);
app.use("/matching", matchingRoutes);
app.use("/resume", resumeRouter);
app.use("/todo", todoRouter);
app.use("/logs", logRoutes);

app.get('/some-route', (req, res) => {
  res.json('Route accessible');
});
// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Express!" });
});

// Démarrage du serveur HTTP
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(
    `Le serveur est en cours d'exécution sur le port ${process.env.PORT}`
  );
});
