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


// Fonction pour gérer la requête et envoyer les résultats
module.exports.getCounts = async (req, res) => {
  try {
    // Appeler la fonction de service pour obtenir les résultats
    const counts = await dashboardService.getCounts();
    res.status(200).json({ success: true, data: counts });
  } catch (error) {
    // En cas d'erreur, renvoyer un message d'erreur
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fonction pour gérer la requête et envoyer les résultats
module.exports.getCountsByDay = async (req, res) => {
  try {
    // Appeler la fonction de service pour obtenir les résultats
    const countsByDay = await dashboardService.getCountsByDay();
    res.status(200).json({ success: true, data: countsByDay });
  } catch (error) {
    // En cas d'erreur, renvoyer un message d'erreur
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fonction pour gérer la requête et envoyer les résultats
module.exports.getUserCountsByLocation = async (req, res) => {
  try {
    // Appeler la fonction de service pour obtenir le nombre d'utilisateurs par localisation
    const userCountsByLocation = await dashboardService.getUserCountsByLocation();
    res.status(200).json({ success: true, data: userCountsByLocation });
  } catch (error) {
    // En cas d'erreur, renvoyer un message d'erreur
    res.status(500).json({ success: false, message: error.message });
  }
};

// Contrôleur qui renvoie tous les JobAssessmentResult pour un skill spécifique
module.exports.getJobAssessmentsBySkill = async (req, res) => {
  const { skillName } = req.body; // On récupère le nom de la compétence depuis les paramètres de l'URL

  try {
    const assessments = await dashboardService.getJobAssessmentsBySkill(skillName);
    
    if (!assessments || assessments.length === 0) {
      return res.status(404).json({ message: "Aucune évaluation trouvée pour cette compétence." });
    }

    // Retourne les résultats des évaluations
    return res.status(200).json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports.downloadUserExcel = async (req, res) => {
  try {
    // Appeler le service pour générer le fichier Excel
    const fileBuffer = await dashboardService.generateUserExcel();

    // Définir les en-têtes de la réponse pour télécharger le fichier
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Envoyer le fichier en réponse
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
}

module.exports.downloadUserExcelWithAssessmentZero = async (req, res) => {
  try {
    // Appeler le service pour générer le fichier Excel des utilisateurs avec un overallScore de 0
    const fileBuffer = await dashboardService.generateUserExcelWithAssessmentZero();

    // Définir les en-têtes de la réponse pour télécharger le fichier
    res.setHeader("Content-Disposition", "attachment; filename=users_with_score_0.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    // Envoyer le fichier en réponse
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: "Erreur interne du serveur", error: error.message });
  }
};
