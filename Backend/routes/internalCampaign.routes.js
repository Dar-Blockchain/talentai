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
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

// admin-specific endpoint is defined before we apply the company-only middleware
// so that an admin user can access it without being blocked by the "Company" role check.
router.get(
  "/admin/all",
  requireAuth,           // ensure the request is authenticated
  controledAcces("Admin"),  // only users with role 'Admin' may proceed
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getAllCampaigns
);

// apply generic middlewares for company users on all remaining routes
router.use(
  requireAuth,
  controledAcces("Company"),
  authLogMiddleware("InternalCampaign")
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
 * PATCH /campaigns/:campaignId/status — Changer le statut d'une campagne
 */
router.patch("/:campaignId/status", internalCampaignController.updateCampaignStatus);

/**
 * GET /campaigns/:campaignId — Retrieve a specific campaign
 */
router.get("/:campaignId", internalCampaignController.getCampaign);

/**
 * PUT /campaigns/:campaignId - Update a campaign
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);

/**
 * DELETE /campaigns/:campaignId - Delete a campaign
 */
router.delete("/:campaignId", internalCampaignController.deleteInternalCampaign);


module.exports = router;
