const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware d'authentification (optionnel)
const {requireAuthUser} = require('../middleware/authMiddleware');

router.post('/addFeedback', requireAuthUser, feedbackController.create);
router.get('/getAllFeedback', feedbackController.getAllFeedback);

module.exports = router;
