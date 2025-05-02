const express = require("express");
const cors = require("cors");
const path = require("path");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const http = require("http");
const connectDB = require("./config/database");

const authRouter = require("./routes/authRouter");
const agentIARouter = require("./routes/agentIARouter");
const profileRouter = require("./routes/profileRouter");
const evaluationRouter = require("./routes/evaluationRouter");
const linkedinPostRouter = require("./routes/linkedinPostRouter");
const postRouter = require("./routes/postRouter");
const matchingRoutes = require('./routes/matchingRouter');
const resumeRouter = require('./routes/resumeRouter');
require("dotenv").config();

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));
app.use(cookieParser());

// Configure server timeout
const server = http.createServer(app);
server.timeout = 300000; // 5 minutes timeout
server.keepAliveTimeout = 301000; // Keep-alive slightly higher than timeout

// Routes
app.use("/auth", authRouter);
app.use("/profiles", profileRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/evaluation', evaluationRouter);
app.use('/linkedinPost', linkedinPostRouter);
app.use('/api', agentIARouter);
app.use('/post', postRouter);
app.use('/matching', matchingRoutes);
app.use('/resume', resumeRouter);
// Route de base
app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API Express!" });
});

// Démarrage du serveur HTTP
server.listen(process.env.PORT, () => {
  console.log(
    `Le serveur est en cours d'exécution sur le port ${process.env.PORT}`
  );
});