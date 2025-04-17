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

require("dotenv").config();

const app = express();

// Connexion à MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(logger("dev"));//combined
app.use(cookieParser());

// Routes
app.use("/auth", authRouter);
app.use("/profiles", profileRouter);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/evaluation', evaluationRouter);
app.use('/api', agentIARouter);
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