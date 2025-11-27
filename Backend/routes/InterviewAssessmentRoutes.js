const express = require('express');
const router = express.Router();
const {
  create,
  getById,
  getBySessionId,
  getAll,
  getByCandidate,
  getBySkill,
  update,
  updateStatus,
  deleteAssessment,
  archive,
  getSummary,
  getStatistics
} = require('../controllers/InterviewAssessmentController');

// CRUD Routes

// POST - Create a new assessment
// POST /api/interview-assessments
router.post('/', create);

// GET - Retrieve all assessments (with pagination and filters)
// GET /api/interview-assessments?page=1&limit=10&status=completed&skill=Node.js
router.get('/', getAll);

// GET - Get global statistics
// GET /api/interview-assessments/stats/global
router.get('/stats/global', getStatistics);

// GET - Retrieve an assessment by ID
// GET /api/interview-assessments/:id
router.get('/:id', getById);

// GET - Get assessment summary
// GET /api/interview-assessments/:id/summary
router.get('/:id/summary', getSummary);

// GET - Retrieve assessment by sessionId
// GET /api/interview-assessments/session/:sessionId
router.get('/session/:sessionId', getBySessionId);

// GET - Retrieve assessments by candidate
// GET /api/interview-assessments/candidate/:candidateId?page=1&limit=10
router.get('/candidate/:candidateId', getByCandidate);

// GET - Retrieve assessments by skill
// GET /api/interview-assessments/skill/:skill?page=1&limit=10
router.get('/skill/:skill', getBySkill);

// PUT - Update an assessment
// PUT /api/interview-assessments/:id
router.put('/:id', update);

// PATCH - Update status
// PATCH /api/interview-assessments/:id/status
router.patch('/:id/status', updateStatus);

// PATCH - Archive an assessment
// PATCH /api/interview-assessments/:id/archive
router.patch('/:id/archive', archive);

// DELETE - Delete an assessment
// DELETE /api/interview-assessments/:id
router.delete('/:id', deleteAssessment);

module.exports = router;

module.exports = router;
