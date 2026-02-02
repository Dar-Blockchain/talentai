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
const generateJobPostController = require("../controllers/PostControllers/generateJobPost.controller");


// Import des middlewares
const { requireAuthUser } = require("../middleware/auth.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js'); 
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");


// Toutes les routes ci-dessous nécessitent un compte Company authentifié
router.use(requireAuthUser, controledAcces('Company'), authLogMiddleware("LinkedinPost"));


// POST /linkedin/generate-job-post
// Body: { title, description, skills, ... }
// Description: Génère un post LinkedIn attractif pour une offre d'emploi
router.post("/generate-job-post", resolveCompanyActor,generateJobPostController.generateJobPost);

module.exports = router;
