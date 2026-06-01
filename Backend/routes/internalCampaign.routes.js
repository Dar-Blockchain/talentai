/**
 * Routes pour les campagnes internes
 *
 * Applied middlewares:
 * - requireAuth: authentification requise
 * - controledAcces('Company'): restricted to companies
 * - authLogMiddleware: request logging
 */

const express = require("express");
const router = express.Router();
const internalCampaignController = require("../controllers/internalCampaign.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

/**
 * @openapi
 * /internal-campaigns/admin/all:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get all campaigns across all companies (Admin)
 *     responses:
 *       200:
 *         description: All campaigns
 *       403:
 *         description: Admin role required
 */
router.get(
  "/admin/all",
  requireAuth,
  controledAcces("Admin"),
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getAllCampaigns,
);

/**
 * @openapi
 * /internal-campaigns/employee/{userId}:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get campaigns for a specific employee (as participant)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Employee's campaigns
 */
router.get(
  "/employee/:userId",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getUserCampaigns,
);

/**
 * @openapi
 * /internal-campaigns/employee/{userId}/metrics:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Campaign metrics for an employee (total, invited, inProgress, completed)
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Employee campaign metrics
 */
router.get(
  "/employee/:userId/metrics",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  resolveCompanyActor,
  internalCampaignController.getEmployeeCampaignMetrics,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/participate/{userId}:
 *   post:
 *     tags: [Internal Campaigns]
 *     summary: Join / participate in a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participation recorded
 */
router.post(
  "/:campaignId/participate/:userId",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.participateInCampaign,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/participate/{participantId}:
 *   delete:
 *     tags: [Internal Campaigns]
 *     summary: Remove a participant from a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant removed
 */
router.delete(
  "/:campaignId/participate/:participantId",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.removeEmployeeFromCampaign,
);

/**
 * @openapi
 * /internal-campaigns/metrics:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get campaign metrics for authenticated company/employee
 *     responses:
 *       200:
 *         description: Campaign metrics
 */
router.get(
  "/metrics",
  requireAuth,
  controledAcces(['Company', 'Employee']),
  authLogMiddleware("InternalCampaign"),
  resolveCompanyActor,
  internalCampaignController.getCampaignMetrics,
);

/**
 * @openapi
 * /internal-campaigns/link/{token}:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Look up a campaign by its share link token (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign info
 *       404:
 *         description: Token not found
 */
router.get(
  "/link/:token",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaignByLinkToken
);

/**
 * @openapi
 * /internal-campaigns/link/{token}/join:
 *   post:
 *     tags: [Internal Campaigns]
 *     summary: Join a campaign via share link (anonymous or authenticated)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Joined campaign
 */
router.post(
  "/link/:token/join",
  authLogMiddleware("InternalCampaign"),
  (req, res, next) => {
    const token = req.cookies?.api_token;
    if (token) return requireAuth(req, res, next);
    next();
  },
  internalCampaignController.joinCampaignByLink
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get a specific campaign by ID
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign details
 *       404:
 *         description: Not found
 */
router.get(
  "/:campaignId",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaign,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/participants:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get participants of a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of participants
 */
router.get(
  "/:campaignId/participants",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getCampaignParticipants,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/start/{userId}:
 *   patch:
 *     tags: [Internal Campaigns]
 *     summary: Mark participant as IN_PROGRESS when they open the assessment
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Status updated to IN_PROGRESS
 */
router.patch(
  "/:campaignId/start/:userId",
  requireAuth,
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.startAssessment,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/questionnaire/save-progress:
 *   post:
 *     tags: [Internal Campaigns]
 *     summary: Auto-save draft questionnaire answers (public, validated via participantId)
 *     security: []
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
 *             required: [participantId, answers]
 *             properties:
 *               participantId: { type: string }
 *               answers: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Progress saved
 */
router.post(
  "/:campaignId/questionnaire/save-progress",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.saveQuestionnaireProgress,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/questionnaire/submit:
 *   post:
 *     tags: [Internal Campaigns]
 *     summary: Submit final questionnaire answers (public, validated via participantId)
 *     security: []
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
 *             required: [participantId, answers]
 *             properties:
 *               participantId: { type: string }
 *               answers: { type: array, items: { type: object } }
 *     responses:
 *       200:
 *         description: Questionnaire submitted
 */
router.post(
  "/:campaignId/questionnaire/submit",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.submitQuestionnaire,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/results/{participantId}:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Fetch assessment results for a specific participant (public, scoped by participantId)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Participant results
 */
router.get(
  "/:campaignId/results/:participantId",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getParticipantResults,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/public:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get limited public campaign info (no auth)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Public campaign info
 */
router.get(
  "/:campaignId/public",
  authLogMiddleware("InternalCampaign"),
  internalCampaignController.getPublicCampaignInfo
);

// apply generic middlewares for company users on all remaining routes
router.use(
  requireAuth,
  controledAcces(['Company', 'Employee']),
  authLogMiddleware("InternalCampaign")
);

/**
 * @openapi
 * /internal-campaigns:
 *   post:
 *     tags: [Internal Campaigns]
 *     summary: Create a new internal campaign (Company/Employee)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               type: { type: string, enum: [NOMINATIVE, ANONYMOUS] }
 *     responses:
 *       201:
 *         description: Campaign created
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get all campaigns for current company
 *     responses:
 *       200:
 *         description: List of campaigns
 */
router.post("/", internalCampaignController.createInternalCampaign);
router.get("/", internalCampaignController.getCompanyCampaigns);
router.get("/metrics", internalCampaignController.getCampaignMetrics);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/stats:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get statistics for a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign statistics
 */
router.get("/:campaignId/stats", internalCampaignController.getCampaignStats);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/sessions:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get participants as sessions (company view)
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Sessions list
 */
router.get("/:campaignId/sessions", internalCampaignController.getSessions);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/anonymous-scores:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Get anonymous scores for a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Anonymous scores
 */
router.get("/:campaignId/anonymous-scores", internalCampaignController.getAnonymousScores);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/non-participants:
 *   get:
 *     tags: [Internal Campaigns]
 *     summary: Employees not yet in this campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Non-participant employees
 */
router.get(
  "/:campaignId/non-participants",
  internalCampaignController.getNonParticipants,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}/status:
 *   patch:
 *     tags: [Internal Campaigns]
 *     summary: Change a campaign's status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, CLOSED, ARCHIVED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.patch(
  "/:campaignId/status",
  internalCampaignController.updateCampaignStatus,
);

/**
 * @openapi
 * /internal-campaigns/{campaignId}:
 *   put:
 *     tags: [Internal Campaigns]
 *     summary: Update a campaign
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
 *     responses:
 *       200:
 *         description: Campaign updated
 *   delete:
 *     tags: [Internal Campaigns]
 *     summary: Delete a campaign
 *     parameters:
 *       - in: path
 *         name: campaignId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Campaign deleted
 */
router.put("/:campaignId", internalCampaignController.updateInternalCampaign);
router.delete(
  "/:campaignId",
  internalCampaignController.deleteInternalCampaign,
);

module.exports = router;
