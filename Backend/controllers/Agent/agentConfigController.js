const agentConfigService = require('../../services/Agent&AgendaServices/agentConfigService');

const isValidMongoId = (id) => /^[0-9a-f]{24}$/i.test(String(id));

const handleError = (res, error, defaultStatus = 400) => {
  console.error('AgentConfig error:', error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({ success: false, error: error?.message || 'Internal error' });
};

exports.createAgentConfig = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    const cfg = await agentConfigService.upsertAgentConfig(req.body);
    res.status(201).json({ success: true, data: cfg });
  } catch (err) {
    handleError(res, err, 400);
  }
};

exports.getAgentConfigById = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    const cfg = await agentConfigService.getAgentConfigById(req.params.id);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    handleError(res, err, 404);
  }
};

exports.getAgentConfigByAgent = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.agentId)) {
      return res.status(400).json({ success: false, error: 'Invalid agentId format' });
    }
    const cfg = await agentConfigService.getAgentConfigByAgentId(req.params.agentId);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    handleError(res, err, 404);
  }
};

exports.getAgentConfigByPost = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.postId)) {
      return res.status(400).json({ success: false, error: 'Invalid postId format' });
    }
    const cfg = await agentConfigService.getAgentConfigByPostId(req.params.postId);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    handleError(res, err, 404);
  }
};

exports.listAgentConfigs = async (req, res) => {
  try {
    const filters = {};
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';
    const list = await agentConfigService.listAgentConfigs(filters);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    handleError(res, err, 500);
  }
};

exports.updateAgentConfig = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid update payload' });
    }
    const updated = await agentConfigService.updateAgentConfig(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    handleError(res, err, 400);
  }
};

exports.deleteAgentConfig = async (req, res) => {
  try {
    if (!isValidMongoId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    await agentConfigService.deleteAgentConfig(req.params.id);
    res.status(200).json({ success: true, message: 'AgentConfig deleted' });
  } catch (err) {
    handleError(res, err, 400);
  }
};
