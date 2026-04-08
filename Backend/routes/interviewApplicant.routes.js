const express = require('express');
const router = express.Router();
const InterviewApplicantController = require('../controllers/interviewApplicant.controller');
const { requireAuthUser } = require('../middleware/security/auth.middleware');

// POST /interview-applicants — register applicant when link opens
router.post('/', InterviewApplicantController.register);

// GET /interview-applicants/validate/:jobId — validate logged-in user is the intended recipient
router.get('/validate/:jobId', requireAuthUser, InterviewApplicantController.validateAccess);

// GET /interview-applicants/job/:jobId — list all applicants for a job
router.get('/job/:jobId', InterviewApplicantController.getByJob);

// PATCH /interview-applicants/:id/status — update interview status
router.patch('/:id/status', InterviewApplicantController.updateStatus);

module.exports = router;
