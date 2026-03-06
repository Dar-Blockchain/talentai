const express = require('express');
const router = express.Router();
const InterviewApplicantController = require('../controllers/interviewApplicant.controller');

// POST /interview-applicants — register applicant when link opens
router.post('/', InterviewApplicantController.register);

// GET /interview-applicants/job/:jobId — list all applicants for a job
router.get('/job/:jobId', InterviewApplicantController.getByJob);

// PATCH /interview-applicants/:id/status — update interview status
router.patch('/:id/status', InterviewApplicantController.updateStatus);

module.exports = router;
