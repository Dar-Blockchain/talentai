// usersController.js
const dashboardService = require("../services/dashboardService");

module.exports.getAllUsers = async (req, res) => {
  try {
    const { username = '', email = '', role = '', page = 1, limit = 10 } = req.query;

    // Créer l'objet searchQuery pour passer au service
    const searchQuery = { username, email, role };

    // Appeler le service pour récupérer les utilisateurs avec pagination et recherche
    const result = await dashboardService.getAllUsers(searchQuery, page, limit);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des utilisateurs" });
  }
};

module.exports.getJobAssessmentResultsGroupedByJobId = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    // Appeler le service pour récupérer les résultats d'évaluation groupés par jobId
    const result = await dashboardService.getJobAssessmentResultsGroupedByJobId(page, limit);
    
    // Retourner la réponse avec les résultats et la pagination
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la récupération des résultats d'évaluation des jobs" });
  }
};
