const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller");
const { requireAuthUser } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware")

// All payment routes require authentication
router.use(requireAuthUser, authLogMiddleware("Payment"));

router.get("/plans", paymentController.getPricingPlans);

router.post("/initiate-tai-purchase", paymentController.initiateTaiPurchase);

router.post("/verify-hbar-payment", paymentController.verifyHbarPayment);

router.post("/distribute-tokens", paymentController.distributeTokens);

router.get("/hbar-price", paymentController.getHbarPrice);

router.post("/refresh-hbar-price", paymentController.refreshHbarPrice);

router.get("/history", paymentController.getPaymentHistory);

router.get("/stats", paymentController.getPaymentStats);

router.post("/complete", paymentController.completePayment);

router.post('/complete-stripe', paymentController.processStripeSession);

module.exports = router;