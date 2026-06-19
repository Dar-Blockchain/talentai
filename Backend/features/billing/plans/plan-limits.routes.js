const express = require("express");
const router = express.Router();
const planLimitsController = require("./plan-limits.controller");
const { requireAuth } = require("../../../middleware/security/auth.middleware");
const authLogMiddleware = require("../../../middleware/security/request-log.middleware");
const { controledAcces } = require("../../../middleware/authorize.middleware");

router.post("/", requireAuth, authLogMiddleware("planLimits"), planLimitsController.createPlan);
router.get("/", planLimitsController.getAllPlans);
router.get("/:id", planLimitsController.getPlanById);

router.use(requireAuth, authLogMiddleware("planLimits"), controledAcces("Admin"));
router.put("/", planLimitsController.updatePlan);

module.exports = router;
