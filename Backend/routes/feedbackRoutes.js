const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Middleware d'authentification (optionnel)
const {requireAuthUser} = require('../middleware/authMiddleware');

router.use(requireAuthUser);


router.post('/', feedbackController.create);
router.get('/', feedbackController.getAll);
router.get('/:id', feedbackController.getOne);
router.put('/:id', feedbackController.update);
router.delete('/:id', feedbackController.remove);

module.exports = router;
