const AgentConfig = require('../models/AgentConfigModel');
const Agent = require('../models/AgentModel');
const Post = require('../models/PostModel');

/**
 * Service pour AgentConfig
 * Structure similaire à `dashboardService.js` : export de fonctions nommées via module.exports
 */

module.exports.createAgentConfig = async (data) => {
  try {
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
  } catch (error) {
    throw new Error('Error creating AgentConfig: ' + error.message);
  }
};

module.exports.getAgentConfigById = async (id) => {
  try {
    const cfg = await AgentConfig.findById(id).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found');
    return cfg;
  } catch (error) {
    throw new Error('Error fetching AgentConfig by id: ' + error.message);
  }
};

module.exports.getAgentConfigByAgentId = async (agentId) => {
  try {
    const cfg = await AgentConfig.findOne({ agentId }).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found for this agent');
    return cfg;
  } catch (error) {
    throw new Error('Error fetching AgentConfig by agentId: ' + error.message);
  }
};

module.exports.getAgentConfigByPostId = async (postId) => {
  try {
    const cfg = await AgentConfig.findOne({ postId }).populate('agent').populate('post');
    if (!cfg) throw new Error('AgentConfig not found for this post');
    return cfg;
  } catch (error) {
    throw new Error('Error fetching AgentConfig by postId: ' + error.message);
  }
};

module.exports.listAgentConfigs = async (filters = {}) => {
  try {
    return await AgentConfig.find(filters).populate('agent').populate('post').sort({ createdAt: -1 });
  } catch (error) {
    throw new Error('Error listing AgentConfigs: ' + error.message);
  }
};

module.exports.updateAgentConfig = async (id, updateData) => {
  try {
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

    // Keep track of old relations to update references if they change
    const oldAgentId = cfg.agentId ? cfg.agentId.toString() : null;
    const oldPostId = cfg.postId ? cfg.postId.toString() : null;

    Object.assign(cfg, updateData);
    const saved = await cfg.save();

    // If agentId changed, update Agent.agentConfig references
    if (updateData.agentId && updateData.agentId.toString() !== oldAgentId) {
      if (oldAgentId) {
        await Agent.findByIdAndUpdate(oldAgentId, { $unset: { agentConfig: 1 } }).catch(() => {});
      }
      await Agent.findByIdAndUpdate(updateData.agentId, { agentConfig: saved._id }).catch(() => {});
    }

    // If postId changed, update Post.agentConfig references
    if (updateData.postId && updateData.postId.toString() !== oldPostId) {
      if (oldPostId) {
        await Post.findByIdAndUpdate(oldPostId, { $unset: { agentConfig: 1 } }).catch(() => {});
      }
      await Post.findByIdAndUpdate(updateData.postId, { agentConfig: saved._id }).catch(() => {});
    }

    return saved;
  } catch (error) {
    throw new Error('Error updating AgentConfig: ' + error.message);
  }
};

/**
 * Upsert - create new or update existing AgentConfig by agentId or postId
 */
module.exports.upsertAgentConfig = async (data) => {
  try {
    // Try to find existing by agentId or postId
    const or = [];
    if (data.agentId) or.push({ agentId: data.agentId });
    if (data.postId) or.push({ postId: data.postId });

    let existing = null;
    if (or.length > 0) {
      existing = await AgentConfig.findOne(or.length === 1 ? or[0] : { $or: or });
    }

    if (existing) {
      // Merge provided data and update
      return await module.exports.updateAgentConfig(existing._id, data);
    }

    // Otherwise create new
    return await module.exports.createAgentConfig(data);
  } catch (error) {
    throw new Error('Error upserting AgentConfig: ' + error.message);
  }
};

module.exports.deleteAgentConfig = async (id) => {
  try {
    // Trouver la config avant de la supprimer
    const cfg = await AgentConfig.findById(id);
    if (!cfg) throw new Error('AgentConfig not found');

    // Supprimer les références dans Agent et Post
    await Agent.findByIdAndUpdate(cfg.agentId, { $unset: { agentConfig: 1 } }).catch(() => {});
    await Post.findByIdAndUpdate(cfg.postId, { $unset: { agentConfig: 1 } }).catch(() => {});

    // Supprimer la config
    await cfg.deleteOne();
    return cfg;
  } catch (error) {
    throw new Error('Error deleting AgentConfig: ' + error.message);
  }
};
