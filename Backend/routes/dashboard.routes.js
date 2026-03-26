/**
 * Routes du tableau de bord (statistiques et exports)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Admin'): restreint aux administrateurs
 * - LogMiddleware("Dashboard"): journalise les accès au dashboard
 */
const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.controller");

// Import des middlewares
const { requireAuthUser } = require("../middleware/auth.middleware");
const { verifyApiKey, checkScope } = require("../middleware/security/api-key.middleware");

const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const { controledAcces } = require('../middleware/authorize.middleware.js'); // Importez le middleware


// Toutes les routes ci-dessous nécessitent un admin authentifié
//router.use(requireAuthUser, authLogMiddleware("Dashboard"));
// Auth obligatoire + logs pour toutes les routes
// Accepte soit JWT (requireAuthUser) soit clé API (verifyApiKey)
router.use((req, res, next) => {
  // Essayer d'abord la vérification par API Key
  verifyApiKey(req, res, (err) => {
    // Si API Key réussit, continuer
    if (req.isApiKeyAuth) {
      return next();
    }
    // Sinon, exiger une authentification JWT
    return requireAuthUser(req, res, next);
  });
});
// GET /dashboard/getAllUsers
// Description: Récupère la liste de tous les utilisateurs
router.get("/getAllUsers", dashboardController.getAllUsers);

// GET /dashboard/getCounts
// Description: Récupère les compteurs globaux (utilisateurs, etc.)
router.get("/getCounts", dashboardController.getCounts);

// GET /dashboard/statsCards
// Description: Récupère les statistiques affichées sous forme de cartes sur le dashboard
router.get("/statsCards", dashboardController.getStatsCards);
router.get("/richStats", dashboardController.getRichStats);

// GET /dashboard/getUserCountsByDay
// Description: Récupère l'évolution journalière du nombre d'utilisateurs
router.get("/getUserCountsByDay", dashboardController.getCountsByDay);

// GET /dashboard/getUserCountsByLocation
// Description: Statistiques par localisation
router.get("/getUserCountsByLocation", dashboardController.getUserCountsByLocation);

// GET /dashboard/job-assessment-results-grouped
// Description: Résultats d'évaluations groupés par jobId
router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId);

// POST /dashboard/getJobAssessmentsBySkill
// Body: { skill: string }
// Description: Récupère les évaluations par compétence
router.post("/getJobAssessmentsBySkill", dashboardController.getJobAssessmentsBySkill);

// GET /dashboard/downloadUserExcel
// Description: Télécharge un export Excel des utilisateurs
router.get("/downloadUserExcel", dashboardController.downloadUserExcel);

// GET /dashboard/download-users-with-assessment-zero
// Description: Télécharge les utilisateurs sans évaluation
router.get("/download-users-with-assessment-zero", dashboardController.downloadUserExcelWithAssessmentZero);

// GET /dashboard/download-users-with-assessment-Above50
// Description: Télécharge les utilisateurs avec score > 50
router.get("/download-users-with-assessment-Above50", dashboardController.downloadUserExcelWithAssessmentAbove50);

module.exports = router;