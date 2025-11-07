const AgentConfig = require('../models/AgentConfigModel');

module.exports = {
  create: async (data) => {
    // Ensure unique constraints by checking existing agentId/postId
    const existingByAgent = await AgentConfig.findOne({ agentId: data.agentId });
    if (existingByAgent) throw new Error('AgentConfig already exists for this agent');

    const existingByPost = await AgentConfig.findOne({ postId: data.postId });
    if (existingByPost) throw new Error('AgentConfig already exists for this post');

    const cfg = new AgentConfig(data);
    return await cfg.save();
  },

  getById: async (id) => {
    const cfg = await AgentConfig.findById(id).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found');
    return cfg;
  },

  getByAgentId: async (agentId) => {
    const cfg = await AgentConfig.findOne({ agentId }).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found for this agent');
    return cfg;
  },

  getByPostId: async (postId) => {
    const cfg = await AgentConfig.findOne({ postId }).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found for this post');
    return cfg;
  },

  list: async (filters = {}) => {
    return await AgentConfig.find(filters).populate('agent').populate('post').sort({ createdAt: -1 });
  },

  update: async (id, updateData) => {
    const cfg = await AgentConfig.findById(id);
    if (!cfg) throw new Error('AgentConfig not found');

    // Prevent changing agentId/postId to collide with existing configs
    if (updateData.agentId && updateData.agentId.toString() !== cfg.agentId?.toString()) {
      const existing = await AgentConfig.findOne({ agentId: updateData.agentId });
      if (existing) throw new Error('Another AgentConfig already exists for the provided agentId');
    }
    if (updateData.postId && updateData.postId.toString() !== cfg.postId?.toString()) {
      const existing = await AgentConfig.findOne({ postId: updateData.postId });
      if (existing) throw new Error('Another AgentConfig already exists for the provided postId');
    }

    Object.assign(cfg, updateData);
    return await cfg.save();
  },

  remove: async (id) => {
    const cfg = await AgentConfig.findByIdAndDelete(id);
    if (!cfg) throw new Error('AgentConfig not found');
    return cfg;
  },
};
