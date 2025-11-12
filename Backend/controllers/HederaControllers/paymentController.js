const tokenService = require("../../services/tokenService");
const hbarPricingService = require("../../services/hbarPricingService");
const taiTokenDistributionService = require("../../services/taiTokenDistributionService");
const hederaService = require("../../services/hederaService");
const User = require("../../models/UserModel");
const TokenTransaction = require("../../models/TokenTransactionModel");
const {
  Client,
  AccountId,
  TransactionId
} = require('@hashgraph/sdk');

console.log('🔧 Payment controller loaded at:', new Date().toISOString());

/**
 * Get current pricing plans with real-time HBAR conversion
 */
module.exports.getPricingPlans = async (req, res) => {
  try {
    console.log('📊 Fetching current pricing plans...');

    const pricingData = await tokenService.getPricingPlans();

    res.status(200).json({
      success: true,
      message: "Pricing plans retrieved successfully",
      data: pricingData
    });
  } catch (error) {
    console.error("❌ Error getting pricing plans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get pricing plans",
      error: error.message
    });
  }
};

/**
 * Initiate TAI token purchase
 */
module.exports.initiateTaiPurchase = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId, paymentMethod, walletAddress } = req.body;

    console.log(`💰 Initiating TAI purchase for user ${userId}, plan: ${planId}`);

    // Validate required fields
    if (!planId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Plan ID and payment method are required"
      });
    }

    // Check if user has Hedera account
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Create Hedera account if user doesn't have one
    if (!user.hederaAccountId && user.role === 'Company') {
      console.log('🔧 Creating Hedera account for company user...');
      try {
        const hederaAccount = await hederaService.createHederaAccount();

        // Update user with Hedera account info
        await User.findByIdAndUpdate(userId, {
          hederaAccountId: hederaAccount.hederaAccountId,
          hederaPrivateKey: hederaAccount.hederaPrivateKey,
          hederaPublicKey: hederaAccount.hederaPublicKey
        });

        user.hederaAccountId = hederaAccount.hederaAccountId;
        user.hederaPrivateKey = hederaAccount.hederaPrivateKey;
        user.hederaPublicKey = hederaAccount.hederaPublicKey;

        console.log(`✅ Hedera account created for user: ${hederaAccount.hederaAccountId}`);
      } catch (hederaError) {
        console.error('❌ Failed to create Hedera account:', hederaError);
        return res.status(500).json({
          success: false,
          message: "Failed to create Hedera account",
          error: hederaError.message
        });
      }
    }

    // Initiate the purchase
    const result = await tokenService.initiateTaiPurchase(userId, {
      planId,
      paymentMethod,
      walletAddress
    });

    res.status(200).json({
      success: true,
      message: "TAI token purchase initiated successfully",
      data: {
        transaction: result.transaction,
        paymentDetails: result.paymentDetails,
        userHederaAccount: user.hederaAccountId
      }
    });
  } catch (error) {
    console.error("❌ Error initiating TAI purchase:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate TAI token purchase",
      error: error.message
    });
  }
};

/**
 * Verify HBAR payment on Hedera network
 */
module.exports.verifyHbarPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transactionId, hederaTransactionId } = req.body;

    console.log(`🔍 Verifying HBAR payment for transaction ${transactionId}`);

    if (!transactionId || !hederaTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID and Hedera transaction ID are required"
      });
    }

    // Find the pending transaction
    const transaction = await TokenTransaction.findOne({
      userId,
      transactionId,
      status: 'pending',
      type: 'purchase'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found or already processed"
      });
    }

    // Initialize Hedera client for verification
    const client = process.env.HEDERA_NETWORK === 'mainnet'
      ? Client.forMainnet()
      : Client.forTestnet();

    client.setOperator(
      process.env.HEDERA_ACCOUNT_ID,
      process.env.HEDERA_PRIVATE_KEY
    );

    try {
      // Verify the transaction on Hedera network
      console.log(`🔍 Querying Hedera transaction: ${hederaTransactionId}`);

      const transactionRecord = await new TransactionId.fromString(hederaTransactionId)
        .getRecord(client);

      // Check if transaction was successful
      if (transactionRecord.receipt.status.toString() === 'SUCCESS') {
        console.log(`✅ Payment verified successfully`);

        // Update transaction status
        await TokenTransaction.findByIdAndUpdate(transaction._id, {
          status: 'verified',
          hederaTransactionHash: hederaTransactionId,
          verifiedAt: new Date(),
          metadata: {
            ...transaction.metadata,
            hederaRecord: {
              status: transactionRecord.receipt.status.toString(),
              consensusTimestamp: transactionRecord.consensusTimestamp?.toString(),
              transactionFee: transactionRecord.transactionFee?.toString()
            }
          }
        });

        res.status(200).json({
          success: true,
          message: "Payment verified successfully",
          data: {
            transactionId,
            hederaTransactionId,
            status: 'verified',
            verifiedAt: new Date().toISOString()
          }
        });
      } else {
        // Payment failed
        await TokenTransaction.findByIdAndUpdate(transaction._id, {
          status: 'failed',
          failureReason: `Hedera transaction failed: ${transactionRecord.receipt.status}`,
          hederaTransactionHash: hederaTransactionId
        });

        res.status(400).json({
          success: false,
          message: "Payment verification failed",
          error: `Transaction status: ${transactionRecord.receipt.status}`
        });
      }
    } catch (hederaError) {
      console.error('❌ Hedera verification error:', hederaError);

      res.status(400).json({
        success: false,
        message: "Failed to verify payment on Hedera network",
        error: hederaError.message
      });
    } finally {
      client.close();
    }
  } catch (error) {
    console.error("❌ Error verifying HBAR payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: error.message
    });
  }
};

/**
 * Distribute TAI tokens and gas fees after payment verification
 */
module.exports.distributeTokens = async (req, res) => {
  try {
    const userId = req.user._id;
    const { transactionId } = req.body;

    console.log(`🚀 Starting token distribution for transaction ${transactionId}`);

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required"
      });
    }

    // Find the verified transaction
    const transaction = await TokenTransaction.findOne({
      userId,
      transactionId,
      status: 'verified',
      type: 'purchase'
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Verified transaction not found"
      });
    }

    // Get user with Hedera account details
    const user = await User.findById(userId);
    if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
      return res.status(400).json({
        success: false,
        message: "User Hedera account not found"
      });
    }

    // Extract distribution details from transaction metadata
    const { taiTokens, gasFeeHbar } = transaction.metadata;

    try {
      // Perform the complete distribution
      const distributionResult = await taiTokenDistributionService.completeDistribution(
        user.hederaAccountId,
        user.hederaPrivateKey,
        taiTokens,
        gasFeeHbar,
        transactionId
      );

      if (distributionResult.success) {
        // Update transaction status to completed
        await TokenTransaction.findByIdAndUpdate(transaction._id, {
          status: 'completed',
          completedAt: new Date(),
          metadata: {
            ...transaction.metadata,
            distributionResult
          }
        });

        // Update user's token balance and gas fee balance
        await tokenService.updateUserBalance(userId, taiTokens);

        await User.findByIdAndUpdate(userId, {
          $inc: { gasFeeBalance: gasFeeHbar }
        });

        console.log(`🎉 Token distribution completed successfully`);

        res.status(200).json({
          success: true,
          message: "Tokens distributed successfully",
          data: {
            transactionId,
            taiTokens,
            gasFeeHbar,
            distributionResult,
            userAccount: user.hederaAccountId
          }
        });
      } else {
        // Partial distribution - some steps failed
        await TokenTransaction.findByIdAndUpdate(transaction._id, {
          status: 'partially_completed',
          metadata: {
            ...transaction.metadata,
            distributionResult
          }
        });

        res.status(207).json({
          success: false,
          message: "Token distribution partially completed",
          data: {
            transactionId,
            distributionResult
          }
        });
      }
    } catch (distributionError) {
      console.error('❌ Distribution error:', distributionError);

      // Mark transaction as failed
      await TokenTransaction.findByIdAndUpdate(transaction._id, {
        status: 'failed',
        failureReason: `Distribution failed: ${distributionError.message}`
      });

      res.status(500).json({
        success: false,
        message: "Token distribution failed",
        error: distributionError.message
      });
    }
  } catch (error) {
    console.error("❌ Error distributing tokens:", error);
    res.status(500).json({
      success: false,
      message: "Failed to distribute tokens",
      error: error.message
    });
  }
};

/**
 * Get current HBAR price
 */
module.exports.getHbarPrice = async (req, res) => {
  try {
    const price = await hbarPricingService.getCurrentPrice();
    const cacheStatus = hbarPricingService.getCacheStatus();

    res.status(200).json({
      success: true,
      message: "HBAR price retrieved successfully",
      data: {
        price,
        ...cacheStatus
      }
    });
  } catch (error) {
    console.error("❌ Error getting HBAR price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get HBAR price",
      error: error.message
    });
  }
};

/**
 * Refresh HBAR price cache
 */
module.exports.refreshHbarPrice = async (req, res) => {
  try {
    const newPrice = await hbarPricingService.refreshPrice();

    res.status(200).json({
      success: true,
      message: "HBAR price refreshed successfully",
      data: {
        price: newPrice,
        refreshedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("❌ Error refreshing HBAR price:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refresh HBAR price",
      error: error.message
    });
  }
};

/**
 * Get user's payment history
 */
module.exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 20, type = 'purchase', status } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      type,
      status
    };

    const result = await TokenTransaction.getUserTransactions(userId, options);

    res.status(200).json({
      success: true,
      message: "Payment history retrieved successfully",
      data: result
    });
  } catch (error) {
    console.error("❌ Error getting payment history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment history",
      error: error.message
    });
  }
};

/**
 * Get payment statistics for user
 */
module.exports.getPaymentStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user balance
    const balance = await tokenService.getUserBalance(userId);

    // Get user info
    const user = await User.findById(userId).select('gasFeeBalance hederaAccountId');

    // Get transaction statistics
    const totalPurchases = await TokenTransaction.countDocuments({
      userId,
      type: 'purchase',
      status: 'completed'
    });

    const totalSpent = await TokenTransaction.aggregate([
      {
        $match: {
          userId: userId,
          type: 'purchase',
          status: 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: "Payment statistics retrieved successfully",
      data: {
        tokenBalance: balance.balance,
        gasFeeBalance: user?.gasFeeBalance || 0,
        hederaAccount: user?.hederaAccountId,
        totalPurchases,
        totalSpentUsd: totalSpent[0]?.totalAmount || 0,
        lastUpdated: balance.lastUpdated
      }
    });
  } catch (error) {
    console.error("❌ Error getting payment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payment statistics",
      error: error.message
    });
  }
};
/**
 * Complete payment and distribute tokens (simplified endpoint for frontend)
 * Combines payment verification and token distribution in one call
 */
module.exports.completePayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { planId, hederaTransactionId } = req.body;

    console.log(`🎯 Complete payment initiated for user ${userId}, plan: ${planId}`);

    if (!planId || !hederaTransactionId) {
      return res.status(400).json({
        success: false,
        message: "Plan ID and Hedera transaction ID are required"
      });
    }

    // Get user with Hedera account details
    const user = await User.findById(userId);
    if (!user || !user.hederaAccountId || !user.hederaPrivateKey) {
      return res.status(400).json({
        success: false,
        message: "User Hedera account not found. Please create a company profile first."
      });
    }

    // Get pricing plan
    const plan = tokenService.PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Pricing plan not found"
      });
    }

    // Get pricing info with HBAR conversion
    const pricingInfo = await hbarPricingService.getPricingInfo([plan.priceUsd]);
    const conversion = pricingInfo.conversions[plan.priceUsd];
    const taiTokens = tokenService.calculateTaiTokens(plan.priceUsd);

    // Create transaction record
    const transaction = new TokenTransaction({
      userId,
      type: 'purchase',
      amount: taiTokens,
      price: plan.priceUsd,
      status: 'pending',
      paymentMethod: 'hashpack',
      transactionId: hederaTransactionId,
      hederaTransactionHash: hederaTransactionId,
      description: `TAI Token Purchase - ${plan.name}`,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        priceUsd: plan.priceUsd,
        hbarAmount: conversion.baseHbar,
        gasFeeHbar: conversion.gasFeeHbar,
        totalHbar: conversion.totalHbar,
        hbarRate: pricingInfo.hbarPrice,
        taiTokens: taiTokens,
        taiTokenConfig: tokenService.TAI_TOKEN_CONFIG,
        purchaseType: 'tai_token'
      }
    });

    await transaction.save();

    // Perform the complete distribution (tokens + gas fee)
    console.log(`🚀 Starting token distribution...`);
    const distributionResult = await taiTokenDistributionService.completeDistribution(
      user.hederaAccountId,
      user.hederaPrivateKey,
      taiTokens,
      conversion.gasFeeHbar,
      hederaTransactionId
    );

    if (distributionResult.success) {
      // Update transaction status to completed
      await TokenTransaction.findByIdAndUpdate(transaction._id, {
        status: 'completed',
        completedAt: new Date(),
        verifiedAt: new Date(),
        metadata: {
          ...transaction.metadata,
          distributionResult
        }
      });

      // Update user's token balance
      await tokenService.updateUserBalance(userId, taiTokens);

      // Update user's gas fee balance
      await User.findByIdAndUpdate(userId, {
        $inc: { gasFeeBalance: conversion.gasFeeHbar }
      });

      console.log(`🎉 Payment completed successfully for user ${userId}`);

      res.status(200).json({
        success: true,
        message: "Payment completed and tokens distributed successfully",
        data: {
          transactionId: hederaTransactionId,
          planName: plan.name,
          taiTokens,
          gasFeeHbar: conversion.gasFeeHbar,
          totalHbarPaid: conversion.totalHbar,
          distributionResult,
          userAccount: user.hederaAccountId
        }
      });
    } else {
      // Partial distribution
      await TokenTransaction.findByIdAndUpdate(transaction._id, {
        status: 'partially_completed',
        metadata: {
          ...transaction.metadata,
          distributionResult
        }
      });

      res.status(207).json({
        success: false,
        message: "Payment partially completed. Some steps failed.",
        data: {
          transactionId: hederaTransactionId,
          distributionResult
        }
      });
    }
  } catch (error) {
    console.error("❌ Error completing payment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete payment",
      error: error.message
    });
  }
};
