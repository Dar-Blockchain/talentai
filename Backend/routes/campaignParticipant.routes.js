/**
 * Routes pour les participants aux campagnes
 *
 * Applied middlewares:
 * - requireAuthUser: authentification requise
 * - controledAcces('Company') or no control for anonymous
 * - authLogMiddleware: request logging
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
 * GET /campaigns/:campaignId/participants — Retrieve all participants in a campaign
 * Query: ?status=INVITED|IN_PROGRESS|COMPLETED|DROPPED
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
 * GET /participants/:participantId — Retrieve a specific participant
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
 * GET /participants/token/:token — Retrieve participant by anonymous token
 * Note: Can be called without authentication for anonymous campaigns
 */
router.get(
  "/token/:token",
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getParticipantByToken,
);

/**
 * PUT /participants/:participantId - Update a participant
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
 * DELETE /participants/:participantId - Delete a participant
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
 * PATCH /participants/:participantId/drop — Mark participant as dropped
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
