/**
 * Routes for Subscription Management
 * 
 * This API manages subscriptions created from payments.
 * Subscriptions track plan usage, duration, and status.
 */

const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscription.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");

// ========== PUBLIC ROUTES ==========

router.get(
  "/combined",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getCombinedActiveDetails
);

/**
 * GET /subscriptions
 * Get all subscriptions for a company (including expired/cancelled)
 * Auth: Required
 */
router.get(
  "/",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getCompanySubscriptions
);

// ========== MANAGEMENT ROUTES (Auth Required) ==========

/**
 * POST /subscriptions/:subscriptionId/cancel
 * Cancel a subscription
 * Auth: Required (company admin or super admin)
 * 
 * Body:
 * {
 *   "reason": "Optional cancellation reason"
 * }
 */
router.post(
  "/:subscriptionId/cancel",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.cancelSubscription
);

/**
 * POST /subscriptions/:subscriptionId/enable-auto-renew
 * Re-enable auto-renewal on a subscription
 * Auth: Required
 */
router.post(
  "/:subscriptionId/enable-auto-renew",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.enableAutoRenew
);

/**
 * POST /subscriptions/:subscriptionId/extend
 * Extend subscription end date
 * Auth: Required
 * 
 * Body:
 * {
 *   "additionalDays": 30  // Default: 30
 * }
 */
router.post(
  "/:subscriptionId/extend",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.extendSubscription
);

/**
 * POST /subscriptions/:subscriptionId/renew
 * Renew subscription (create a new one from same plan)
 * Auth: Required
 */
router.post(
  "/:subscriptionId/renew",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.renewSubscription
);

/**
 * POST /subscriptions/:subscriptionId/increment-usage
 * Increment usage counter
 * Auth: Required (internal or admin)
 * 
 * Body:
 * {
 *   "usageType": "postsUsed" | "monthlyInterviewsUsed",
 *   "amount": 1  // Default: 1
 * }
 */
router.post(
  "/:subscriptionId/increment-usage",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.incrementUsage
);

/**
 * POST /subscriptions/:subscriptionId/reset-monthly-interview
 * Reset monthly interview counter if needed
 * Auth: Required
 */
router.post(
  "/:subscriptionId/reset-monthly-interview",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.resetMonthlyInterview
);

module.exports = router;
