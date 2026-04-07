/**
 * Routes des détails d'entretien (consultation)
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Candidate'): réservé aux candidats
 * - LogMiddleware("InterviewDetails"): journalise l'accès aux entretiens
 */
const express = require("express");
const router = express.Router();
const interviewDetailsController = require("../controllers/InterviewControllers/interviewDetailsController");

// Import des middlewares
const { controledAcces } = require('../middleware/controledAcces');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { requireAuthUser } = require("../middleware/authMiddleware");

// Toutes les routes ci-dessous nécessitent un candidat authentifié
router.use(requireAuthUser, controledAcces('Candidate'), authLogMiddleware("InterviewDetails"));

// GET /interview-details/
// Description: Récupère la liste de tous les entretiens
router.get("/", interviewDetailsController.getAll);

// GET /interview-details/getInterviewDetailsById/:id
// Params: id (identifiant d'entretien)
// Description: Récupère les détails d'un entretien par son identifiant
router.get("/getInterviewDetailsById/:id", interviewDetailsController.getInterviewDetailsById);

// POST /interview-details/
// Body: { newInterviewData, profileId, userId? }
// Description: Ajoute les détails d'un nouvel entretien (convertit le format nouveau en ancien)
router.post("/", interviewDetailsController.addInterviewDetails);

// POST /interview-details/:id/claim-reward
// Params: id (identifiant d'entretien)
// Description: Permet au candidat de réclamer manuellement la récompense TAI si la distribution automatique a échoué
router.post("/:id/claim-reward", interviewDetailsController.claimInterviewReward);

module.exports = router;