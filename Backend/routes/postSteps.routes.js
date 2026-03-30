/**
 * Post steps routes (workflow and nodes)
 *
 * Global applied middlewares:
 * - requireAuthUser: requires an authenticated user
 */
const express = require('express');
const router = express.Router();
const postStepsController = require('../controllers/PostControllers/postSteps.controller');
const {requireAuthUser} = require('../middleware/security/auth.middleware');
const authLogMiddleware = require("../middleware/security/request-log.middleware")

// Public routes (if needed)
// router.get('/public', postStepsController.getAllPostSteps);

// Auth obligatoire pour toutes les routes ci-dessous
router.use(requireAuthUser, authLogMiddleware("PostSteps"));

// CRUD de base
// POST/GET/PUT/DELETE /post-steps
//router.post('/', postStepsController.createPostStep);
//router.get('/', postStepsController.getAllPostSteps);
//router.get('/:id', postStepsController.getPostStepById);
//router.put('/:id', postStepsController.updatePostStep);
//router.delete('/:id', postStepsController.deletePostStep);

// Specialized routes
// GET /post-steps/post/:postId et /post-steps/type/:type
//router.get('/post/:postId', postStepsController.getPostStepsByPostId);
//router.get('/type/:type', postStepsController.getPostStepsByType);

// Routes for evaluation nodes
// Create/update/delete and fetch by nodeId
//router.post('/post/:postId/node', postStepsController.createNode);
//router.post('/post/:postId/nodes', postStepsController.saveMultipleNodes);
router.post('/post/:postId/steps', postStepsController.addStepsToPost);
//router.get('/node/:nodeId', postStepsController.getPostStepByNodeId);
//router.put('/node/:nodeId', postStepsController.updatePostStepByNodeId);
//router.delete('/node/:nodeId', postStepsController.deletePostStepByNodeId);

// Routes pour la configuration et position des nœuds
// PUT /post-steps/node/:nodeId/config
//router.put('/node/:nodeId/config', postStepsController.updateNodeConfig);
// PUT /post-steps/node/:nodeId/position
//router.put('/node/:nodeId/position', postStepsController.updateNodePosition);

// PUT /post-steps/node/:nodeId/submit-task
// Body: { githubLink: string }
router.put('/node/:nodeId/submit-task', postStepsController.submitTask);

// Routes to retrieve by specific type
// GET /post-steps/post/:postId/type/:nodeType
//router.get('/post/:postId/type/:nodeType', postStepsController.getNodesBySpecificType);

// Route utilitaire
// GET /post-steps/post/:postId/next-node-number
//router.get('/post/:postId/next-node-number', postStepsController.getNextNodeNumber);

module.exports = router; 