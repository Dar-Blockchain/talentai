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

// Plans Management Routes (Public Read, Auth Required for Write)

// POST /planLimits - Create a new plan (Admin only)
router.post("/", requireAuth, authLogMiddleware("planLimits"),planLimitsController.createPlan);

// GET /planLimits - Get all plans (Public)
router.get("/", planLimitsController.getAllPlans);

// GET /planLimits/:id - Get plan by ID (Public)
router.get("/:id", planLimitsController.getPlanById);

router.use(requireAuth,authLogMiddleware("planLimits"),controledAcces('Admin'));

// PUT /planLimits - Update plan by name (passed in body)
router.put("/",  planLimitsController.updatePlan);

module.exports = router;
