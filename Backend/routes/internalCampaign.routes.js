/**
 * Routes pour les campagnes internes
 *
 * Middlewares appliqués:
 * - requireAuthUser: authentification requise
 * - controledAcces('Company'): réservé aux entreprises
 * - authLogMiddleware: journalisation des requêtes
 */

const express = require("express");
const router = express.Router();
const internalCampaignController = require("../controllers/internalCampaign.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

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
  controledAcces("Company"),
  authLogMiddleware("InternalCampaign"),
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

// apply generic middlewares for company users on all remaining routes
router.use(
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("InternalCampaign"),
);

/**
 * POST /campaigns — Créer une nouvelle campagne
 */
router.post("/", internalCampaignController.createInternalCampaign);

/**
 * GET /campaigns — Récupérer toutes les campagnes de l'entreprise
 */
router.get("/", internalCampaignController.getCompanyCampaigns);

/**
 * GET /campaigns/:campaignId/stats — Obtenir les statistiques d'une campagne
 */
router.get("/:campaignId/stats", internalCampaignController.getCampaignStats);

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
 * PUT /campaigns/:campaignId — Mettre à jour une campagne
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);

/**
 * DELETE /campaigns/:campaignId — Supprimer une campagne
 */
router.delete(
  "/:campaignId",
  internalCampaignController.deleteInternalCampaign,
);

module.exports = router;
