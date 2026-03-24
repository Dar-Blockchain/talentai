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
  requireAuthUser,           // ensure the request is authenticated
  controledAcces("Admin"),  // only users with role 'Admin' may proceed
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getAllCampaigns
);

// user-specific endpoint to get campaigns they participate in
// returns all campaigns where this user is a participant
router.get(
  "/employee/my",
  requireAuthUser,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getUserCampaigns
);

// apply generic middlewares for company users on all remaining routes
router.use(
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("InternalCampaign")
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
 * GET /campaigns/metrics — Obtenir les métriques des campagnes
 */
router.get("/metrics", internalCampaignController.getCampaignMetrics);

/**
 * GET /campaigns/:campaignId/stats — Obtenir les statistiques d'une campagne
 */
router.get("/:campaignId/stats", internalCampaignController.getCampaignStats);

/**
 * GET /campaigns/:campaignId/participants — Obtenir les participants d'une campagne (avec filtres et pagination)
 */
router.get("/:campaignId/participants", internalCampaignController.getCampaignParticipants);

/**
 * PATCH /campaigns/:campaignId/status — Changer le statut d'une campagne
 */
router.patch("/:campaignId/status", internalCampaignController.updateCampaignStatus);

/**
 * GET /campaigns/:campaignId — Récupérer une campagne spécifique
 */
router.get("/:campaignId", internalCampaignController.getCampaign);

/**
 * PUT /campaigns/:campaignId — Mettre à jour une campagne
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);

/**
 * DELETE /campaigns/:campaignId — Supprimer une campagne
 */
router.delete("/:campaignId", internalCampaignController.deleteInternalCampaign);


module.exports = router;
