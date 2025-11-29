const agentConfigService = require('../../services/Agent&AgendaServices/agentConfigService');

exports.createAgentConfig = async (req, res) => {
  try {
    const payload = req.body;
    // Optionally attach owner info from req.user (company) if needed
    // Use upsert: create new or update existing based on agentId/postId
    const cfg = await agentConfigService.upsertAgentConfig(payload);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAgentConfigById = async (req, res) => {
  try {
    const cfg = await agentConfigService.getAgentConfigById(req.params.id);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.getAgentConfigByAgent = async (req, res) => {
  try {
    const cfg = await agentConfigService.getAgentConfigByAgentId(req.params.agentId);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.getAgentConfigByPost = async (req, res) => {
  try {
    const cfg = await agentConfigService.getAgentConfigByPostId(req.params.postId);
    res.status(200).json({ success: true, data: cfg });
  } catch (err) {
    res.status(404).json({ success: false, error: err.message });
  }
};

exports.listAgentConfigs = async (req, res) => {
  try {
    const filters = {};
    // Accept query filters (e.g. isActive)
    if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

    const list = await agentConfigService.listAgentConfigs(filters);
    res.status(200).json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAgentConfig = async (req, res) => {
  try {
    const updated = await agentConfigService.updateAgentConfig(req.params.id, req.body);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.deleteAgentConfig = async (req, res) => {
  try {
    await agentConfigService.deleteAgentConfig(req.params.id);
    res.status(200).json({ success: true, message: 'AgentConfig deleted' });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
