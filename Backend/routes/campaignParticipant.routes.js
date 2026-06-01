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
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

/**
 * @openapi
 * /campaign-participants/{campaignId}/participants:
 *   post:
 *     tags: [Campaign Participants]
 *     summary: Add a participant to a campaign (Company)
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *               employeeId: { type: string }
 *     responses:
 *       201:
 *         description: Participant added
 *   get:
 *     tags: [Campaign Participants]
 *     summary: Get all participants in a campaign (Company)
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [INVITED, IN_PROGRESS, COMPLETED, DROPPED]
 *     responses:
 *       200:
 *         description: List of participants
 */
router.post(
  "/:campaignId/participants",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.addCampaignParticipant,
);
router.get(
  "/:campaignId/participants",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getCampaignParticipants,
);

/**
 * @openapi
 * /campaign-participants/token/{token}:
 *   get:
 *     tags: [Campaign Participants]
 *     summary: Get participant by anonymous token (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant details
 *       404:
 *         description: Token not found
 */
router.get(
  "/token/:token",
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getParticipantByToken,
);

/**
 * @openapi
 * /campaign-participants/{participantId}:
 *   get:
 *     tags: [Campaign Participants]
 *     summary: Get a specific participant (Company)
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant details
 *   put:
 *     tags: [Campaign Participants]
 *     summary: Update a participant (Company)
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string }
 *               accessedAt: { type: string, format: date-time }
 *               completedAt: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Participant updated
 *   delete:
 *     tags: [Campaign Participants]
 *     summary: Delete a participant (Company)
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant deleted
 */
router.get(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.getParticipant,
);
router.put(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.updateCampaignParticipant,
);
router.delete(
  "/:participantId",
  requireAuthUser,
  controledAcces("Company"),
  authLogMiddleware("CampaignParticipant"),
  campaignParticipantController.deleteCampaignParticipant,
);

/**
 * @openapi
 * /campaign-participants/{participantId}/drop:
 *   patch:
 *     tags: [Campaign Participants]
 *     summary: Mark a participant as dropped
 *     parameters:
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Participant marked as dropped
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
 * @openapi
 * /campaign-participants/{campaignId}/participants/bulk:
 *   post:
 *     tags: [Campaign Participants]
 *     summary: Bulk-add participants to a campaign (Company)
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [participants]
 *             properties:
 *               participants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     email: { type: string, format: email }
 *                     employeeId: { type: string }
 *                     anonymousToken: { type: string }
 *     responses:
 *       201:
 *         description: Participants added in bulk
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
