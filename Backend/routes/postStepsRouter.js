const express = require('express');
const router = express.Router();
const postStepsController = require('../controllers/postStepsController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes publiques (si nécessaire)
// router.get('/public', postStepsController.getAllPostSteps);

// Routes protégées par authentification
router.use(authMiddleware);

// CRUD de base
router.post('/', postStepsController.createPostStep);
router.get('/', postStepsController.getAllPostSteps);
router.get('/:id', postStepsController.getPostStepById);
router.put('/:id', postStepsController.updatePostStep);
router.delete('/:id', postStepsController.deletePostStep);

// Routes spécialisées
router.get('/post/:postId', postStepsController.getPostStepsByPostId);
router.get('/type/:type', postStepsController.getPostStepsByType);
router.get('/parent/:parentStep', postStepsController.getPostStepsByParent);

module.exports = router; 