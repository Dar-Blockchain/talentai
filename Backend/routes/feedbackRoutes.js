const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware d'authentification (optionnel)
const {requireAuthUser} = require('../middleware/authMiddleware');
const { controledAcces } = require('../middleware/controledAcces'); // Importez le middleware
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")


router.use(requireAuthUser, authLogMiddleware("Feedback"));


router.post('/addFeedback', controledAcces('Candidat'), feedbackController.create);
router.get('/getAllFeedback', controledAcces('Admin'), feedbackController.getAllFeedback);

module.exports = router;
