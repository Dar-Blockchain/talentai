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

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     tags: [Payments]
 *     summary: Verify and update payment status after Stripe checkout
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [sessionId]
 *             properties:
 *               sessionId: { type: string }
 *     responses:
 *       200:
 *         description: Payment status verified and updated
 */
router.post("/verify", paymentController.verifyPaymentStatus);

/**
 * @openapi
 * /payments/user/history:
 *   get:
 *     tags: [Payments]
 *     summary: Get current user's payment history
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get(
  "/user/history",
  requireAuth,
  authLogMiddleware("payments"),
  paymentController.getUserPaymentHistory
);

module.exports = router;
