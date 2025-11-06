/**
 * Routes de matching candidats ↔ offres
 *
 * Remarque: ce routeur ne force pas l'authentification ici. Si nécessaire,
 * ajouter `requireAuthUser` et une journalisation.
 */
const express = require("express");
const { matchCandidatesToJob } = require("../controllers/MatchingController/matchingController");

const router = express.Router();

// GET /matching/jobs/:jobPostId/matches — retourne les meilleurs candidats pour une offre
router.get("/jobs/:jobPostId/matches", matchCandidatesToJob);
module.exports = router;
