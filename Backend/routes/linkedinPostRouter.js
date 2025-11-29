/**
 * Routes liées à la génération de posts LinkedIn pour les entreprises
 *
 * Middlewares globaux appliqués:
 * - requireAuthUser: nécessite un utilisateur authentifié
 * - controledAcces('Company'): réservé aux comptes Company
 * - LogMiddleware("LinkedinPost"): journalise les requêtes LinkedIn
 */
const express = require("express");
const router = express.Router();
const linkedinPostController = require("../controllers/PostControllers/linkedinPostController");


// Import des middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");
const { controledAcces } = require('../middleware/controledAcces'); 
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


// Toutes les routes ci-dessous nécessitent un compte Company authentifié
router.use(requireAuthUser, controledAcces('Company'), authLogMiddleware("LinkedinPost"));


// POST /linkedin/generate-job-post
// Body: { title, description, skills, ... }
// Description: Génère un post LinkedIn attractif pour une offre d'emploi
router.post("/generate-job-post", linkedinPostController.generateJobPost);

module.exports = router;
