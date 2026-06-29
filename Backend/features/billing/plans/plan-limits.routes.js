const express = require("express");
const router = express.Router();
const planLimitsController = require("./plan-limits.controller");
const { requireAuth } = require("../../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../../middleware/security/request-log.middleware");
const { controledAcces } = require("../../../middleware/authorize.middleware");

router.get("/", planLimitsController.getAllPlans);
router.get("/:id", planLimitsController.getPlanById);

router.post("/", requireAuth, authLogMiddleware("planLimits"), controledAcces("Admin"), planLimitsController.createPlan);
router.put("/", requireAuth, authLogMiddleware("planLimits"), controledAcces("Admin"), planLimitsController.updatePlan);

module.exports = router;
