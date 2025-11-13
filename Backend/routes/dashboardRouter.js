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
const dashboardController = require("../controllers/DashbordController/dashboardController");

// Import des middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware


// Toutes les routes ci-dessous nécessitent un admin authentifié
router.use(requireAuthUser, controledAcces('Admin'), authLogMiddleware("Dashboard"));

// GET /dashboard/getAllUsers
// Description: Récupère la liste de tous les utilisateurs
router.get("/getAllUsers", dashboardController.getAllUsers);

// GET /dashboard/getCounts
// Description: Récupère les compteurs globaux (utilisateurs, etc.)
router.get("/getCounts", dashboardController.getCounts);

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