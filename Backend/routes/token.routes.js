/**
 * Token management routes
 * Handles token balance, purchases, and transactions
 */
const express = require("express");
const router = express.Router();
const tokenController = require("../controllers/tokenController");
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

// Apply logging middleware to all token routes
// All token routes require authentication
router.use(requireAuthUser,authLogMiddleware("Token"));

// GET /tokens/balance
// Get user's current token balance
router.get("/balance", tokenController.getBalance);

// POST /tokens/purchase
// Initiate token purchase
router.post("/purchase", tokenController.purchaseTokens);

// POST /tokens/verify-payment
// Verify payment and update balance
router.post("/verify-payment", tokenController.verifyPayment);

// GET /tokens/transactions
// Get user's token transaction history
router.get("/transactions", tokenController.getTransactions);

// POST /tokens/spend
// Spend tokens for services (job posting, etc.)
router.post("/spend", tokenController.spendTokens);

// GET /tokens/packages
// Get available token packages
router.get("/packages", tokenController.getTokenPackages);

module.exports = router;