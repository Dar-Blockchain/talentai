const express = require("express");
const router = express.Router();
const campaignController = require("./campaign.controller");
const { requireAuth } = require("../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../../middleware/authorize.middleware.js");
const resolveCompanyActor = require("../../middleware/resolve-company-actor.middleware");

// Public / participant routes (no auth or optional auth)
router.get("/employee/:userId", requireAuth, authLogMiddleware("InternalCampaign"), campaignController.getUserCampaigns);
router.get("/employee/:userId/metrics", requireAuth, authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getEmployeeCampaignMetrics);
router.post("/:campaignId/participate/:userId", requireAuth, authLogMiddleware("InternalCampaign"), campaignController.participateInCampaign);
router.delete("/:campaignId/participate/:participantId", requireAuth, authLogMiddleware("InternalCampaign"), campaignController.removeEmployeeFromCampaign);
router.get("/metrics", requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getCampaignMetrics);
router.get("/analytics", requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getCampaignAnalytics);
router.get("/recent-completions", requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getRecentCompletions);
router.get("/completions-trend", requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getCompletionsTrend);
router.get("/table", requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"), resolveCompanyActor, campaignController.getCampaignsOverviewTable);
router.get("/link/:token", authLogMiddleware("InternalCampaign"), campaignController.getCampaignByLinkToken);
router.post("/link/:token/join", authLogMiddleware("InternalCampaign"), (req, res, next) => {
  const token = req.headers.authorization?.startsWith("Bearer ") || req.cookies?.jwt_token;
  if (token) return requireAuth(req, res, next);
  next();
}, campaignController.joinCampaignByLink);
router.get("/:campaignId", authLogMiddleware("InternalCampaign"), campaignController.getCampaign);
router.get("/:campaignId/participants", requireAuth, authLogMiddleware("InternalCampaign"), campaignController.getCampaignParticipants);
router.patch("/:campaignId/start/:userId", requireAuth, authLogMiddleware("InternalCampaign"), campaignController.startAssessment);
router.post("/:campaignId/questionnaire/save-progress", authLogMiddleware("InternalCampaign"), campaignController.saveQuestionnaireProgress);
router.post("/:campaignId/questionnaire/submit", authLogMiddleware("InternalCampaign"), campaignController.submitQuestionnaire);
router.get("/:campaignId/results/:participantId", authLogMiddleware("InternalCampaign"), campaignController.getParticipantResults);

// Company / Employee routes (auth required)
router.use(requireAuth, controledAcces(["Company", "Employee"]), authLogMiddleware("InternalCampaign"));

router.post("/", campaignController.createInternalCampaign);
router.get("/", campaignController.getCompanyCampaigns);
router.get("/:campaignId/sessions", campaignController.getSessions);
router.get("/:campaignId/participants/:participantId/results", campaignController.getParticipantResultsForCompany);
router.get("/:campaignId/non-participants", campaignController.getNonParticipants);
router.patch("/:campaignId/status", campaignController.updateCampaignStatus);
router.put("/:campaignId", campaignController.updateInternalCampaign);
router.delete("/:campaignId", campaignController.deleteInternalCampaign);

module.exports = router;
