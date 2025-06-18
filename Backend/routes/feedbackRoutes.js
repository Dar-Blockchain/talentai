const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware d'authentification (optionnel)
const {requireAuthUser} = require('../middleware/authMiddleware');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

router.post('/addFeedback', authLogMiddleware('Feedback'), feedbackController.create);
router.get('/getAllFeedback',authLogMiddleware('Feedback'), feedbackController.getAllFeedback);

module.exports = router;
