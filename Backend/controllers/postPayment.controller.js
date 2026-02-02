const postPaymentService = require('../services/postPayment.service');
const Post = require('../models/Post.model');
const User = require('../models/User.model');

/**
 * Calculate price for post creation based on number of steps
 * GET /api/posts/payment/calculate-price/:postId
 */
exports.calculatePostPrice = async (req, res) => {
  try {
    const { postId } = req.params;

    // Get post with steps
    const post = await Post.findById(postId).populate('PostSteps');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Verify ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this post'
      });
    }

    // Calculate price based on number of steps
    const numberOfSteps = post.PostSteps?.length || 0;
    const price = postPaymentService.calculatePrice(numberOfSteps);

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        numberOfSteps,
        baseFee: postPaymentService.BASE_FEE,
        stepRate: postPaymentService.STEP_RATE,
        totalPrice: price,
        breakdown: {
          baseFee: `${postPaymentService.BASE_FEE} TAI`,
          stepsCharge: `${numberOfSteps} steps × ${postPaymentService.STEP_RATE} TAI = ${numberOfSteps * postPaymentService.STEP_RATE} TAI`,
          total: `${price} TAI`
        }
      }
    });
  } catch (error) {
    console.error('❌ Error calculating post price:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to calculate price'
    });
  }
};

/**
 * Process payment for post/agent creation
 * POST /api/posts/payment/process
 * Body: { postId, agentId }
 */
exports.processPostPayment = async (req, res) => {
  try {
    const { postId, agentId } = req.body;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: 'Post ID is required'
      });
    }

    // Get post with steps
    const post = await Post.findById(postId).populate('PostSteps');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Verify ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to process payment for this post'
      });
    }

    // Check if already paid
    if (post.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Payment already completed for this post'
      });
    }

    // Get user's Hedera account details
    const user = await User.findById(req.user._id);

    if (!user.hederaAccountId || !user.hederaPrivateKey) {
      return res.status(400).json({
        success: false,
        error: 'User Hedera account not configured. Please set up your wallet first.'
      });
    }

    // Calculate price
    const numberOfSteps = post.PostSteps?.length || 0;
    const price = postPaymentService.calculatePrice(numberOfSteps);

    console.log(`🚀 Initiating payment for Post ${postId}`);
    console.log(`   User: ${user.username} (${user._id})`);
    console.log(`   Steps: ${numberOfSteps}`);
    console.log(`   Price: ${price} TAI`);

    // Update post status to pending payment
    post.paymentStatus = 'pending';
    await post.save();

    // Process payment
    const paymentResult = await postPaymentService.processPayment(
      user.hederaAccountId,
      user.hederaPrivateKey,
      price,
      postId,
      user._id
    );

    // Update post with payment details
    post.paymentStatus = 'completed';
    post.paymentTransactionId = paymentResult.transactionId;
    post.pricePaid = price;
    post.paymentCompletedAt = new Date();
    await post.save();

    console.log(`✅ Payment completed successfully for Post ${postId}`);

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: {
        postId: post._id,
        agentId: agentId || post.agentId,
        payment: {
          amount: price,
          transactionId: paymentResult.transactionId,
          hederaTransactionId: paymentResult.hederaTransactionId,
          status: 'completed',
          timestamp: new Date()
        },
        breakdown: {
          baseFee: postPaymentService.BASE_FEE,
          numberOfSteps: numberOfSteps,
          stepRate: postPaymentService.STEP_RATE,
          total: price
        }
      }
    });
  } catch (error) {
    console.error('❌ Error processing post payment:', error);

    // Update post status to failed if it exists
    if (req.body.postId) {
      try {
        await Post.findByIdAndUpdate(req.body.postId, {
          paymentStatus: 'failed',
          paymentError: error.message
        });
      } catch (updateError) {
        console.error('Failed to update post payment status:', updateError);
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to process payment',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Get payment history for user's posts
 * GET /api/posts/payment/history
 */
exports.getPostPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, postId } = req.query;

    const history = await postPaymentService.getPaymentHistory(userId, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      postId
    });

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('❌ Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payment history'
    });
  }
};

/**
 * Get payment details for a specific post
 * GET /api/posts/payment/details/:postId
 */
exports.getPostPaymentDetails = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId).select('paymentStatus paymentTransactionId pricePaid paymentCompletedAt paymentError PostSteps');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Verify ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this post'
      });
    }

    const numberOfSteps = post.PostSteps?.length || 0;

    res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        paymentStatus: post.paymentStatus || 'not_paid',
        transactionId: post.paymentTransactionId,
        amount: post.pricePaid,
        completedAt: post.paymentCompletedAt,
        error: post.paymentError,
        numberOfSteps: numberOfSteps,
        canPay: post.paymentStatus !== 'completed'
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payment details:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch payment details'
    });
  }
};
