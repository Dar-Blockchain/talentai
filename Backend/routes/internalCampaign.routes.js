/**
 * Routes pour les campagnes internes
 *
 * Applied middlewares:
 * - requireAuthUser: authentification requise
 * - controledAcces('Company'): restricted to companies
 * - authLogMiddleware: request logging
 */

const express = require("express");
const router = express.Router();
const internalCampaignController = require("../controllers/internalCampaign.controller");
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// admin-specific endpoint is defined before we apply the company-only middleware
// so that an admin user can access it without being blocked by the "Company" role check.
router.get(
  "/admin/all",
  requireAuthUser, // ensure the request is authenticated
  controledAcces("Admin"), // only users with role 'Admin' may proceed
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getAllCampaigns,
);

// user-specific endpoint to get campaigns by userId parameter
// returns all campaigns where this user is a participant
// Example: GET /internal-campaigns/employee/:userId
router.get(
  "/employee/:userId",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getUserCampaigns,
);

// employee campaign metrics: total, invited, inProgress, completed
// Example: GET /internal-campaigns/employee/:userId/metrics
router.get(
  "/employee/:userId/metrics",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  resolveCompanyActor,
  internalCampaignController.getEmployeeCampaignMetrics,
);

/**
 * POST /campaigns/:campaignId/participate/:userId — Employee joins/participates in a campaign
 */
router.post(
  "/:campaignId/participate/:userId",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.participateInCampaign,
);

/**
 * DELETE /campaigns/:campaignId/participate/:participantId — Remove a participant by CampaignParticipant _id
 */
router.delete(
  "/:campaignId/participate/:participantId",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.removeEmployeeFromCampaign,
);

/**
 * GET /campaigns/metrics — Obtenir les métriques des campagnes
 * Must be defined BEFORE /:campaignId to avoid being swallowed by the param route
 */
router.get(
  "/metrics",
  requireAuthUser,
  controledAcces(['Company', 'Employee']),
  authLogMiddleware("InternalCampaign"),
  resolveCompanyActor,
  internalCampaignController.getCampaignMetrics,
);

/**
 * GET /campaigns/:campaignId — Récupérer une campagne spécifique
 */
router.get(
  "/:campaignId",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaign,
);

/**
 * GET /campaigns/:campaignId/participants — accessible to authenticated employees who participate
 */
router.get(
  "/:campaignId/participants",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaignParticipants,
);

/**
 * PATCH /internal-campaigns/:campaignId/start/:userId
 * Mark participant IN_PROGRESS when they open the assessment
 */
router.patch(
  "/:campaignId/start/:userId",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.startAssessment,
);

/**
 * POST /internal-campaigns/:campaignId/questionnaire/save-progress
 * Auto-save draft answers without completing — public, validated via participantId + campaignId
 */
router.post(
  "/:campaignId/questionnaire/save-progress",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.saveQuestionnaireProgress,
);

/**
 * POST /internal-campaigns/:campaignId/questionnaire/submit
 * Submit questionnaire answers — public, validated via participantId + campaignId
 */
router.post(
  "/:campaignId/questionnaire/submit",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.submitQuestionnaire,
);

/**
 * GET /internal-campaigns/:campaignId/results/:participantId
 * Fetch assessment results for a specific participant — public, scoped by participantId
 */
router.get(
  "/:campaignId/results/:participantId",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getParticipantResults,
);

/**
 * GET /internal-campaigns/:campaignId/public — Public: limited campaign info by ID (no auth)
 */
router.get(
  "/:campaignId/public",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getPublicCampaignInfo
);

/**
 * GET /internal-campaigns/link/:token — Public: look up a campaign by its link token
 */
router.get(
  "/link/:token",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaignByLinkToken
);

/**
 * POST /internal-campaigns/link/:token/join — Join via link
 * Anonymous campaigns: no auth needed.
 * Nominative campaigns: requireAuthUser applied inline.
 */
router.post(
  "/link/:token/join",
  authLogMiddleware("InternalCampaign"),
  (req, res, next) => {
    // If an auth cookie is present, decode it; otherwise proceed without user context.
    // The controller handles the NOMINATIVE vs ANONYMOUS distinction.
    const { requireAuthUser: auth } = require("../middleware/authorize.middleware");
    const token = req.cookies?.api_token;
    if (token) return auth(req, res, next);
    next();
  },
  internalCampaignController.joinCampaignByLink
);

// apply generic middlewares for company users on all remaining routes
router.use(
  requireAuthUser,
  controledAcces(['Company', 'Employee']),
  authLogMiddleware("InternalCampaign"),
  resolveCompanyActor,
);

/**
 * POST /campaigns - Create a new campaign
 */
router.post("/", internalCampaignController.createInternalCampaign);

/**
 * GET /campaigns — Retrieve all company campaigns
 */
router.get("/", internalCampaignController.getCompanyCampaigns);

/**
 * GET /campaigns/metrics — Get campaign metrics
 */
router.get("/metrics", internalCampaignController.getCampaignMetrics);

/**
 * GET /campaigns/:campaignId/stats — Obtenir les statistiques d'une campagne
 */
router.get("/:campaignId/stats", internalCampaignController.getCampaignStats);

/**
 * GET /campaigns/:campaignId/sessions — Participants as sessions (company only)
 */
router.get("/:campaignId/sessions", internalCampaignController.getSessions);

/**
 * GET /campaigns/:campaignId — Retrieve a specific campaign
 */
router.get("/:campaignId/anonymous-scores", internalCampaignController.getAnonymousScores);

/**
 * GET /campaigns/:campaignId/non-participants — Employees of the company not yet in this campaign
 * Supports: search, department, role, sortBy, order, page, limit
 */
router.get(
  "/:campaignId/non-participants",
  internalCampaignController.getNonParticipants,
);

/**
 * PATCH /campaigns/:campaignId/status — Changer le statut d'une campagne
 */
router.patch(
  "/:campaignId/status",
  internalCampaignController.updateCampaignStatus,
);

/**
 * PUT /campaigns/:campaignId - Update a campaign
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);

/**
 * DELETE /campaigns/:campaignId - Delete a campaign
 */
router.delete(
  "/:campaignId",
  internalCampaignController.deleteInternalCampaign,
);

module.exports = router;
