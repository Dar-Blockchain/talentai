const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");

// Importez les middlewares
const { requireAuthUser } = require("../middleware/authMiddleware");
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware


router.use(requireAuthUser,controledAcces('Admin'), authLogMiddleware("Dashboard"));


router.get("/getAllUsers", dashboardController.getAllUsers);

router.get("/getCounts", dashboardController.getCounts);

router.get("/getUserCountsByDay", dashboardController.getCountsByDay);

router.get("/getUserCountsByLocation", dashboardController.getUserCountsByLocation);

router.get("/job-assessment-results-grouped", dashboardController.getJobAssessmentResultsGroupedByJobId);

router.post("/getJobAssessmentsBySkill", dashboardController.getJobAssessmentsBySkill);

router.get("/downloadUserExcel", dashboardController.downloadUserExcel);

router.get("/download-users-with-assessment-zero", dashboardController.downloadUserExcelWithAssessmentZero);

router.get("/download-users-with-assessment-Above50", dashboardController.downloadUserExcelWithAssessmentAbove50);

module.exports = router;