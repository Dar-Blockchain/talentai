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

// Plans Management Routes (Public Read, Auth Required for Write)

// POST /planLimits - Create a new plan (Admin only)
router.post("/", requireAuthUser, planLimitsController.createPlan);

// GET /planLimits - Get all plans (Public)
router.get("/", planLimitsController.getAllPlans);

// GET /planLimits/:id - Get plan by ID (Public)
router.get("/:id", planLimitsController.getPlanById);

// PUT /planLimits/:id - Update plan by ID (Admin only)
router.put("/:id", requireAuthUser, planLimitsController.updatePlan);

// DELETE /planLimits/:id - Delete plan by ID (Admin only)
router.delete("/:id", requireAuthUser, planLimitsController.deletePlan);

// Company Plan Assignment and Usage Routes

// POST /planLimits/assign/:companyProfileId/:planId - Assign plan to company
router.post(
  "/assign/:companyProfileId/:planId",
  requireAuthUser,
  planLimitsController.assignPlanToCompany
);

// GET /planLimits/usage/:companyProfileId - Get company plan usage
router.get(
  "/usage/:companyProfileId",
  requireAuthUser,
  planLimitsController.getCompanyPlanUsage
);

// PUT /planLimits/usage/:companyProfileId - Update company usage
router.put(
  "/usage/:companyProfileId",
  requireAuthUser,
  planLimitsController.updateCompanyUsage
);

// PUT /planLimits/increment/:companyProfileId/:counterType - Increment usage counter
router.put(
  "/increment/:companyProfileId/:counterType",
  requireAuthUser,
  planLimitsController.incrementUsageCounter
);

// PUT /planLimits/reset-monthly/:companyProfileId - Reset monthly counter
router.put(
  "/reset-monthly/:companyProfileId",
  requireAuthUser,
  planLimitsController.resetMonthlyInterviewCounterIfNeeded
);

module.exports = router;
