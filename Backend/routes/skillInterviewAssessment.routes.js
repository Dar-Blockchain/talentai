const express = require("express");
const router = express.Router();
const skillsInterviewAssessment = require("../controllers/InterviewControllers/skillsInterviewAssessment.controller");

// Import middlewares
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware");

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("SkillInterviewAssessment"));

// ========== CREATE ==========
// POST /api/skill-interview-assessments
router.post("/", skillsInterviewAssessment.create);

// ========== READ ==========
// ⚠️ IMPORTANT: Specific routes must come BEFORE /:id to avoid conflicts

// GET /api/skill-interview-assessments/my
router.get("/my", skillsInterviewAssessment.getMy);

// GET /api/skill-interview-assessments/session/:sessionId
//router.get('/session/:sessionId', getBySessionId);

// GET /api/skill-interview-assessments/:id
router.get("/:id", skillsInterviewAssessment.getById);

// GET /api/skill-interview-assessments (must be last among GET routes)
// Query params: page, limit, interviewType, candidateId, interviewerId
router.get("/", skillsInterviewAssessment.getAll);

module.exports = router;
