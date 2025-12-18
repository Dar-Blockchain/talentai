/**
 * Pipeline Interview Routes
 * Routes for fetching interview configuration from pipeline steps
 */

const express = require('express');
const router = express.Router();
const pipelineInterviewController = require('../controllers/InterviewControllers/pipelineInterviewController');
const candidateProgressController = require('../controllers/InterviewControllers/candidateProgressController');

// ===== Pipeline Interview Configuration =====

// Get interview parameters for a specific step
router.get('/params/:jobId/:stepNumber', pipelineInterviewController.getInterviewParamsForStep);

// Get all interview steps for a job
router.get('/steps/:jobId', pipelineInterviewController.getInterviewSteps);

// ===== Candidate Progress Management =====

// Initialize or get candidate progress
router.post('/progress/initialize', candidateProgressController.initializeProgress);

// Get candidate progress
router.get('/progress/:candidateId/:jobId', candidateProgressController.getProgress);

// Update step status after interview completion
router.put('/progress/update-step', candidateProgressController.updateStepStatus);

// Move to next step
router.post('/progress/next-step', candidateProgressController.moveToNextStep);

module.exports = router;
