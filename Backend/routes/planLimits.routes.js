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

// GET /planLimits - Get all plans (Public)
router.get("/", planLimitsController.getAllPlans);

router.use(requireAuth,authLogMiddleware("planLimits"),controledAcces('Admin'));

// PUT /planLimits - Update plan by name (passed in body)
router.put("/",  planLimitsController.updatePlan);

module.exports = router;
