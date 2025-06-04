const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware d'authentification (optionnel)



router.post('/', feedbackController.create);
router.get('/', feedbackController.getAll);
router.get('/:id', feedbackController.getOne);
router.put('/:id', feedbackController.update);
router.delete('/:id', feedbackController.remove);

module.exports = router;
