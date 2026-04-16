/**
 * Interview details routes (consultation)
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - controledAcces('Candidate'): reserved for candidates
 * - LogMiddleware("InterviewDetails"): logs interview access
 */
const express = require("express");
const router = express.Router();
const interviewDetailsController = require("../controllers/InterviewControllers/interviewDetailsController");

// Import des middlewares
const { controledAcces } = require('../middleware/controledAcces');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { requireAuth } = require("../middleware/authMiddleware");


// All routes below require an authenticated candidate
router.use(requireAuth, controledAcces('Candidate'), authLogMiddleware("InterviewDetails"));

// GET /interview-details/
// Description: Retrieves the list of all interviews
router.get("/", interviewDetailsController.getAll);

// GET /interview-details/getInterviewDetailsById/:id
// Params: id (interview identifier)
// Description: Retrieves interview details by identifier
router.get("/getInterviewDetailsById/:id", interviewDetailsController.getInterviewDetailsById);

// POST /interview-details/
// Body: { newInterviewData, profileId, userId? }
// Description: Adds interview details (converts new format to old)
router.post("/", interviewDetailsController.addInterviewDetails);

module.exports = router;