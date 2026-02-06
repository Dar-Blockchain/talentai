/**
 * Routes pour la gestion des limites de plan
 *
 * Chaque endpoint de gestion des plans (POST, PUT, DELETE) nécessite une authentification.
 * Les endpoints de consultation (GET) sont publics.
 */
const express = require("express");
const router = express.Router();
const planLimitsController = require("../controllers/planLimits.controller");
const { requireAuthUser } = require("../middleware/auth.middleware");
const { controledAcces } = require('../middleware/authorize.middleware.js');

// Plans Management Routes (Public Read, Auth Required for Write)

// POST /planLimits - Create a new plan (Admin only)
router.post("/", requireAuthUser, authLogMiddleware("planLimits"),planLimitsController.createPlan);

// GET /planLimits - Get all plans (Public)
router.get("/", planLimitsController.getAllPlans);

// GET /planLimits/:id - Get plan by ID (Public)
router.get("/:id", planLimitsController.getPlanById);

router.use(requireAuthUser,authLogMiddleware("planLimits"));

// PUT /planLimits/:id - Update plan by ID (Admin only)
router.put("/:id",controledAcces('Admin'),  planLimitsController.updatePlan);

// DELETE /planLimits/:id - Delete plan by ID (Admin only)
router.delete("/:id", controledAcces('Admin'), planLimitsController.deletePlan);



module.exports = router;
