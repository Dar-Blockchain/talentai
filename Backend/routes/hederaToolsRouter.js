const express = require("express");
const router = express.Router();
const hederaToolsController = require("../controllers/hederaToolsController");

// Importez les middlewares
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Apply authentication middleware and logging
router.use(requireAuthUser, authLogMiddleware("HederaTools"));

// Hedera Tools Routes - Direct tool calls without LLM

/**
 * @route POST /hedera-tools/create-token
 * @desc Create a fungible token using Hedera Agent Kit tools directly
 * @access Private
 */
router.post("/create-token", hederaToolsController.createFungibleToken);

/**
 * @route POST /hedera-tools/create-topic
 * @desc Create a consensus topic using Hedera Agent Kit tools directly
 * @access Private
 */
router.post("/create-topic", hederaToolsController.createTopic);

/**
 * @route POST /hedera-tools/submit-message
 * @desc Submit a message to a consensus topic using Hedera Agent Kit tools directly
 * @access Private
 */
router.post("/submit-message", hederaToolsController.submitTopicMessage);

/**
 * @route GET /hedera-tools/balance
 * @desc Get HBAR balance for a specific account using Hedera Agent Kit tools directly
 * @access Private
 */
router.get("/balance", hederaToolsController.getHbarBalance);

/**
 * @route GET /hedera-tools/my-balance
 * @desc Get HBAR balance for the current configured account
 * @access Private
 */
router.get("/my-balance", hederaToolsController.getMyBalance);

/**
 * @route GET /hedera-tools/tools
 * @desc Get information about available Hedera Agent Kit tools
 * @access Private
 */
router.get("/tools", hederaToolsController.getAvailableTools);

/**
 * @route POST /hedera-tools/create-evaluation-topic
 * @desc Create a new evaluation topic for candidate pipeline using agent credentials
 * @access Private
 */
router.post("/create-evaluation-topic", hederaToolsController.createEvaluationTopic);

/**
 * @route POST /hedera-tools/submit-evaluation-message
 * @desc Submit HCS-11 evaluation message to existing topic using topic ID
 * @access Private
 */
router.post("/submit-evaluation-message", hederaToolsController.submitEvaluationMessage);

/**
 * @route POST /hedera-tools/send-validation-message
 * @desc Send agent validation message to evaluation topic using HCS-11 standard
 * @access Private
 */
router.post("/send-validation-message", hederaToolsController.sendValidationMessage);

/**
 * @route GET /hedera-tools/evaluation-topic/:topicId
 * @desc Get evaluation topic details and messages
 * @access Private
 */
router.get("/evaluation-topic/:topicId", hederaToolsController.getEvaluationTopic);

/**
 * @route GET /hedera-tools/evaluation-topics
 * @desc Get all evaluation topics with optional filters (company, postId, status)
 * @access Private
 */
router.get("/evaluation-topics", hederaToolsController.getEvaluationTopics);

module.exports = router;