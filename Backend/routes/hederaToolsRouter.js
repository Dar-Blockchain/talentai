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

module.exports = router;