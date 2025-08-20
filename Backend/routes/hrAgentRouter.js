const express = require("express");
const router = express.Router();
const hrAgentController = require("../controllers/hrAgentController");

// Import middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Apply authentication middleware and logging
router.use(requireAuthUser, authLogMiddleware("HRAgent"));

/**
 * @route POST /hr-agents/initialize
 * @desc Initialize HR Validation Agents (Creates all 6 HR validation agents with Hedera wallets - one-time operation)
 * @access Private (Admin only)
 */
router.post("/initialize", hrAgentController.initializeAgents);

/**
 * @route POST /hr-agents
 * @desc Create a new HR agent
 * @access Private (Admin only)
 */
router.post("/", hrAgentController.createAgent);

/**
 * @route GET /hr-agents/all
 * @desc Get all HR agents
 * @access Private
 */
router.get("/all", hrAgentController.getAllAgents);

/**
 * @route GET /hr-agents/avatar/:avatarName
 * @desc Get agent by avatar name
 * @access Private
 */
router.get("/avatar/:avatarName", hrAgentController.getAgentByAvatar);

/**
 * @route GET /hr-agents/role/:role
 * @desc Get agents by role
 * @access Private
 */
router.get("/role/:role", hrAgentController.getAgentsByRole);

/**
 * @route POST /hr-agents/send-validation-message
 * @desc Send validation message from Sinda to Coordinator with LangChain TogetherAI Agent
 * @access Private
 */
router.post("/send-validation-message", hrAgentController.sendValidationMessage);

/**
 * @route POST /hr-agents/submit-evaluation-message
 * @desc Create automated conversation between two agents using LangChain TogetherAI Agent
 * @desc Agent A says "candidate is good", Agent B responds "ah ok what's his score?" - happens automatically once
 * @access Private
 */
router.post("/submit-evaluation-message", hrAgentController.submitEvaluationMessage);

/**
 * @route GET /hr-agents/diagnose/:coordinatorId
 * @desc Diagnose coordinator issues and check proof of reception status
 * @access Private
 */
router.get("/diagnose/:coordinatorId", hrAgentController.diagnoseCoordinator);

/**
 * @route POST /hr-agents/fix-proof-of-reception
 * @desc Manually send proof of reception for a coordinator
 * @access Private
 */
router.post("/fix-proof-of-reception", hrAgentController.fixProofOfReception);

/**
 * @route POST /hr-agents/fix-memo/:agentId
 * @desc Fix HCS-11 memo for agent to resolve profile validation issues
 * @access Private
 */
router.post("/fix-memo/:agentId", hrAgentController.fixAgentMemo);

/**
 * @route GET /hr-agents/check-all
 * @desc Check all agents for configuration issues and provide recommendations
 * @access Private
 */
router.get("/check-all", hrAgentController.checkAllAgents);

/**
 * @route GET /hr-agents/profile/:agentId
 * @desc Get agent HCS-11 profile details and communication topics
 * @access Private
 */
router.get("/profile/:agentId", hrAgentController.getAgentProfile);

/**
 * @route POST /hr-agents/validate-hcs11/:agentId
 * @desc Validate agent HCS-11 profile compliance
 * @access Private
 */
router.post("/validate-hcs11/:agentId", hrAgentController.validateAgentHCS11);

/**
 * @route PUT /hr-agents/update-profile/:agentId
 * @desc Update agent HCS-11 profile with new information
 * @access Private
 */
router.put("/update-profile/:agentId", hrAgentController.updateAgentProfile);

/**
 * @route GET /hr-agents/verify-memo/:accountId
 * @desc Verify HCS-11 memo on Hedera account
 * @access Private
 */
router.get("/verify-memo/:accountId", hrAgentController.verifyAccountMemo);

/**
 * @route POST /hr-agents/update-all-memos
 * @desc Bulk update HCS-11 memos for all active agents
 * @access Private
 */
router.post("/update-all-memos", hrAgentController.updateAllAgentMemos);

/**
 * @route GET /hr-agents/test-langchain
 * @desc Test LangChain TogetherAI Agent functionality
 * @access Private
 */
router.get("/test-langchain", hrAgentController.testLangChainAgent);

/**
 * @route GET /hr-agents/test-memo/:agentId
 * @desc Test memo creation for specific agent
 * @access Private
 */
router.get("/test-memo/:agentId", hrAgentController.testMemoCreation);

/**
 * @route GET /hr-agents/system-status
 * @desc Get comprehensive system status and migration info
 * @access Private
 */
router.get("/system-status", hrAgentController.systemStatus);

/**
 * @route POST /hr-agents/debug-memo/:agentId
 * @desc Debug and fix HCS-11 memo for specific agent
 * @access Private
 */
router.post("/debug-memo/:agentId", hrAgentController.debugAndFixMemo);

/**
 * @route GET /hr-agents/hcs11-profile/:agentId
 * @desc Retrieve HCS-11 profile for agent using standards SDK
 * @access Private
 */
router.get("/hcs11-profile/:agentId", hrAgentController.getAgentHCS11Profile);

/**
 * @route POST /hr-agents/refresh-profiles/:agentId?
 * @desc Refresh agent profiles from Hedera network (specific agent if agentId provided, all agents if not)
 * @access Private
 */
router.post("/refresh-profiles/:agentId?", hrAgentController.refreshAgentProfiles);

module.exports = router;