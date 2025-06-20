const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { requireAuthUser } = require("../middleware/authMiddleware");

router.get("/getAllUsers", dashboardController.getAllUsers);

router.get("/getAllJobAssessments", dashboardController.getAllJobAssessments);

router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId2);

module.exports = router;