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
  getStatistics
} = require('../controllers/InterviewControllers/SkillInterviewAssessmentController');

// Import middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// ========== AUTHENTICATED ROUTES ==========
router.use(requireAuthUser, authLogMiddleware("SkillInterviewAssessment"));

// ========== CREATE ==========
// POST /api/skill-interview-assessments
router.post('/', create);

// ========== READ ==========
// ⚠️ IMPORTANT: Specific routes must come BEFORE /:id to avoid conflicts

// GET /api/skill-interview-assessments/stats/global
//router.get('/stats/global', getStatistics);

// GET /api/skill-interview-assessments/session/:sessionId
//router.get('/session/:sessionId', getBySessionId);

// GET /api/skill-interview-assessments/candidate/:candidateId
//router.get('/candidate/:candidateId', getByCandidate);

// GET /api/skill-interview-assessments/interviewer/:interviewerId
//router.get('/interviewer/:interviewerId', getByInterviewer);

// GET /api/skill-interview-assessments/:id/summary
//router.get('/:id/summary', getSummary);

// GET /api/skill-interview-assessments/:id
//router.get('/:id', getById);

// GET /api/skill-interview-assessments (must be last among GET routes)
// Query params: page, limit, interviewType, candidateId, interviewerId
//router.get('/', getAll);

// ========== UPDATE ==========
// PUT /api/skill-interview-assessments/:id
//router.put('/:id', update);

// PATCH /api/skill-interview-assessments/:id/archive
//router.patch('/:id/archive', archive);

// ========== DELETE ==========
// DELETE /api/skill-interview-assessments/:id
//router.delete('/:id', deleteAssessment);

module.exports = router;
