const TokenBalance = require("../models/TokenBalanceModel");
const TokenTransaction = require("../models/TokenTransactionModel");
const hbarPricingService = require('./hbarPricingService');
const { v4: uuidv4 } = require('uuid');

// TAI Token Configuration
const TAI_TOKEN_CONFIG = {
  tokenId: '0.0.6955317',
  name: 'TalentAI',
  symbol: 'TAI',
  decimals: 8,
  totalSupply: 1000000000,
  description: 'TalentAI platform utility token for AI-powered recruitment and talent management'
};

// New pricing plans in USD
const PRICING_PLANS = [
  { id: 'plan1', name: 'Starter Plan', priceUsd: 199, popular: false },
  { id: 'plan2', name: 'Professional Plan', priceUsd: 299, popular: true },
  { id: 'plan3', name: 'Enterprise Plan', priceUsd: 499, popular: false },
];

// Legacy token packages (kept for backward compatibility)
const LEGACY_TOKEN_PACKAGES = [
  { id: 'basic', name: 'Basic', tokens: 100, price: 10 },
  { id: 'popular', name: 'Popular', tokens: 500, price: 45, popular: true, bonus: 50 },
  { id: 'premium', name: 'Premium', tokens: 1000, price: 80, bonus: 150 },
  { id: 'enterprise', name: 'Enterprise', tokens: 5000, price: 350, bonus: 1000 },
];

// Hedera configuration
const HEDERA_ACCOUNT_ID = process.env.HEDERA_ACCOUNT_ID || '0.0.1378';
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || 'testnet';
const GAS_FEE_PERCENTAGE = 0.01; // 1% gas fee

/**
 * Get user's token balance
 */
const getUserBalance = async (userId) => {
  try {
    let tokenBalance = await TokenBalance.findOne({ userId });

    if (!tokenBalance) {
      // Create initial balance record
      tokenBalance = new TokenBalance({
        userId,
        balance: 0,
        lastUpdated: new Date()
      });
      await tokenBalance.save();
    }

    return {
      balance: tokenBalance.balance,
      lastUpdated: tokenBalance.lastUpdated
    };
  } catch (error) {
    console.error("Error getting user balance:", error);
    throw error;
  }
};

/**
 * Initiate TAI token purchase with new pricing plans
 */
const initiateTaiPurchase = async (userId, purchaseData) => {
  try {
    const { planId, paymentMethod, walletAddress } = purchaseData;

    // Find the selected pricing plan
    const plan = PRICING_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error("Invalid pricing plan");
    }

    // Get real-time HBAR conversion
    const pricingInfo = await hbarPricingService.getPricingInfo([plan.priceUsd]);
    const conversion = pricingInfo.conversions[plan.priceUsd];

    // Calculate TAI tokens for this plan
    const taiTokens = calculateTaiTokens(plan.priceUsd);

    // Create pending transaction
    const transaction = new TokenTransaction({
      userId,
      type: 'purchase',
      amount: taiTokens,
      price: plan.priceUsd,
      status: 'pending',
      paymentMethod,
      walletAddress,
      transactionId: uuidv4(),
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
        taiTokenConfig: TAI_TOKEN_CONFIG,
        purchaseType: 'tai_token'
      }
    });

    await transaction.save();

    const paymentDetails = {
      hederaAccountId: HEDERA_ACCOUNT_ID,
      amountHbar: conversion.totalHbar,
      amountUsd: plan.priceUsd,
      gasFeeHbar: conversion.gasFeeHbar,
      network: HEDERA_NETWORK,
      memo: `TAI_Purchase_${transaction.transactionId}`,
      transactionId: transaction.transactionId,
      taiTokens: taiTokens,
      tokenId: TAI_TOKEN_CONFIG.tokenId
    };

    console.log(`💰 TAI Purchase initiated: ${taiTokens} TAI tokens for ${conversion.totalHbar} HBAR`);

    return {
      transaction: {
        id: transaction.transactionId,
        amount: taiTokens,
        priceUsd: plan.priceUsd,
        priceHbar: conversion.totalHbar,
        status: transaction.status,
        type: transaction.type,
        planName: plan.name
      },
      paymentDetails
    };
  } catch (error) {
    console.error("Error initiating TAI purchase:", error);
    throw error;
  }
};

/**
 * Legacy initiate purchase (for backward compatibility)
 */
const initiatePurchase = async (userId, purchaseData) => {
  try {
    const { amount, paymentMethod, walletAddress } = purchaseData;

    // Find matching token package
    const packageInfo = LEGACY_TOKEN_PACKAGES.find(pkg =>
      (pkg.tokens + (pkg.bonus || 0)) === amount
    );

    if (!packageInfo) {
      throw new Error("Invalid token amount");
    }

    // Create pending transaction
    const transaction = new TokenTransaction({
      userId,
      type: 'purchase',
      amount: packageInfo.tokens + (packageInfo.bonus || 0),
      price: packageInfo.price,
      status: 'pending',
      paymentMethod,
      walletAddress,
      transactionId: uuidv4(),
      metadata: {
        packageId: packageInfo.id,
        packageName: packageInfo.name,
        baseTokens: packageInfo.tokens,
        bonusTokens: packageInfo.bonus || 0,
        purchaseType: 'legacy_token'
      }
    });

    await transaction.save();

    const paymentDetails = {
      hederaAccountId: HEDERA_ACCOUNT_ID,
      amount: packageInfo.price,
      network: HEDERA_NETWORK,
      memo: `Token_Purchase_${transaction.transactionId}`,
      transactionId: transaction.transactionId
    };

    return {
      transaction: {
        id: transaction.transactionId,
        amount: transaction.amount,
        price: transaction.price,
        status: transaction.status,
        type: transaction.type
      },
      paymentDetails
    };
  } catch (error) {
    console.error("Error initiating purchase:", error);
    throw error;
  }
};

/**
 * Verify payment and update balance
 */
const verifyPayment = async (userId, transactionHash) => {
  try {
    // Find the pending transaction
    const transaction = await TokenTransaction.findOne({
      userId,
      transactionId: transactionHash,
      status: 'pending',
      type: 'purchase'
    });

    if (!transaction) {
      return {
        verified: false,
        reason: "Transaction not found or already processed"
      };
    }

    // In a real implementation, you would verify the transaction on Hedera network
    // For now, we'll simulate verification
    const isVerified = await simulateHederaVerification(transactionHash, transaction.price);

    if (isVerified) {
      // Update transaction status
      transaction.status = 'completed';
      transaction.hederaTransactionHash = transactionHash;
      transaction.completedAt = new Date();
      await transaction.save();

      // Update user balance
      const newBalance = await updateUserBalance(userId, transaction.amount);

      return {
        verified: true,
        newBalance
      };
    } else {
      // Mark transaction as failed
      transaction.status = 'failed';
      transaction.failureReason = 'Payment verification failed';
      await transaction.save();

      return {
        verified: false,
        reason: "Payment verification failed"
      };
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    throw error;
  }
};

/**
 * Simulate Hedera transaction verification
 * In real implementation, this would query the Hedera network
 */
const simulateHederaVerification = async (transactionHash, expectedAmount) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // For demo purposes, simulate 80% success rate
  return Math.random() > 0.2;
};

/**
 * Update user's token balance
 */
const updateUserBalance = async (userId, amount) => {
  try {
    console.log(`💬 [updateUserBalance] Starting balance update for user: ${userId}, amount: ${amount}`);
    
    let tokenBalance = await TokenBalance.findOne({ userId });
    const previousBalance = tokenBalance ? tokenBalance.balance : 0;

    if (!tokenBalance) {
      console.log(`✨ [updateUserBalance] Creating new balance record for user: ${userId}, initial balance: ${amount}`);
      tokenBalance = new TokenBalance({
        userId,
        balance: amount,
        lastUpdated: new Date()
      });
    } else {
      tokenBalance.balance += amount;
      tokenBalance.lastUpdated = new Date();
      console.log(`📝 [updateUserBalance] Updated balance for user: ${userId}, previous: ${previousBalance}, amount added: ${amount}, new balance: ${tokenBalance.balance}`);
    }

    await tokenBalance.save();
    console.log(`✅ [updateUserBalance] Balance successfully saved for user: ${userId}, final balance: ${tokenBalance.balance}`);
    return tokenBalance.balance;
  } catch (error) {
    console.error(`❌ [updateUserBalance] Error updating user balance for user: ${userId}, amount: ${amount}, error:`, error);
    throw error;
  }
};

/**
 * Get user's transaction history
 */
const getUserTransactions = async (userId, options = {}) => {
  try {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const transactions = await TokenTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await TokenTransaction.countDocuments({ userId });
    const totalPages = Math.ceil(totalCount / limit);

    return {
      transactions,
      totalCount,
      currentPage: page,
      totalPages
    };
  } catch (error) {
    console.error("Error getting user transactions:", error);
    throw error;
  }
};

/**
 * Spend tokens for services
 */
const spendTokens = async (userId, spendData) => {
  try {
    const { amount, service, description, metadata } = spendData;
    console.log(`💳 [spendTokens] Initiating token spend for user: ${userId}, amount: ${amount}, service: ${service}`);

    // Check user balance
    const userBalance = await getUserBalance(userId);
    console.log(`💰 [spendTokens] Current balance for user: ${userId} is ${userBalance.balance} tokens`);
    
    if (userBalance.balance < amount) {
      console.error(`❌ [spendTokens] Insufficient balance for user: ${userId}. Required: ${amount}, Available: ${userBalance.balance}`);
      throw new Error("Insufficient token balance");
    }

    // Create spend transaction
    const transaction = new TokenTransaction({
      userId,
      type: 'spend',
      amount: -amount, // Negative for spending
      status: 'completed',
      description: description || `Spent tokens for ${service}`,
      metadata: {
        service,
        ...metadata
      },
      transactionId: uuidv4()
    });

    console.log(`📝 [spendTokens] Created spend transaction for user: ${userId}, transactionId: ${transaction.transactionId}, service: ${service}`);
    await transaction.save();
    console.log(`💾 [spendTokens] Transaction saved successfully, transactionId: ${transaction.transactionId}`);

    // Update balance
    const newBalance = await updateUserBalance(userId, -amount);
    console.log(`✅ [spendTokens] Token spend completed for user: ${userId}. Spent: ${amount}, New balance: ${newBalance}`);

    return {
      transaction: {
        id: transaction.transactionId,
        amount: transaction.amount,
        service: transaction.metadata.service,
        description: transaction.description,
        status: transaction.status
      },
      newBalance
    };
  } catch (error) {
    console.error(`❌ [spendTokens] Error spending tokens for user: ${userId}, amount: ${spendData.amount}, service: ${spendData.service}, error:`, error);
    throw error;
  }
};

/**
 * Get available pricing plans with real-time HBAR conversion
 */
const getPricingPlans = async () => {
  try {
    const pricingInfo = await hbarPricingService.getPricingInfo(
      PRICING_PLANS.map(plan => plan.priceUsd)
    );

    const plansWithHbar = PRICING_PLANS.map(plan => {
      const conversion = pricingInfo.conversions[plan.priceUsd];
      return {
        ...plan,
        hbarPrice: conversion.baseHbar,
        gasFeeHbar: conversion.gasFeeHbar,
        totalHbar: conversion.totalHbar,
        gasFeeUsd: conversion.gasFeeUsd,
        currentHbarRate: pricingInfo.hbarPrice,
        lastUpdated: pricingInfo.lastUpdated
      };
    });

    return {
      plans: plansWithHbar,
      taiToken: TAI_TOKEN_CONFIG,
      hbarPrice: pricingInfo.hbarPrice,
      lastUpdated: pricingInfo.lastUpdated
    };
  } catch (error) {
    console.error('Error getting pricing plans:', error);
    throw error;
  }
};

/**
 * Get legacy token packages (for backward compatibility)
 */
const getTokenPackages = async () => {
  return LEGACY_TOKEN_PACKAGES;
};

/**
 * Calculate TAI tokens for USD amount
 * This is a placeholder calculation - you may want to implement
 * your own logic for how many TAI tokens each plan provides
 */
const calculateTaiTokens = (usdAmount) => {
  // Example calculation: 1 USD = 1000 TAI tokens
  // You can modify this formula based on your tokenomics
  const tokensPerUsd = 1000;
  return Math.floor(usdAmount * tokensPerUsd);
};

module.exports = {
  getUserBalance,
  initiatePurchase,
  initiateTaiPurchase,
  verifyPayment,
  getUserTransactions,
  spendTokens,
  getTokenPackages,
  getPricingPlans,
  updateUserBalance,
  calculateTaiTokens,
  TAI_TOKEN_CONFIG,
  PRICING_PLANS,
  GAS_FEE_PERCENTAGE
};