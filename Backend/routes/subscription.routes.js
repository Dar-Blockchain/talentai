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

/**
 * @openapi
 * /subscriptions/active:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get the active subscription for the authenticated company
 *     responses:
 *       200:
 *         description: Active subscription
 */
router.get(
  "/active",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getActiveSubscription
);

/**
 * @openapi
 * /subscriptions/combined:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get combined active subscription details (plan + usage)
 *     responses:
 *       200:
 *         description: Combined details
 */
router.get(
  "/combined",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getCombinedActiveDetails
);

/**
 * @openapi
 * /subscriptions:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get all subscriptions for the authenticated company (including expired/cancelled)
 *     responses:
 *       200:
 *         description: List of subscriptions
 */
router.get(
  "/",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getCompanySubscriptions
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/details:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Get detailed subscription info with usage stats
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subscription details with usage
 */
router.get(
  "/:subscriptionId/details",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.getSubscriptionDetails
);

/**
 * @openapi
 * /subscriptions/{companyProfileId}/check-limit/{limitType}:
 *   get:
 *     tags: [Subscriptions]
 *     summary: Check if company can perform an action within plan limits
 *     parameters:
 *       - in: path
 *         name: companyProfileId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: limitType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [posts, monthlyInterviews]
 *     responses:
 *       200:
 *         description: Limit check result
 */
router.get(
  "/:companyProfileId/check-limit/:limitType",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.checkLimit
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/cancel:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Cancel a subscription
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string }
 *     responses:
 *       200:
 *         description: Subscription cancelled
 */
router.post(
  "/:subscriptionId/cancel",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.cancelSubscription
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/enable-auto-renew:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Re-enable auto-renewal on a subscription
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Auto-renewal enabled
 */
router.post(
  "/:subscriptionId/enable-auto-renew",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.enableAutoRenew
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/extend:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Extend subscription end date
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               additionalDays: { type: integer, default: 30 }
 *     responses:
 *       200:
 *         description: Subscription extended
 */
router.post(
  "/:subscriptionId/extend",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.extendSubscription
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/renew:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Renew subscription (creates a new one from the same plan)
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Subscription renewed
 */
router.post(
  "/:subscriptionId/renew",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.renewSubscription
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/increment-usage:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Increment a usage counter
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [usageType]
 *             properties:
 *               usageType:
 *                 type: string
 *                 enum: [postsUsed, monthlyInterviewsUsed]
 *               amount: { type: integer, default: 1 }
 *     responses:
 *       200:
 *         description: Usage incremented
 */
router.post(
  "/:subscriptionId/increment-usage",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.incrementUsage
);

/**
 * @openapi
 * /subscriptions/{subscriptionId}/reset-monthly-interview:
 *   post:
 *     tags: [Subscriptions]
 *     summary: Reset the monthly interview counter
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Counter reset
 */
router.post(
  "/:subscriptionId/reset-monthly-interview",
  requireAuth,
  authLogMiddleware("subscription"),
  subscriptionController.resetMonthlyInterview
);

module.exports = router;
