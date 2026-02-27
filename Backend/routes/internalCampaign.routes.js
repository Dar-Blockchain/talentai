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
 * PATCH /campaigns/:campaignId/status — Changer le statut d'une campagne
 */
router.patch("/:campaignId/status", internalCampaignController.updateCampaignStatus);

/**
 * PATCH /campaigns/:campaignId/modules/:moduleId/config — Modifier la configuration d'un module
 */
router.patch("/:campaignId/modules/:moduleId/config", internalCampaignController.updateModuleConfig);

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

// Routes pour les administrateurs uniquement (optionnel)
router.get(
  "/admin/all",
  (req, res, next) => {
    // Middleware pour vérifier que c'est un admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Unauthorized: Admin access required",
      });
    }
    next();
  },
  internalCampaignController.getAllCampaigns
);

module.exports = router;
