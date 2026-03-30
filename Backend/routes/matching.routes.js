/**
 * Routes de matching candidats ↔ offres
 *
 * Note: this router doesn't force authentication here. If needed,
 * ajouter `requireAuthUser` et une journalisation.
 */
const express = require("express");
const { matchCandidatesToJob } = require("../controllers/MatchingController/matching.controller");
const { requireAuthUser } = require('../middleware/security/auth.middleware');
const { controledAcces } = require('../middleware/authorize.middleware.js'); 
const authLogMiddleware = require("../middleware/security/request-log.middleware.js")
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

const router = express.Router();

//router.use(requireAuthUser, controledAcces('Company'), resolveCompanyActor, authLogMiddleware("MatchingConfig"));
router.use(requireAuthUser, resolveCompanyActor, authLogMiddleware("MatchingConfig"));

// GET /matching/jobs/:jobPostId/matches — retourne les meilleurs candidats pour une offre
router.get("/jobs/:jobPostId/matches", matchCandidatesToJob);
module.exports = router;
