const express = require("express");
const router = express.Router();
const campaignResponseController = require("../../controllers/campaignResponse.controller");
const authenticate = require("../../middleware/authenticate");

/**
 * Create a new campaign response
 * POST /api/campaigns/:campaignId/responses
 */
router.post(
  "/:campaignId/responses",
  authenticate,
  campaignResponseController.createCampaignResponse
);

/**
 * Get all responses for a campaign
 * GET /api/campaigns/:campaignId/responses
 */
router.get(
  "/:campaignId/responses",
  authenticate,
  campaignResponseController.getCampaignResponses
);

/**
 * Get responses by module type
 * GET /api/campaigns/:campaignId/responses/module/:moduleType
 */
router.get(
  "/:campaignId/responses/module/:moduleType",
  authenticate,
  campaignResponseController.getResponsesByModuleType
);

/**
 * Get campaign response statistics
 * GET /api/campaigns/:campaignId/responses/stats
 */
router.get(
  "/:campaignId/responses/stats",
  authenticate,
  campaignResponseController.getCampaignStatistics
);

/**
 * Get a specific campaign response by ID
 * GET /api/campaigns/:campaignId/responses/:responseId
 */
router.get(
  "/:campaignId/responses/:responseId",
  authenticate,
  campaignResponseController.getCampaignResponse
);

/**
 * Update campaign response
 * PUT /api/campaigns/:campaignId/responses/:responseId
 */
router.put(
  "/:campaignId/responses/:responseId",
  authenticate,
  campaignResponseController.updateCampaignResponse
);

/**
 * Add answer to response
 * POST /api/campaigns/:campaignId/responses/:responseId/answers
 */
router.post(
  "/:campaignId/responses/:responseId/answers",
  authenticate,
  campaignResponseController.addAnswer
);

/**
 * Update answer in response
 * PUT /api/campaigns/:campaignId/responses/:responseId/answers/:questionId
 */
router.put(
  "/:campaignId/responses/:responseId/answers/:questionId",
  authenticate,
  campaignResponseController.updateAnswer
);

/**
 * Add interview transcript message
 * POST /api/campaigns/:campaignId/responses/:responseId/transcript
 */
router.post(
  "/:campaignId/responses/:responseId/transcript",
  authenticate,
  campaignResponseController.addTranscriptMessage
);

/**
 * Update AI score
 * PUT /api/campaigns/:campaignId/responses/:responseId/ai-score
 */
router.put(
  "/:campaignId/responses/:responseId/ai-score",
  authenticate,
  campaignResponseController.updateAIScore
);

/**
 * Update test results
 * PUT /api/campaigns/:campaignId/responses/:responseId/test-results
 */
router.put(
  "/:campaignId/responses/:responseId/test-results",
  authenticate,
  campaignResponseController.updateTestResults
);

/**
 * Delete campaign response
 * DELETE /api/campaigns/:campaignId/responses/:responseId
 */
router.delete(
  "/:campaignId/responses/:responseId",
  authenticate,
  campaignResponseController.deleteCampaignResponse
);

/**
 * Delete all responses for a campaign
 * DELETE /api/campaigns/:campaignId/responses
 */
router.delete(
  "/:campaignId/responses",
  authenticate,
  campaignResponseController.deleteAllCampaignResponses
);

// Participant responses routes
/**
 * Get all responses for a participant
 * GET /api/participants/:participantId/responses
 */
router.get(
  "/participant/:participantId/responses",
  authenticate,
  campaignResponseController.getParticipantResponses
);

module.exports = router;
