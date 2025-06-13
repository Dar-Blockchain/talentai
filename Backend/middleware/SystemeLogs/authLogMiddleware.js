const { requireAuth_checkUser } = require("../authMiddleware");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const userModel = require("../../models/UserModel");
const path = require("path"); // Importer le module path

function authLogMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  const startTime = new Date(); // Temps de début de la requête
  if (token) {
    jwt.verify(token, process.env.Net_Secret, async (err, decodedToken) => {
      if (err) {
        console.log(err)
        req.user = null;
      } else {
        let user = await userModel.findById(decodedToken.id);
        req.user = user;
      }
      appendLog(req, res, startTime);
      next();
    });
  } else {
    req.user = null;
    appendLog(req, res, startTime);
    next();
  }
}

async function appendLog(req, res, startTime) {
  const headers = JSON.stringify(req.headers);
  const endTime = new Date(); // Temps de fin de la requête
  const executionTime = endTime - startTime; // Temps d'exécution en millisecondes
  const body = Object.keys(req.body).length > 0 ? JSON.stringify(req.body) : 'N/A';
  const referer = req.headers.referer || 'N/A';
  const log = `${new Date().toISOString()} - ${req.method} - ${req.originalUrl} - ${req.ip} - Referer: ${referer} - ${res.statusCode} - User_id: ${req.user ? req.user._id : 'N/A'} | nom: ${req.user ? req.user.nom : 'N/A'} \nHeaders: ${headers}\nExecution Time: ${executionTime} ms\nBody: ${body}\n - ${res.locals.data}\n`;

  const logsDirectory = path.join(__dirname, '..', '..', 'logs'); // Chemin du dossier logs, en remontant de deux niveaux
  const logFilePath = path.join(logsDirectory, 'auth.log'); // Chemin complet du fichier de logs

    // Vérifier si le dossier logs existe, sinon le créer
  if (!fs.existsSync(logsDirectory)) {
    fs.mkdirSync(logsDirectory);
  }

  try {
    fs.appendFileSync(logFilePath, log); // Ajouter le log au fichier de logs

  } catch (err) {
    console.error("Erreur lors de l'enregistrement dans le fichier journal :", err);
  }
}
module.exports = authLogMiddleware;