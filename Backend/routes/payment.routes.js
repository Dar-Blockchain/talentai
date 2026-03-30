const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware")

// All payment routes require authentication
router.use(requireAuthUser, authLogMiddleware("Payment"));

/**
 * @swagger
 * components:
 *   schemas:
 *     PricingPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique plan identifier
 *         name:
 *           type: string
 *           description: Plan name
 *         priceUsd:
 *           type: number
 *           description: Price in USD
 *         hbarPrice:
 *           type: number
 *           description: Price in HBAR
 *         gasFeeHbar:
 *           type: number
 *           description: Gas fee in HBAR
 *         totalHbar:
 *           type: number
 *           description: Total HBAR amount (price + gas fee)
 *         popular:
 *           type: boolean
 *           description: Whether this plan is marked as popular
 */

/**
 * @swagger
 * /payment/plans:
 *   get:
 *     summary: Get current pricing plans with real-time HBAR conversion
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pricing plans retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     plans:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PricingPlan'
 *                     taiToken:
 *                       type: object
 *                       description: TAI token configuration
 *                     hbarPrice:
 *                       type: number
 *                       description: Current HBAR price in USD
 *       500:
 *         description: Failed to get pricing plans
 */
router.get("/plans", paymentController.getPricingPlans);

/**
 * @swagger
 * /payment/initiate-tai-purchase:
 *   post:
 *     summary: Initiate TAI token purchase
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - paymentMethod
 *             properties:
 *               planId:
 *                 type: string
 *                 description: Selected pricing plan ID
 *               paymentMethod:
 *                 type: string
 *                 enum: [hedera, hashpack]
 *                 description: Payment method
 *               walletAddress:
 *                 type: string
 *                 description: User's wallet address (optional)
 *     responses:
 *       200:
 *         description: TAI token purchase initiated successfully
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Failed to initiate purchase
 */
router.post("/initiate-tai-purchase", paymentController.initiateTaiPurchase);

/**
 * @swagger
 * /payment/verify-hbar-payment:
 *   post:
 *     summary: Verify HBAR payment on Hedera network
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *               - hederaTransactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: Internal transaction ID
 *               hederaTransactionId:
 *                 type: string
 *                 description: Hedera network transaction ID
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Payment verification failed
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Failed to verify payment
 */
router.post("/verify-hbar-payment", paymentController.verifyHbarPayment);

/**
 * @swagger
 * /payment/distribute-tokens:
 *   post:
 *     summary: Distribute TAI tokens and gas fees after payment verification
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - transactionId
 *             properties:
 *               transactionId:
 *                 type: string
 *                 description: Transaction ID for distribution
 *     responses:
 *       200:
 *         description: Tokens distributed successfully
 *       207:
 *         description: Token distribution partially completed
 *       400:
 *         description: Invalid request or user account
 *       404:
 *         description: Verified transaction not found
 *       500:
 *         description: Token distribution failed
 */
router.post("/distribute-tokens", paymentController.distributeTokens);

/**
 * @swagger
 * /payment/hbar-price:
 *   get:
 *     summary: Get current HBAR price
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HBAR price retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     price:
 *                       type: number
 *                       description: Current HBAR price in USD
 *                     hasPrice:
 *                       type: boolean
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *                     cacheValid:
 *                       type: boolean
 *       500:
 *         description: Failed to get HBAR price
 */
router.get("/hbar-price", paymentController.getHbarPrice);

/**
 * @swagger
 * /payment/refresh-hbar-price:
 *   post:
 *     summary: Refresh HBAR price cache
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HBAR price refreshed successfully
 *       500:
 *         description: Failed to refresh HBAR price
 */
router.post("/refresh-hbar-price", paymentController.refreshHbarPrice);

/**
 * @swagger
 * /payment/history:
 *   get:
 *     summary: Get user's payment history
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           default: purchase
 *         description: Transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Transaction status filter
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       500:
 *         description: Failed to get payment history
 */
router.get("/history", paymentController.getPaymentHistory);

/**
 * @swagger
 * /payment/stats:
 *   get:
 *     summary: Get payment statistics for user
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     tokenBalance:
 *                       type: number
 *                       description: Current token balance
 *                     gasFeeBalance:
 *                       type: number
 *                       description: Current gas fee balance in HBAR
 *                     hederaAccount:
 *                       type: string
 *                       description: User's Hedera account ID
 *                     totalPurchases:
 *                       type: number
 *                       description: Total number of completed purchases
 *                     totalSpentUsd:
 *                       type: number
 *                       description: Total amount spent in USD
 *       500:
 *         description: Failed to get payment statistics
 */
router.get("/stats", paymentController.getPaymentStats);

/**
 * @swagger
 * /payment/complete:
 *   post:
 *     summary: Complete payment and distribute tokens (simplified endpoint)
 *     description: Combines payment verification and token distribution in one call for frontend simplicity
 *     tags: [Payment]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - hederaTransactionId
 *             properties:
 *               planId:
 *                 type: string
 *                 description: Selected pricing plan ID
 *               hederaTransactionId:
 *                 type: string
 *                 description: Hedera network transaction ID from HashPack payment
 *     responses:
 *       200:
 *         description: Payment completed and tokens distributed successfully
 *       207:
 *         description: Payment partially completed (some steps failed)
 *       400:
 *         description: Invalid request or missing Hedera account
 *       404:
 *         description: Pricing plan not found
 *       500:
 *         description: Failed to complete payment
 */
router.post("/complete", paymentController.completePayment);

router.post('/complete-stripe', paymentController.processStripeSession);

module.exports = router;