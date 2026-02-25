const logService = require("../services/log.service"); // Importer le service des logs

// Fonction pour récupérer tous les logs
module.exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, method, statusCode, user_id } = req.query;

    // Construire les filtres optionnels
    const filters = {};
    if (type) filters.type = type;
    if (method) filters.method = method;
    if (statusCode) filters.statusCode = Number(statusCode);
    if (user_id) filters.user_id = user_id;

    const result = await logService.getAllLogs({ page, limit, filters });

    res.status(200).json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Retourner une erreur si la récupération échoue
  }
};

// Fonction pour récupérer le nombre total de logs
module.exports.getTotalLogsCount = async (req, res) => {
  try {
    const count = await logService.getTotalLogsCount(); // Appeler la fonction du service pour récupérer le total des logs
    res.status(200).json({ totalLogs: count }); // Retourner le nombre total de logs
  } catch (error) {
    res.status(500).json({ message: error.message }); // Retourner une erreur si la récupération échoue
  }
};
