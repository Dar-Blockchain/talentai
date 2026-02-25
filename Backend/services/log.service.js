const Log = require('../models/log.model');  // Importer le modèle Log

// Fonction pour récupérer tous les logs
module.exports.getAllLogs = async (options = {}) => {
  try {
    const page = Math.max(1, parseInt(options.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(options.limit, 10) || 20));
    const filters = options.filters || {};

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      Log.find(filters).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Log.countDocuments(filters),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
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
