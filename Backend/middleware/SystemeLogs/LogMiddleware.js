const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../../models/UserModel");
const path = require("path"); // Importer le module path
const Log = require("../../models/logSchema"); // Import the Log model

function authLogMiddleware(logType) {
  return function (req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const startTime = new Date(); // Temps de début de la requête

    if (token) {
      jwt.verify(token, process.env.Net_Secret, async (err, decodedToken) => {
        if (err) {
          console.log(err);
          req.user = null;
        } else {
          let user = await userModel.findById(decodedToken.id);
          req.user = user;
        }
        appendLog(req, res, startTime, logType); // Pass logType as parameter
        next();
      });
    } else {
      req.user = null;
      appendLog(req, res, startTime, logType); // Pass logType as parameter
      next();
    }
  };
}

async function appendLog(req, res, startTime, logType) {
  const headers = JSON.stringify(req.headers);
  const endTime = new Date();
  const executionTime = endTime - startTime; // Temps d'exécution en millisecondes
  const body = Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : 'N/A';
  const referer = req.headers.referer || 'N/A';
  const userAgent = req.get('User-Agent');
  const queryParams = JSON.stringify(req.query);
  const contentType = req.get('Content-Type');
  const origin = req.get('Origin') || 'N/A';

  // Save the log to MongoDB
  const log = new Log({
    type: logType, // Use logType here
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    referer: referer,
    statusCode: res.statusCode,
    user_id: req.user ? req.user._id : 'N/A',
    user_nom: req.user ? req.user.nom : 'N/A',
    headers: headers,
    executionTime: executionTime,
    body: body,
    timestamp: new Date()
  });

  try {
    await log.save(); // Save to MongoDB
  } catch (err) {
    console.error("Error saving log to database:", err);
  }

  // Optional: Write log to file (for debugging or other needs)
  const logsDirectory = path.join(__dirname, '..', '..', 'logs');
  const logFilePath = path.join(logsDirectory, 'auth.log');
  const fileLog = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${req.ip} - Referer: ${referer} - Origin: ${origin} - User-Agent: ${userAgent} - ${res.statusCode} - User_id: ${req.user ? req.user._id : 'N/A'} | nom: ${req.user ? req.user.nom : 'N/A'} \nHeaders: ${headers}\nExecution Time: ${executionTime} ms\nBody: ${body}\nQuery: ${queryParams}\nContent-Type: ${contentType}\n - ${res.locals.data}\n`;

  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
  }

  try {
    fs.appendFileSync(logFilePath, fileLog); // Add the log to the file
  } catch (err) {
    console.error("Error saving log to file:", err);
  }
}


module.exports = authLogMiddleware;
