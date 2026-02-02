const Agent = require('../models/Agent.model');
const Post = require('../models/Post.model');

/**
 * Validate input data for create/update operations
 * @param {Object} data - Input data to validate
 * @throws {Error} If data is invalid or missing required fields
 */
const validateCreateData = (data) => {
  if (!data || typeof data !== 'object') {
    const err = new Error('Invalid data: expected object');
    err.status = 400;
    throw err;
  }
  if (!data.agentId) {
    const err = new Error('Missing agentId');
    err.status = 400;
    throw err;
  }
  if (!data.postId) {
    const err = new Error('Missing postId');
    err.status = 400;
    throw err;
  }
};

/**
 * Verify agent and post existence in parallel
 * @param {string} agentId - Agent ID to verify
 * @param {string} postId - Post ID to verify
 * @returns {Promise<{agent, post}>} Verified agent and post objects
 * @throws {Error} If agent or post not found
 */
const verifyAgentAndPostExist = async (agentId, postId) => {
  const [agent, post] = await Promise.all([
    Agent.findById(agentId).lean().select('_id'),
    Post.findById(postId).lean().select('_id')
  ]);

  if (!agent) {
    const err = new Error('Agent not found');
    err.status = 404;
    throw err;
  }

  if (!post) {
    const err = new Error('Post not found');
    err.status = 404;
    throw err;
  }

  return { agent, post };
};

/**
 * Get agent config with populated references using field projection
 * @param {Object} AgentConfig - AgentConfig model
 * @param {Object} query - Query object for findOne
 * @returns {Promise<Object>} AgentConfig document with populated references
 */
const getConfigWithPopulates = (AgentConfig) => {
  return async (query) => {
    return AgentConfig.findOne(query)
      .populate('agent', 'name status')
      .populate('post', 'title description')
      .lean();
  };
};

module.exports = {
  validateCreateData,
  verifyAgentAndPostExist,
  getConfigWithPopulates
};
