const express = require('express');
const router = express.Router();
const postStepsController = require('../controllers/postStepsController');
const {requireAuthUser} = require('../middleware/authMiddleware');

// Routes publiques (si nécessaire)
// router.get('/public', postStepsController.getAllPostSteps);

// Routes protégées par authentification
router.use(requireAuthUser);

// CRUD de base
router.post('/', postStepsController.createPostStep);
router.get('/', postStepsController.getAllPostSteps);
router.get('/:id', postStepsController.getPostStepById);
router.put('/:id', postStepsController.updatePostStep);
router.delete('/:id', postStepsController.deletePostStep);

// Routes spécialisées
router.get('/post/:postId', postStepsController.getPostStepsByPostId);
router.get('/type/:type', postStepsController.getPostStepsByType);

// Routes pour les nœuds d'évaluation
router.post('/post/:postId/node', postStepsController.createNode);
router.post('/post/:postId/nodes', postStepsController.saveMultipleNodes);
router.get('/node/:nodeId', postStepsController.getPostStepByNodeId);
router.put('/node/:nodeId', postStepsController.updatePostStepByNodeId);
router.delete('/node/:nodeId', postStepsController.deletePostStepByNodeId);

// Routes pour la configuration et position des nœuds
router.put('/node/:nodeId/config', postStepsController.updateNodeConfig);
router.put('/node/:nodeId/position', postStepsController.updateNodePosition);

// Routes pour récupérer par type spécifique
router.get('/post/:postId/type/:nodeType', postStepsController.getNodesBySpecificType);

// Route utilitaire
router.get('/post/:postId/next-node-number', postStepsController.getNextNodeNumber);

module.exports = router; 