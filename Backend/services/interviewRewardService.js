/**
 * Interview Reward Service
 * Calculates and distributes TAI token rewards for completed interviews
 */

const taiTokenDistributionService = require('./taiTokenDistributionService');
const TokenTransaction = require('../models/TokenTransactionModel');
const User = require('../models/UserModel');

// ============================================================================
// REWARD POOL CONFIGURATION (MVP Settings)
// ============================================================================

const REWARD_POOL = 5000; // Total TAI tokens in the reward pool
const MAX_CANDIDATES = 150; // Expected maximum number of candidates
const MAX_SCORE = 100; // Maximum score a candidate can achieve
const PER_CANDIDATE_ALLOCATION = REWARD_POOL / MAX_CANDIDATES; // 33.33 TAI per candidate

console.log('💰 Interview Reward Service Configuration:');
console.log(`   Reward Pool: ${REWARD_POOL} TAI`);
console.log(`   Max Candidates: ${MAX_CANDIDATES}`);
console.log(`   Per-Candidate Allocation: ${PER_CANDIDATE_ALLOCATION.toFixed(2)} TAI`);

// ============================================================================
// REWARD CALCULATION
// ============================================================================

/**
 * Calculate TAI token reward based on interview score
 * Formula: (Individual_Score / Max_Score) × Per_Candidate_Allocation
 *
 * Examples:
 *   - Score 100 → (100/100) × 33.33 = 33.33 TAI
 *   - Score 80  → (80/100) × 33.33 = 26.67 TAI
 *   - Score 50  → (50/100) × 33.33 = 16.67 TAI
 *   - Score 0   → (0/100) × 33.33 = 0 TAI
 *
 * @param {number} score - Interview score (0-100)
 * @returns {number} Reward amount in TAI tokens
 */
function calculateReward(score) {
  // Validate score
  if (typeof score !== 'number' || isNaN(score)) {
    console.warn(`⚠️  Invalid score value: ${score}, defaulting to 0`);
    return 0;
  }

  // Clamp score to valid range (0-100)
  if (score < 0) {
    console.warn(`⚠️  Score ${score} is negative, using 0`);
    score = 0;
  }

  if (score > MAX_SCORE) {
    console.warn(`⚠️  Score ${score} exceeds maximum (${MAX_SCORE}), capping at max`);
    score = MAX_SCORE;
  }

  // Calculate proportional reward
  const reward = (score / MAX_SCORE) * PER_CANDIDATE_ALLOCATION;

  console.log(`📊 Reward Calculation: Score ${score}/100 → ${reward.toFixed(2)} TAI`);

  return reward;
}

// ============================================================================
// REWARD DISTRIBUTION
// ============================================================================

/**
 * Distribute interview reward to candidate
 * @param {string} userId - Candidate's user ID (MongoDB ObjectId)
 * @param {number} score - Interview score
 * @param {string} interviewId - Interview details ID (for tracking)
 * @returns {Promise<Object>} Reward distribution result
 */
async function distributeInterviewReward(userId, score, interviewId) {
  try {
    console.log('🎁 ================================================================');
    console.log('🎁 STARTING INTERVIEW REWARD DISTRIBUTION');
    console.log('🎁 ================================================================');
    console.log(`👤 User ID: ${userId}`);
    console.log(`📊 Score: ${score}/100`);
    console.log(`📋 Interview ID: ${interviewId}`);

    // ========================================
    // STEP 1: Calculate reward amount
    // ========================================
    const rewardAmount = calculateReward(score);

    if (rewardAmount === 0) {
      console.log('⚠️  Reward amount is 0 TAI - no tokens will be distributed');
      return {
        success: true,
        skipped: true,
        amount: 0,
        reason: 'Score is 0, no reward to distribute',
        userId,
        score,
        interviewId
      };
    }

    console.log(`💰 Calculated reward: ${rewardAmount.toFixed(2)} TAI`);

    // ========================================
    // STEP 2: Check if reward already claimed
    // ========================================
    console.log('🔍 Checking if reward already claimed for this interview...');
    const existingReward = await TokenTransaction.findOne({
      userId,
      'metadata.interviewId': interviewId,
      type: 'interview_reward',
      status: 'completed'
    });

    if (existingReward) {
      console.log('⚠️  Reward already claimed for this interview');
      return {
        success: false,
        error: 'Reward already claimed for this interview',
        existingTransaction: existingReward._id,
        amount: existingReward.amount,
        userId,
        score,
        interviewId
      };
    }

    console.log('✅ No existing reward found - proceeding with distribution');

    // ========================================
    // STEP 3: Get user's Hedera account
    // ========================================
    console.log('🔍 Fetching user Hedera account information...');
    const user = await User.findById(userId);

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    if (!user.hederaAccountId) {
      console.log('❌ User has no Hedera account - cannot distribute reward');
      return {
        success: false,
        error: 'User has no Hedera wallet connected',
        canRetry: false,
        requiresWallet: true,
        amount: rewardAmount,
        userId,
        score,
        interviewId
      };
    }

    console.log(`✅ Hedera Account: ${user.hederaAccountId}`);

    // ========================================
    // STEP 4: Transfer tokens from admin wallet
    // ========================================
    console.log('💸 Initiating token transfer from admin wallet...');

    const transferResult = await taiTokenDistributionService.transferTokensToUser(
      user.hederaAccountId,
      rewardAmount,
      `Interview Reward - Score: ${score}/100`
    );

    console.log('✅ Token transfer successful:', transferResult);

    // ========================================
    // STEP 5: Record transaction in database
    // ========================================
    console.log('💾 Recording transaction in database...');

    const transaction = new TokenTransaction({
      userId,
      type: 'interview_reward',
      amount: rewardAmount,
      status: 'completed',
      transactionHash: transferResult.transactionId,
      metadata: {
        interviewId,
        score,
        hederaTransactionId: transferResult.transactionId,
        hederaAccountId: user.hederaAccountId,
        rewardPool: REWARD_POOL,
        maxCandidates: MAX_CANDIDATES,
        perCandidateAllocation: PER_CANDIDATE_ALLOCATION,
        calculationFormula: `(${score}/${MAX_SCORE}) × ${PER_CANDIDATE_ALLOCATION.toFixed(2)} = ${rewardAmount.toFixed(2)} TAI`,
        timestamp: new Date().toISOString()
      }
    });

    await transaction.save();
    console.log(`✅ Transaction recorded: ${transaction._id}`);

    // ========================================
    // STEP 6: Return success result
    // ========================================
    console.log('🎉 ================================================================');
    console.log('🎉 REWARD DISTRIBUTION COMPLETED SUCCESSFULLY');
    console.log('🎉 ================================================================');
    console.log(`💰 Amount: ${rewardAmount.toFixed(2)} TAI`);
    console.log(`📝 Transaction ID: ${transferResult.transactionId}`);
    console.log(`🆔 Database Record: ${transaction._id}`);

    return {
      success: true,
      amount: rewardAmount,
      transactionId: transferResult.transactionId,
      hederaAccountId: user.hederaAccountId,
      databaseTransactionId: transaction._id,
      score,
      userId,
      interviewId,
      memo: transferResult.memo
    };

  } catch (error) {
    console.error('❌ ================================================================');
    console.error('❌ REWARD DISTRIBUTION FAILED');
    console.error('❌ ================================================================');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    // Determine if this is a retryable error
    const isRetryable =
      !error.message.includes('already claimed') &&
      !error.message.includes('no Hedera wallet');

    return {
      success: false,
      error: error.message,
      canRetry: isRetryable,
      userId,
      score,
      interviewId,
      errorDetails: {
        name: error.name,
        message: error.message,
        code: error.code
      }
    };
  }
}

/**
 * Get reward calculation info without distributing
 * @param {number} score - Interview score
 * @returns {Object} Reward calculation details
 */
function getRewardEstimate(score) {
  const amount = calculateReward(score);

  return {
    score,
    estimatedReward: amount,
    formula: `(${score}/${MAX_SCORE}) × ${PER_CANDIDATE_ALLOCATION.toFixed(2)} = ${amount.toFixed(2)} TAI`,
    rewardPool: REWARD_POOL,
    maxCandidates: MAX_CANDIDATES,
    perCandidateAllocation: PER_CANDIDATE_ALLOCATION,
    maxPossibleReward: PER_CANDIDATE_ALLOCATION
  };
}

/**
 * Check if interview reward has been claimed
 * @param {string} userId - User ID
 * @param {string} interviewId - Interview ID
 * @returns {Promise<Object>} Claim status
 */
async function checkRewardClaimed(userId, interviewId) {
  const transaction = await TokenTransaction.findOne({
    userId,
    'metadata.interviewId': interviewId,
    type: 'interview_reward',
    status: 'completed'
  });

  return {
    claimed: !!transaction,
    transaction: transaction || null
  };
}

module.exports = {
  calculateReward,
  distributeInterviewReward,
  getRewardEstimate,
  checkRewardClaimed,
  // Export constants for reference
  REWARD_POOL,
  MAX_CANDIDATES,
  MAX_SCORE,
  PER_CANDIDATE_ALLOCATION
};
