/**
 * Unlock Candidate routes
 * Handles candidate unlocking for companies
 */
const express = require("express");
const router = express.Router();
const unlockCandidateController = require("../controllers/unlockCandidateController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");
const resolveCompanyActor = require("../middleware/resolveCompanyActor");

// Apply logging middleware and authentication to all unlock candidate routes
router.use(requireAuthUser, authLogMiddleware("UnlockCandidate"));

// GET /unlock-candidate/unlocked
// Get all unlocked candidates by company
router.get("/",resolveCompanyActor, unlockCandidateController.getUnlockedCandidatesByCompany);

// GET /unlock-candidate/all
// Get all unlock candidates by company (including pending)
// router.get("/all", unlockCandidateController.getUnlockCandidatesByCompany);

// GET /unlock-candidate/:unlockId
// Get unlock record by ID
router.get("/:unlockId",resolveCompanyActor, unlockCandidateController.getUnlockById);

// POST /unlock-candidate/create
// Create unlock candidate record
router.post("/",resolveCompanyActor, unlockCandidateController.unlockCandidate);

// NOTE: pack logic merged into `/create` endpoint. Removed separate pack route.

// POST /unlock-candidate/complete
// Complete unlock after payment
// router.post("/complete", unlockCandidateController.completeUnlock);

module.exports = router;
