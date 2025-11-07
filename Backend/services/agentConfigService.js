const AgentConfig = require('../models/AgentConfigModel');

module.exports = {
  create: async (data) => {
    const Agent = require('../models/AgentModel');
    const Post = require('../models/PostModel');

    // Ensure unique constraints by checking existing agentId/postId
    const existingByAgent = await AgentConfig.findOne({ agentId: data.agentId });
    if (existingByAgent) throw new Error('AgentConfig already exists for this agent');

    const existingByPost = await AgentConfig.findOne({ postId: data.postId });
    if (existingByPost) throw new Error('AgentConfig already exists for this post');

    // Vérifier que l'Agent et le Post existent
    const agent = await Agent.findById(data.agentId);
    if (!agent) throw new Error('Agent not found');

    const post = await Post.findById(data.postId);
    if (!post) throw new Error('Post not found');

    // Créer la config
    const cfg = new AgentConfig(data);
    const savedConfig = await cfg.save();

    // Mettre à jour l'Agent avec la référence à la config
    agent.agentConfig = savedConfig._id;
    await agent.save();

    // Mettre à jour le Post avec la référence à la config
    post.agentConfig = savedConfig._id;
    await post.save();

    return savedConfig;
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
    const Agent = require('../models/AgentModel');
    const Post = require('../models/PostModel');

    // Trouver la config avant de la supprimer
    const cfg = await AgentConfig.findById(id);
    if (!cfg) throw new Error('AgentConfig not found');

    // Supprimer les références dans Agent et Post
    await Agent.findByIdAndUpdate(cfg.agentId, { $unset: { agentConfig: 1 } });
    await Post.findByIdAndUpdate(cfg.postId, { $unset: { agentConfig: 1 } });

    // Supprimer la config
    await cfg.deleteOne();
    return cfg;
  },
};
