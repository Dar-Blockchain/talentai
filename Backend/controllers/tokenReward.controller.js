/**
 * Token Reward Controller
 * Handles HTTP endpoints for interview reward distribution
 */

const interviewRewardService = require("../services/interviewRewardService");
const User = require("../models/UserModel");

/**
 * Distribute interview reward to candidate
 * Called automatically after interview completion or manually via claim endpoint
 *
 * @param {string} userId - Candidate's user ID
 * @param {number} score - Interview score (0-100)
 * @param {string} interviewId - Interview details ID
 * @returns {Promise<Object>} Reward distribution result
 */
exports.distributeInterviewReward = async (userId, score, interviewId) => {
  try {
    console.log(
      `🎁 [TokenRewardController] Distributing reward for user ${userId}, score: ${score}`,
    );

    // Validate inputs
    if (!userId || !score === undefined || !interviewId) {
      throw new Error(
        "Missing required parameters: userId, score, or interviewId",
      );
    }

    // Distribute reward using service
    const result = await interviewRewardService.distributeInterviewReward(
      userId,
      score,
      interviewId,
    );

    return result;
  } catch (error) {
    console.error(
      "❌ [TokenRewardController] Error distributing reward:",
      error.message,
    );
    throw error;
  }
};

/**
 * Manual claim reward endpoint (POST /interview-details/:id/claim-reward)
 * Allows candidate to retry claiming reward if auto-claim failed
 */
exports.claimInterviewReward = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user._id;

    console.log(
      `🎯 [TokenRewardController] Manual claim request for interview ${interviewId} by user ${userId}`,
    );

    // Import InterviewDetails model here to avoid circular dependency
    const InterviewDetails = require("../models/InterviewDetailsModel");

    // Get interview details
    const interview = await InterviewDetails.findById(interviewId);

    if (!interview) {
      console.log(
        `❌ [TokenRewardController] Interview not found: ${interviewId}`,
      );
      return res.status(404).json({
        success: false,
        error: "Interview not found",
      });
    }

    // Verify ownership
    if (interview.candidate.toString() !== userId.toString()) {
      console.log(
        `⛔ [TokenRewardController] Unauthorized claim attempt by user ${userId} for interview ${interviewId}`,
      );
      return res.status(403).json({
        success: false,
        error: "Not authorized to claim this reward",
      });
    }

    console.log(`✅ [TokenRewardController] Interview ownership verified`);

    // Check if reward already claimed
    const claimStatus = await interviewRewardService.checkRewardClaimed(
      userId,
      interviewId,
    );

    if (claimStatus.claimed) {
      console.log(`⚠️  [TokenRewardController] Reward already claimed`);
      return res.status(400).json({
        success: false,
        error: "Reward already claimed for this interview",
        transaction: claimStatus.transaction,
      });
    }

    console.log(
      `✅ [TokenRewardController] No existing claim found - proceeding with distribution`,
    );

    // Distribute reward
    const rewardResult = await interviewRewardService.distributeInterviewReward(
      userId,
      interview.overallScore,
      interviewId,
    );

    if (rewardResult.success) {
      console.log(
        `🎉 [TokenRewardController] Manual claim successful: ${rewardResult.amount} TAI`,
      );
      res.status(200).json({
        success: true,
        message: "Reward claimed successfully",
        reward: rewardResult,
      });
    } else {
      console.log(
        `❌ [TokenRewardController] Manual claim failed: ${rewardResult.error}`,
      );
      res.status(400).json({
        success: false,
        error: rewardResult.error,
        canRetry: rewardResult.canRetry,
        requiresWallet: rewardResult.requiresWallet,
      });
    }
  } catch (error) {
    console.error(
      "❌ [TokenRewardController] Error in manual claim:",
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "Internal server error while claiming reward",
      message: error.message,
    });
  }
};

/**
 * Get reward estimate for a given score
 * GET /tokens/reward-estimate?score=75
 */
exports.getRewardEstimate = async (req, res) => {
  try {
    const { score } = req.query;

    if (!score) {
      return res.status(400).json({
        success: false,
        error: "Score parameter is required",
      });
    }

    const scoreNumber = parseFloat(score);

    if (isNaN(scoreNumber) || scoreNumber < 0 || scoreNumber > 100) {
      return res.status(400).json({
        success: false,
        error: "Score must be a number between 0 and 100",
      });
    }

    const estimate = interviewRewardService.getRewardEstimate(scoreNumber);

    res.status(200).json({
      success: true,
      estimate,
    });
  } catch (error) {
    console.error(
      "❌ [TokenRewardController] Error getting reward estimate:",
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * Check reward claim status for an interview
 * GET /interview-details/:id/reward-status
 */
exports.checkRewardStatus = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user._id;

    const status = await interviewRewardService.checkRewardClaimed(
      userId,
      interviewId,
    );

    res.status(200).json({
      success: true,
      interviewId,
      userId,
      ...status,
    });
  } catch (error) {
    console.error(
      "❌ [TokenRewardController] Error checking reward status:",
      error.message,
    );
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

module.exports = exports;
