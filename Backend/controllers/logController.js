const logService = require('../services/logService');  // Importer le service des logs

// Fonction pour récupérer tous les logs
module.exports.getAllLogs = async (req, res) => {
  try {
    const logs = await logService.getAllLogs();  // Appeler la fonction du service pour récupérer les logs
    res.status(200).json(logs);  // Retourner les logs au format JSON
  } catch (error) {
    res.status(500).json({ message: error.message });  // Retourner une erreur si la récupération échoue
  }
};

// Fonction pour récupérer le nombre total de logs
module.exports.getTotalLogsCount = async (req, res) => {
  try {
    const count = await logService.getTotalLogsCount();  // Appeler la fonction du service pour récupérer le total des logs
    res.status(200).json({ totalLogs: count });  // Retourner le nombre total de logs
  } catch (error) {
    res.status(500).json({ message: error.message });  // Retourner une erreur si la récupération échoue
  }
};
