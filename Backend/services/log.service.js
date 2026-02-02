const Log = require('../models/logSchema');  // Importer le modèle Log

// Fonction pour récupérer tous les logs
module.exports.getAllLogs = async () => {
  try {
    const logs = await Log.find();  // Recherche tous les logs
    return logs;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des logs');
  }
};

// Fonction pour récupérer le nombre total de logs
module.exports.getTotalLogsCount = async () => {
  try {
    const count = await Log.getTotalLogsCount();  // Utiliser la méthode statique définie dans le modèle
    return count;
  } catch (error) {
    throw new Error('Erreur lors de la récupération du nombre total de logs');
  }
};
