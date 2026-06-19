const router = require("./plan-limits.routes");
const planLimitsService = require("./plan-limits.service");
const PlanLimits = require("./plan-limits.model");

module.exports = { router, planLimitsService, PlanLimits };
