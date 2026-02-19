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

// Import des middlewares
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

// Appliquer les middlewares globaux
router.use(
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("InternalCampaign")
);

/**
 * POST /campaigns — Créer une nouvelle campagne
 * Body: { title, type, description, anonymityMode, modules, accessMethod, targetDepartment, targetEmployeeCount, deadline }
 */
router.post("/", internalCampaignController.createInternalCampaign);

/**
 * GET /campaigns — Récupérer toutes les campagnes de l'entreprise
 * Query: ?status=ACTIVE|DRAFT|PAUSED|CLOSED|EXPIRED
 */
router.get("/", internalCampaignController.getCompanyCampaigns);

/**
 * GET /campaigns/:campaignId — Récupérer une campagne spécifique
 */
router.get("/:campaignId", internalCampaignController.getCampaign);

/**
 * PUT /campaigns/:campaignId — Mettre à jour une campagne
 * Body: { title, type, description, anonymityMode, modules, accessMethod, targetDepartment, targetEmployeeCount, deadline }
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);

/**
 * DELETE /campaigns/:campaignId — Supprimer une campagne
 */
router.delete(
  "/:campaignId",
  internalCampaignController.deleteInternalCampaign
);

// Routes additionnelles (optionnelles)

/**
 * GET /campaigns/:campaignId/stats — Obtenir les statistiques d'une campagne
 */
router.get(
  "/:campaignId/stats",
  internalCampaignController.getCampaignStats
);

/**
 * PATCH /campaigns/:campaignId/status — Changer le statut d'une campagne
 * Body: { status }
 */
router.patch("/:campaignId/status", (req, res) => {
  const campaignService = require("../services/internalCampaign.service");
  const { campaignId } = req.params;
  const { status } = req.body;

  campaignService
    .updateCampaignStatus(campaignId, status)
    .then((campaign) => {
      res.status(200).json({
        success: true,
        message: "Campaign status updated successfully",
        data: campaign,
      });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    });
});

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
