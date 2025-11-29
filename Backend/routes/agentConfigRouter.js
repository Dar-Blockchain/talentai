const express = require('express');
const router = express.Router();
const { requireAuthUser } = require('../middleware/authMiddleware');
const agentConfigController = require('../controllers/Agent/agentConfigController');
const authLogMiddleware = require("../middleware/SystemeLogs/LogMiddleware")

// Public read endpoints
router.get('/getAgentConfigById/:id', agentConfigController.getAgentConfigById);
router.get('/getAgentConfigByAgent/:agentId', agentConfigController.getAgentConfigByAgent);
router.get('/getAgentConfigByPost/:postId', agentConfigController.getAgentConfigByPost);

// Protected endpoints
router.use(requireAuthUser, authLogMiddleware("AgentConfigs"));
router.get('/listAgentConfigs', agentConfigController.listAgentConfigs);
router.post('/createAgentConfig', agentConfigController.createAgentConfig);
router.put('/updateAgentConfig/:id', agentConfigController.updateAgentConfig);
router.delete('/deleteAgentConfig/:id', agentConfigController.deleteAgentConfig);

module.exports = router;
