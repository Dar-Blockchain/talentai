/**
 * Routes pour la gestion des limites de plan
 *
 * Each plan management endpoint (POST, PUT, DELETE) requires authentication.
 * Les endpoints de consultation (GET) sont publics.
 */
const express = require("express");
const router = express.Router();
const planLimitsController = require("../controllers/planLimits.controller");
const { requireAuth } = require("../middleware/security/auth.middleware");
const authLogMiddleware = require("../middleware/security/request-log.middleware.js");
const { controledAcces } = require('../middleware/authorize.middleware.js');

/**
 * @openapi
 * /plan-limits:
 *   post:
 *     tags: [Plan Limits]
 *     summary: Create a new plan (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               maxPosts: { type: integer }
 *               maxMonthlyInterviews: { type: integer }
 *               price: { type: number }
 *     responses:
 *       201:
 *         description: Plan created
 *   get:
 *     tags: [Plan Limits]
 *     summary: Get all plans (public)
 *     security: []
 *     responses:
 *       200:
 *         description: List of plans
 */
router.post("/", requireAuth, authLogMiddleware("planLimits"),planLimitsController.createPlan);
router.get("/", planLimitsController.getAllPlans);

/**
 * @openapi
 * /plan-limits/{id}:
 *   get:
 *     tags: [Plan Limits]
 *     summary: Get a plan by ID (public)
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Plan details
 *       404:
 *         description: Not found
 */
router.get("/:id", planLimitsController.getPlanById);

router.use(requireAuth,authLogMiddleware("planLimits"),controledAcces('Admin'));

/**
 * @openapi
 * /plan-limits:
 *   put:
 *     tags: [Plan Limits]
 *     summary: Update a plan by name (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *               maxPosts: { type: integer }
 *               maxMonthlyInterviews: { type: integer }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Plan updated
 */
router.put("/",  planLimitsController.updatePlan);

module.exports = router;
