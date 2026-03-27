/**
 * Routes des agents RH (validation, profils HCS-11, diagnostics, outillage)
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 * - LogMiddleware("HRAgent"): journalise les actions sur les agents RH
 *
 * Note: while some routes are intended for administrators,
 * role restriction is not enforced here. To be considered if needed:
 * `controledAcces('Admin')`.
 */
const express = require("express");
const router = express.Router();
const hrAgentController = require("../controllers/hrAgent.controller");

// Import middlewares
const { requireAuthUser } = require('../middleware/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware");
const resolveCompanyActor = require("../middleware/resolve-company-actor.middleware");

// Auth requis + journalisation
router.use( authLogMiddleware("HRAgent"));

/**
 * @route POST /hr-agents/initialize
 * @desc Initializes 6 HR validation agents with Hedera wallets (one-time operation)
 * @access Private (Admin recommended)
 */
router.post("/initialize",requireAuthUser, hrAgentController.initializeAgents);

/**
 * @route POST /hr-agents/initialize-single
 * @desc Initialize single HR agent with HCS-11 profile using data from request body
 * @access Private (Admin only)
 */
router.post("/initialize-single",requireAuthUser, hrAgentController.initializeSingleAgent);

/**
 * @route POST /hr-agents
 * @desc Creates a new HR agent
 * @access Private (Admin recommended)
 */
router.post("/",requireAuthUser, hrAgentController.createAgent);

/**
 * @route GET /hr-agents/all
 * @desc Lists all HR agents
 * @access Private
 */
router.get("/all",requireAuthUser, hrAgentController.getAllAgents);

/**
 * @route GET /hr-agents/company/:companyId
 * @desc Retrieves agents by company
 * @access Private
 */
router.get("/company",requireAuthUser,resolveCompanyActor, hrAgentController.getAgentsByCompany);

/**
 * @route GET /hr-agents/avatar/:avatarName
 * @desc Retrieves agent by avatar name
 * @access Private
 */
router.get("/avatar/:avatarName",requireAuthUser, hrAgentController.getAgentByAvatar);

/**
 * @route GET /hr-agents/role/:role
 * @desc Retrieves agents by role
 * @access Private
 */
router.get("/role/:role",requireAuthUser, hrAgentController.getAgentsByRole);

/**
 * @route GET /hr-agents/:agentId/matches
 * @desc Calculate and return matches for a specific agent (on-demand, can be slow)
 * @access Private (requires authentication)
 */
router.get("/:agentId/matches", requireAuthUser, hrAgentController.getAgentMatches);

/**
 * @route POST /hr-agents/send-validation-message
 * @desc Sends a validation message (Sinda → Coordinator) via Bedrock AI
 * @access Private
 */
router.post("/send-validation-message", hrAgentController.sendValidationMessage);

/**
 * @route POST /hr-agents/submit-evaluation-message
 * @desc Triggers automated conversation between two agents (Bedrock AI)
 * @access Private
 */
router.post("/submit-evaluation-message", hrAgentController.submitEvaluationMessage);

/**
 * @route GET /hr-agents/diagnose/:coordinatorId
 * @desc Diagnoses coordinator issues and verifies proof of reception
 * @access Private
 */
router.get("/diagnose/:coordinatorId",requireAuthUser, hrAgentController.diagnoseCoordinator);

/**
 * @route POST /hr-agents/fix-proof-of-reception
 * @desc Manually sends proof of reception for a coordinator
 * @access Private
 */
router.post("/fix-proof-of-reception",requireAuthUser, hrAgentController.fixProofOfReception);

/**
 * @route POST /hr-agents/fix-memo/:agentId
 * @desc Fixes the HCS-11 memo to resolve profile validation issues
 * @access Private
 */
router.post("/fix-memo/:agentId",requireAuthUser, hrAgentController.fixAgentMemo);

/**
 * @route GET /hr-agents/check-all
 * @desc Verifies configuration of all agents and proposes recommendations
 * @access Private
 */
router.get("/check-all",requireAuthUser, hrAgentController.checkAllAgents);

/**
 * @route GET /hr-agents/profile/:agentId
 * @desc Details of HCS-11 profile and communication topics of an agent
 * @access Private
 */
router.get("/profile/:agentId",requireAuthUser, hrAgentController.getAgentProfile);

/**
 * @route POST /hr-agents/validate-hcs11/:agentId
 * @desc Validates HCS-11 compliance of agent profile
 * @access Private
 */
router.post("/validate-hcs11/:agentId",requireAuthUser, hrAgentController.validateAgentHCS11);

/**
 * @route PUT /hr-agents/update-profile/:agentId
 * @desc Updates agent HCS-11 profile
 * @access Private
 */
router.put("/update-profile/:agentId",requireAuthUser, hrAgentController.updateAgentProfile);

/**
 * @route GET /hr-agents/verify-memo/:accountId
 * @desc Verifies HCS-11 memo on a Hedera account
 * @access Private
 */
router.get("/verify-memo/:accountId",requireAuthUser, hrAgentController.verifyAccountMemo);

/**
 * @route POST /hr-agents/update-all-memos
 * @desc Batch updates HCS-11 memos for all active agents
 * @access Private
 */
router.post("/update-all-memos",requireAuthUser, hrAgentController.updateAllAgentMemos);

/**
 * @route GET /hr-agents/test-langchain
 * @desc Tests Bedrock AI agent functionality
 * @access Private
 */
router.get("/test-langchain",requireAuthUser, hrAgentController.testLangChainAgent);

/**
 * @route GET /hr-agents/test-memo/:agentId
 * @desc Tests memo creation for a specific agent
 * @access Private
 */
router.get("/test-memo/:agentId",requireAuthUser, hrAgentController.testMemoCreation);

/**
 * @route GET /hr-agents/system-status
 * @desc Retrieves complete system status and migration info
 * @access Private
 */
router.get("/system-status",requireAuthUser, hrAgentController.systemStatus);

/**
 * @route POST /hr-agents/debug-memo/:agentId
 * @desc Debug and fix HCS-11 memo for given agent
 * @access Private
 */
router.post("/debug-memo/:agentId",requireAuthUser, hrAgentController.debugAndFixMemo);

/**
 * @route GET /hr-agents/hcs11-profile/:agentId
 * @desc Retrieves HCS-11 profile of agent via Standards SDK
 * @access Private
 */
router.get("/hcs11-profile/:agentId",requireAuthUser, hrAgentController.getAgentHCS11Profile);

/**
 * @route POST /hr-agents/refresh-profiles/:agentId?
 * @desc Refreshes agent profiles from Hedera (one or all)
 * @access Private
 */
router.post("/refresh-profiles/:agentId?",requireAuthUser, hrAgentController.refreshAgentProfiles);

module.exports = router;