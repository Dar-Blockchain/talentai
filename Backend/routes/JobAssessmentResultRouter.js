const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/JobAssessmentResultController");

const { requireAuthUser } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(requireAuthUser);

router.get("/company", assessmentController.getJobAssessmentsByCompany);

module.exports = router;
