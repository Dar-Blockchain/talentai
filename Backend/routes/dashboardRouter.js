const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { requireAuthUser } = require("../middleware/authMiddleware");

router.get("/getAllUsers", dashboardController.getAllUsers);

router.get("/getCounts", dashboardController.getCounts);

router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId);

module.exports = router;