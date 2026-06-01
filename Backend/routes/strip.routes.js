const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const { requireAuth } = require('../middleware/security/auth.middleware');

const stripeController = require("../controllers/stripe.controller");

/**
 * @openapi
 * /stripe/create-checkout-session:
 *   post:
 *     tags: [Stripe]
 *     summary: Create a Stripe checkout session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [planId]
 *             properties:
 *               planId: { type: string }
 *               successUrl: { type: string, format: uri }
 *               cancelUrl: { type: string, format: uri }
 *     responses:
 *       200:
 *         description: Checkout session created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url: { type: string, format: uri }
 */
router.post("/create-checkout-session", requireAuth, stripeController.createCheckoutSession);

module.exports = router;
