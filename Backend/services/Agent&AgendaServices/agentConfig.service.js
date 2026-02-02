const AgentConfig = require('../../models/AgentConfigModel');
const Agent = require('../../models/AgentModel');
const Post = require('../../models/PostModel');
const User = require('../../models/UserModel');
const postPaymentService = require('../postPayment.service');
const { validateCreateData, verifyAgentAndPostExist, getConfigWithPopulates } = require('../../helpers/agent-config.helpers');

module.exports.createAgentConfig = async (data) => {
  try {
    validateCreateData(data);

    // Check uniqueness with single $or query instead of 2 separate queries
    const existing = await AgentConfig.findOne({
      $or: [{ agentId: data.agentId }, { postId: data.postId }]
    }).lean().select('_id agentId postId');

    if (existing) {
      if (existing.agentId?.toString() === data.agentId.toString()) {
        const err = new Error('AgentConfig already exists for this agent');
        err.status = 409;
        throw err;
      }
      if (existing.postId?.toString() === data.postId.toString()) {
        const err = new Error('AgentConfig already exists for this post');
        err.status = 409;
        throw err;
      }
    }

    // Verify both exist in parallel
    await verifyAgentAndPostExist(data.agentId, data.postId);

    // Create config
    const cfg = new AgentConfig(data);
    const savedConfig = await cfg.save();

    // Update both Agent and Post references in parallel
    await Promise.all([
      Agent.findByIdAndUpdate(data.agentId, { agentConfig: savedConfig._id }),
      Post.findByIdAndUpdate(data.postId, { agentConfig: savedConfig._id })
    ]);

    return savedConfig;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.getAgentConfigById = async (id) => {
  try {
    const cfg = await getConfigWithPopulates(AgentConfig)({ _id: id });
    if (!cfg) {
      const err = new Error('AgentConfig not found');
      err.status = 404;
      throw err;
    }
    return cfg;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.getAgentConfigByAgentId = async (agentId) => {
  try {
    const cfg = await getConfigWithPopulates(AgentConfig)({ agentId });
    if (!cfg) {
      const err = new Error('AgentConfig not found for this agent');
      err.status = 404;
      throw err;
    }
    return cfg;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.getAgentConfigByPostId = async (postId) => {
  try {
    const cfg = await getConfigWithPopulates(AgentConfig)({ postId });
    if (!cfg) {
      const err = new Error('AgentConfig not found for this post');
      err.status = 404;
      throw err;
    }
    return cfg;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.listAgentConfigs = async (filters = {}) => {
  try {
    return await AgentConfig.find(filters)
      .populate('agent', 'name status')
      .populate('post', 'title description')
      .lean()
      .sort({ createdAt: -1 });
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.updateAgentConfig = async (id, updateData) => {
  try {
    const cfg = await AgentConfig.findById(id);
    if (!cfg) {
      const err = new Error('AgentConfig not found');
      err.status = 404;
      throw err;
    }

    // Check uniqueness of new agentId/postId (only if changed)
    if (updateData.agentId && updateData.agentId.toString() !== cfg.agentId?.toString()) {
      const existing = await AgentConfig.findOne({
        agentId: updateData.agentId,
        _id: { $ne: id }
      }).lean().select('_id');
      if (existing) {
        const err = new Error('Another AgentConfig already exists for the provided agentId');
        err.status = 409;
        throw err;
      }
    }

    if (updateData.postId && updateData.postId.toString() !== cfg.postId?.toString()) {
      const existing = await AgentConfig.findOne({
        postId: updateData.postId,
        _id: { $ne: id }
      }).lean().select('_id');
      if (existing) {
        const err = new Error('Another AgentConfig already exists for the provided postId');
        err.status = 409;
        throw err;
      }
    }

    const oldAgentId = cfg.agentId ? cfg.agentId.toString() : null;
    const oldPostId = cfg.postId ? cfg.postId.toString() : null;

    Object.assign(cfg, updateData);
    const saved = await cfg.save();

    // Parallelize Agent and Post reference updates
    const updates = [];

    if (updateData.agentId && updateData.agentId.toString() !== oldAgentId) {
      if (oldAgentId) {
        updates.push(Agent.findByIdAndUpdate(oldAgentId, { $unset: { agentConfig: 1 } }).catch(() => {}));
      }
      updates.push(Agent.findByIdAndUpdate(updateData.agentId, { agentConfig: saved._id }).catch(() => {}));
    }

    if (updateData.postId && updateData.postId.toString() !== oldPostId) {
      if (oldPostId) {
        updates.push(Post.findByIdAndUpdate(oldPostId, { $unset: { agentConfig: 1 } }).catch(() => {}));
      }
      updates.push(Post.findByIdAndUpdate(updateData.postId, { agentConfig: saved._id }).catch(() => {}));
    }

    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return saved;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.upsertAgentConfig = async (data) => {
  try {
    validateCreateData(data);

    // Single $or query to check existing by agentId or postId
    const existing = await AgentConfig.findOne({
      $or: [{ agentId: data.agentId }, { postId: data.postId }]
    }).lean().select('_id agentId postId');

    if (existing) {
      // Update existing
      return await module.exports.updateAgentConfig(existing._id, data);
    }

    // Create new
    return await module.exports.createAgentConfig(data);
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.deleteAgentConfig = async (id) => {
  try {
    const cfg = await AgentConfig.findById(id);
    if (!cfg) {
      const err = new Error('AgentConfig not found');
      err.status = 404;
      throw err;
    }

    // Parallelize cleanup: unset references in Agent/Post + delete config
    const cleanupTasks = [
      AgentConfig.deleteOne({ _id: id })
    ];

    if (cfg.agentId) {
      cleanupTasks.push(Agent.findByIdAndUpdate(cfg.agentId, { $unset: { agentConfig: 1 } }).catch(() => {}));
    }

    if (cfg.postId) {
      cleanupTasks.push(Post.findByIdAndUpdate(cfg.postId, { $unset: { agentConfig: 1 } }).catch(() => {}));
    }

    await Promise.all(cleanupTasks);
    return cfg;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

module.exports.processAgentCreationPayment = async (postId, userId) => {
  try {
    console.log(`💳 Processing agent creation payment for Post ${postId}...`);

    // Fetch Post and User in parallel with minimal fields
    const [post, user] = await Promise.all([
      Post.findById(postId).populate('PostSteps').select('user paymentStatus paymentTransactionId PostSteps'),
      User.findById(userId).select('hederaAccountId hederaPrivateKey')
    ]);

    if (!post) {
      const err = new Error('Post not found');
      err.status = 404;
      throw err;
    }

    if (post.user.toString() !== userId.toString()) {
      const err = new Error('User is not the owner of this post');
      err.status = 403;
      throw err;
    }

    // Check if already paid
    if (post.paymentStatus === 'completed') {
      console.log(`ℹ️  Payment already completed for Post ${postId}`);
      return {
        success: true,
        alreadyPaid: true,
        message: 'Payment already completed',
        transactionId: post.paymentTransactionId
      };
    }

    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }

    if (!user.hederaAccountId || !user.hederaPrivateKey) {
      const err = new Error('User Hedera account not configured');
      err.status = 400;
      throw err;
    }

    // Calculate price based on number of steps
    const numberOfSteps = post.PostSteps?.length || 0;
    const price = postPaymentService.calculatePrice(numberOfSteps);

    console.log(`📊 Payment calculation: Steps=${numberOfSteps}, Price=${price} TAI`);

    // Update post status to pending
    post.paymentStatus = 'pending';
    await post.save();

    // Process the payment
    const paymentResult = await postPaymentService.processPayment(
      user.hederaAccountId,
      user.hederaPrivateKey,
      price,
      postId,
      userId
    );

    // Update post with payment details (async, don't block response)
    Post.findByIdAndUpdate(postId, {
      paymentStatus: 'completed',
      paymentTransactionId: paymentResult.transactionId,
      pricePaid: price,
      paymentCompletedAt: new Date()
    }).catch(err => {
      console.error(`⚠️  Failed to finalize post payment status: ${err.message}`);
    });

    console.log(`✅ Agent creation payment completed for Post ${postId}`);

    return {
      success: true,
      payment: paymentResult,
      postId: postId,
      price: price,
      numberOfSteps: numberOfSteps
    };
  } catch (error) {
    console.error(`❌ Error processing agent creation payment:`, error?.message || error);

    // Update post status to failed (async, non-blocking)
    Post.findByIdAndUpdate(postId, {
      paymentStatus: 'failed',
      paymentError: error?.message || 'Unknown error'
    }).catch(err => {
      console.error('Failed to update post payment status:', err.message);
    });

    error.status = error.status || 500;
    throw error;
  }
};
