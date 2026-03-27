/**
 * Hedera tools routes (token creation, topics, messages, balances, etc.)
 *
 * Global middlewares applied:
 * - requireAuthUser: requires an authenticated user
 * - LogMiddleware("HederaTools"): journalise l'utilisation des outils
 */
const express = require("express");
const router = express.Router();
const hederaToolsController = require("../controllers/hederaTools.controller");

// Import des middlewares
const { requireAuthUser } = require('../middleware/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware");

// Auth requis + journalisation
router.use(requireAuthUser, authLogMiddleware("HederaTools"));
//router.use(requireAuthUser, authLogMiddleware("HederaTools"));

// Hedera Tools Routes - Direct calls without LLM

/**
 * @route POST /hedera-tools/create-token
 * @desc Creates a fungible token via Hedera Agent Kit
 * @access Private
 */
router.post("/create-token", hederaToolsController.createFungibleToken);

/**
 * @route POST /hedera-tools/create-topic
 * @desc Creates a consensus topic via Hedera Agent Kit
 * @access Private
 */
router.post("/create-topic", hederaToolsController.createTopic);

/**
 * @route POST /hedera-tools/submit-message
 * @desc Sends a message to a consensus topic
 * @access Private
 */
router.post("/submit-message", hederaToolsController.submitTopicMessage);

/**
 * @route GET /hedera-tools/balance
 * @desc Retrieves HBAR balance for a given account
 * @access Private
 */
router.get("/balance", hederaToolsController.getHbarBalance);

/**
 * @route GET /hedera-tools/my-balance
 * @desc Retrieves HBAR balance of current configured account
 * @access Private
 */
router.get("/my-balance", hederaToolsController.getMyBalance);

/**
 * @route GET /hedera-tools/tools
 * @desc Information about available Hedera Agent Kit tools
 * @access Private
 */
router.get("/tools", hederaToolsController.getAvailableTools);

/**
 * @route POST /hedera-tools/create-evaluation-topic
 * @desc Creates an evaluation topic for candidate pipeline (via agent credentials)
 * @access Private
 */
router.post("/create-evaluation-topic", hederaToolsController.createEvaluationTopic);

/**
 * @route POST /hedera-tools/submit-evaluation-message
 * @desc Submits an HCS-11 evaluation message to an existing topic
 * @access Private
 */
router.post("/submit-evaluation-message", hederaToolsController.submitEvaluationMessage);

/**
 * @route POST /hedera-tools/send-validation-message
 * @desc Sends HCS-11 validation message to an evaluation topic
 * @access Private
 */
router.post("/send-validation-message", hederaToolsController.sendValidationMessage);

/**
 * @route GET /hedera-tools/evaluation-topic/:topicId
 * @desc Details and messages of an evaluation topic
 * @access Private
 */
router.get("/evaluation-topic/:topicId", hederaToolsController.getEvaluationTopic);

/**
 * @route GET /hedera-tools/evaluation-topics
 * @desc Lists all evaluation topics (filters: company, postId, status)
 * @access Private
 */
router.get("/evaluation-topics", hederaToolsController.getEvaluationTopics);

module.exports = router;