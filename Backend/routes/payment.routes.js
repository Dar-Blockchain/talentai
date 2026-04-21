/**
 * Routes pour la gestion des paiements
 *
 * GET endpoints are public for verification
 * Admin routes require Admin authorization
 */
const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require("../middleware/authorize.middleware.js");

// ========== PUBLIC ROUTES ==========

// GET /payments/verify - Verify and update payment status after successful checkout
router.post("/verify", paymentController.verifyPaymentStatus);

// ========== AUTHENTICATED USER ROUTES ==========

// GET /payments/user/history - Get current user's payment history
router.get(
  "/user/history",
  requireAuth,
  authLogMiddleware("payments"),
  paymentController.getUserPaymentHistory
);

module.exports = router;
