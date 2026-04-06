/**
 * Routes pour les participants aux campagnes
 *
 * Middlewares appliqués:
 * - requireAuthUser: authentification requise
 * - controledAcces('Company') ou pas de contrôle pour les anonymes
 * - authLogMiddleware: journalisation des requêtes
 */

const express = require("express");
const router = express.Router();
const campaignParticipantController = require("../controllers/campaignParticipant.controller");

// Import des middlewares
const { requireAuthUser } = require("../middleware/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

/**
 * POST /campaigns/:campaignId/participants — Ajouter un participant
 * Middleware: authentification requise + access company
 */
router.post(
  "/:campaignId/participants",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.addCampaignParticipant,
);

/**
 * GET /campaigns/:campaignId/participants — Récupérer tous les participants d'une campagne
 * Query: ?status=NOT_STARTED|INVITED|IN_PROGRESS|COMPLETED|DROPPED
 * Middleware: authentification requise + access company
 */
router.get(
  "/:campaignId/participants",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getCampaignParticipants,
);

/**
 * GET /participants/:participantId — Récupérer un participant spécifique
 * Middleware: authentification requise + access company
 */
router.get(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getParticipant,
);

/**
 * GET /participants/token/:token — Récupérer un participant par son token anonyme
 * Note: Peut être appelé sans authentification pour les campagnes anonymes
 */
router.get(
  "/token/:token",
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getParticipantByToken,
);

/**
 * PUT /participants/:participantId — Mettre à jour un participant
 * Body: { status, accessedAt, completedAt }
 * Middleware: authentification requise + access company
 */
router.put(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.updateCampaignParticipant,
);

/**
 * DELETE /participants/:participantId — Supprimer un participant
 * Middleware: authentification requise + access company
 */
router.delete(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.deleteCampaignParticipant,
);

// Routes additionnelles (optionnelles)

/**
 * PATCH /participants/:participantId/drop — Marquer un participant comme abandonné
 * Body: { reason (optionnel) }
 */
router.patch(
  "/:participantId/drop",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  async (req, res) => {
    try {
      const { participantId } = req.params;
      const { reason } = req.body;
      const campaignParticipantService = require("../services/campaignParticipant.service");

      const participant =
        await campaignParticipantService.markParticipantAsDropped(
          participantId,
          reason,
        );

      res.status(200).json({
        success: true,
        message: "Participant marked as dropped",
        data: participant,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

/**
 * POST /campaigns/:campaignId/participants/bulk — Ajouter plusieurs participants en masse
 * Body: { participants: [{ email, employeeId, anonymousToken }] }
 */
router.post(
  "/:campaignId/participants/bulk",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  async (req, res) => {
    try {
      const { campaignId } = req.params;
      const { participants } = req.body;

      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
      ) {
        return res.status(400).json({
          success: false,
          error: "participants array is required and must not be empty",
        });
      }

      const campaignParticipantService = require("../services/campaignParticipant.service");

      const result = await campaignParticipantService.bulkAddParticipants(
        campaignId,
        participants,
      );

      res.status(201).json({
        success: true,
        message: `${result.length} participants added successfully`,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  },
);

module.exports = router;
