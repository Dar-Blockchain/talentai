const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getById,
  getBySessionId,
  getByCandidate,
  getByInterviewer,
  update,
  deleteAssessment,
  archive,
  getSummary,
  getStatistics,
  getMy
} = require('../controllers/InterviewControllers/SkillInterviewAssessment.controller');

// Import middlewares
const { requireAuth } = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware");

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuth, authLogMiddleware("SkillInterviewAssessment"));

// ========== CREATE ==========
// POST /api/skill-interview-assessments
router.post('/', create);

// ========== READ ==========
// ⚠️ IMPORTANT: Specific routes must come BEFORE /:id to avoid conflicts

// GET /api/skill-interview-assessments/my
router.get('/my', getMy);

// GET /api/skill-interview-assessments/session/:sessionId
//router.get('/session/:sessionId', getBySessionId);

// GET /api/skill-interview-assessments/:id
router.get('/:id', getById);

// GET /api/skill-interview-assessments (must be last among GET routes)
// Query params: page, limit, interviewType, candidateId, interviewerId
router.get('/', getAll);

module.exports = router;
