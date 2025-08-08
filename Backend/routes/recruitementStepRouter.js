const express = require('express');
const router = express.Router();
const recruitementStepController = require('../controllers/recruitementStepController');
const { requireAuthUser } = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware");

router.use(requireAuthUser);

router.get('/generate-questions/:postStepId', recruitementStepController.generateQuestions);

module.exports = router;
