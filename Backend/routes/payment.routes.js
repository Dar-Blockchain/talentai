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

// ========== ADMIN ROUTES ==========

// GET /payments - Get all payments (Admin only)
router.get(
  "/",
  requireAuth,
  authLogMiddleware("payments"),
  controledAcces("Admin"),
  paymentController.getAllPayments
);

// GET /payments/:paymentId - Get payment by ID (Admin only)
router.get(
  "/:paymentId",
  requireAuth,
  authLogMiddleware("payments"),
  controledAcces("Admin"),
  paymentController.getPaymentById
);

// GET /payments/company/:companyProfileId - Get company payment history (Admin only)
router.get(
  "/company/:companyProfileId",
  requireAuth,
  authLogMiddleware("payments"),
  paymentController.getCompanyPaymentHistory
);

// GET /payments/stats/dashboard - Get payment statistics (Admin only)
router.get(
  "/stats/dashboard",
  requireAuth,
  authLogMiddleware("payments"),
  controledAcces("Admin"),
  paymentController.getPaymentStats
);

// DELETE /payments/:paymentId - Delete payment (Admin only, only pending payments)
router.delete(
  "/:paymentId",
  requireAuth,
  authLogMiddleware("payments"),
  controledAcces("Admin"),
  paymentController.deletePayment
);

// PUT /payments/:paymentId/status - Update payment status with automatic profile linking (Admin only)
router.put(
  "/:paymentId/status",
  requireAuth,
  authLogMiddleware("payments"),
  paymentController.updatePaymentStatusWithProfileLink
);

module.exports = router;
