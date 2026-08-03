const express = require("express");
const router = express.Router();
const planLimitsController = require("./plan-limits.controller");

router.get("/", planLimitsController.getAllPlans);
router.get("/:id", planLimitsController.getPlanById);

module.exports = router;
