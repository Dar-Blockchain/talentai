const express = require('express');
const router = express.Router();
const { requireAuthUser } = require('../middleware/authMiddleware');
const agentConfigController = require('../controllers/agentConfigController');

// Public read endpoints
router.get('/:id', agentConfigController.getAgentConfigById);
router.get('/by-agent/:agentId', agentConfigController.getAgentConfigByAgent);
router.get('/by-post/:postId', agentConfigController.getAgentConfigByPost);

// Protected endpoints
router.use(requireAuthUser);
router.get('/', agentConfigController.listAgentConfigs);
router.post('/', agentConfigController.createAgentConfig);
router.put('/:id', agentConfigController.updateAgentConfig);
router.delete('/:id', agentConfigController.deleteAgentConfig);

module.exports = router;
