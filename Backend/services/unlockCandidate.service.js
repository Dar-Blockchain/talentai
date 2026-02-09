const UnlockCandidate = require("../models/UnlockCandidate.model");
const tokenService = require("./token.service");
const User = require("../models/User.model");
const Profile = require("../models/Profile.model");
const postPaymentService = require('./postPayment.service');

/**
 * Get all unlocked candidates by company
 */
const getUnlockedCandidatesByCompany = async (idCompany) => {
  try {
    // Populate idCandidate email and its profile (firstName, lastName, targetRole)
    const unlockedCandidates = await UnlockCandidate.find({ idCompany })
      .populate({
        path: 'idCandidate',
        select: 'email profile',
        populate: { path: 'profile', select: 'firstName lastName targetRole' }
      })
      .populate('idJob', 'title description')
      .sort({ createdAt: -1 });

    // Map to return only requested fields from candidate profile
    const result = unlockedCandidates.map((rec) => {
      const candidate = rec.idCandidate || {};
      const profile = candidate.profile || {};
      return {
        _id: rec._id,
        idCandidate: candidate._id || null,
        email: candidate.email || null,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        targetRole: profile.targetRole || null,
        idJob: rec.idJob || null,
        unlockPrice: rec.unlockPrice,
        transactionId: rec.transactionId,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      };
    });

    console.log("Unlocked candidates fetched:", result);

    return result;
  } catch (error) {
    console.error("Error getting unlocked candidates:", error);
    throw error;
  }
};

/**
 * Get all unlocked candidates by company with pagination
 */
const getUnlockedCandidatesByCompanyWithPagination = async (idCompany, page = 1, limit = 6) => {
  try {
    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100
    const skip = (pageNum - 1) * limitNum;

    // Get total count and candidates with pagination
    const [unlockedCandidates, total] = await Promise.all([
      UnlockCandidate.find({ idCompany })
        .populate({
          path: 'idCandidate',
          select: 'email profile',
          populate: { path: 'profile', select: 'firstName lastName targetRole' }
        })
        .populate('idJob', 'title description')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      UnlockCandidate.countDocuments({ idCompany })
    ]);

    // Map to return only requested fields from candidate profile
    const result = unlockedCandidates.map((rec) => {
      const candidate = rec.idCandidate || {};
      const profile = candidate.profile || {};
      return {
        _id: rec._id,
        idCandidate: candidate._id || null,
        email: candidate.email || null,
        firstName: profile.firstName || null,
        lastName: profile.lastName || null,
        targetRole: profile.targetRole || null,
        idJob: rec.idJob || null,
        unlockPrice: rec.unlockPrice,
        transactionId: rec.transactionId,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    console.log("Unlocked candidates fetched with pagination:", { page: pageNum, limit: limitNum, total });

    return {
      unlockedCandidates: result,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  } catch (error) {
    console.error("Error getting unlocked candidates with pagination:", error);
    throw error;
  }
};

/**
 * ========== CHECK CANDIDATE UNLOCK LIMIT ==========
 * Verify that company has not exceeded their plan limits
 * @param {ObjectId} idCompany - Company ID
 * @param {Number} candidateCount - Number of candidates to unlock
 * @returns {object} - { canUnlock: boolean, limitData: object }
 */
const checkCandidateUnlockLimit = async (idCompany, candidateCount) => {
  try {
    const userProfile = await Profile.findOne({ userId: idCompany }).populate('planLimits');

    if (!userProfile) {
      const error = new Error('User profile not found');
      error.status = 404;
      throw error;
    }

    // For non-company profiles, allow unlock (shouldn't happen, but safe)
    if (userProfile.type !== 'Company') {
      const error = new Error('Only company accounts can unlock candidates');
      error.status = 403;
      throw error;
    }

    if (!userProfile.planLimits) {
      const error = new Error('No plan assigned to your company. Please contact support to get a plan assigned');
      error.status = 403;
      throw error;
    }

    const unlocksUsed = userProfile.planUsage?.candidateUnlocksUsed || 0;
    const unlocksLimit = userProfile.planLimits.candidateUnlockLimit;

    console.log(`📊 [checkCandidateUnlockLimit] Used: ${unlocksUsed}/${unlocksLimit}, Requesting: ${candidateCount} candidates`);

    // Check if enough unlocks remaining
    if (unlocksUsed + candidateCount > unlocksLimit) {
      const remaining = Math.max(0, unlocksLimit - unlocksUsed);
      const error = new Error(`You have reached the maximum number of candidate unlocks (${unlocksLimit}) for your current plan: ${userProfile.planLimits.name}. You can unlock ${remaining} more candidate(s).`);
      error.status = 403;
      error.limitData = {
        planName: userProfile.planLimits.name,
        unlocksLimit: unlocksLimit,
        unlocksUsed: unlocksUsed,
        remaining: remaining,
        requested: candidateCount
      };
      throw error;
    }

    return {
      canUnlock: true,
      limitData: {
        planName: userProfile.planLimits.name,
        unlocksLimit: unlocksLimit,
        unlocksUsed: unlocksUsed,
        remaining: unlocksLimit - unlocksUsed - candidateCount,
        requested: candidateCount
      },
      userProfile
    };
  } catch (error) {
    console.error("Error checking candidate unlock limit:", error.message);
    throw error;
  }
};

/**
 * ========== INCREMENT CANDIDATE UNLOCKS USAGE ==========
 * Update the profile with incremented candidate unlocks count
 * @param {ObjectId} idCompany - Company ID
 * @param {Number} candidateCount - Number of candidates unlocked
 * @returns {object} - Updated profile
 */
const incrementCandidateUnlocksUsage = async (idCompany, candidateCount) => {
  try {
    const updateObj = {};
    updateObj['planUsage.candidateUnlocksUsed'] = candidateCount;

    const profile = await Profile.findOneAndUpdate(
      { userId: idCompany },
      { $inc: updateObj },
      { new: true }
    ).populate('planLimits');

    if (!profile) {
      throw new Error('Profile not found');
    }

    console.log(`✅ [incrementCandidateUnlocksUsage] Candidate unlocks incremented by ${candidateCount}. New value: ${profile.planUsage.candidateUnlocksUsed}`);

    return profile;
  } catch (error) {
    console.error('❌ Error incrementing candidate unlocks usage:', error);
    throw error;
  }
};

/**
 * Create unlock candidate record (single or pack)
 * @param {ObjectId} idCompany - Company ID
 * @param {Array} candidateIds - Array of candidate IDs (1 = single, 2-5 = pack)
 * @param {ObjectId} idJob - Job ID
 * @param {Number} price - Total price (5 for single, 25 for pack)
 */
const unlockCandidate = async (idCompany, candidateIds, idJob, price) => {
  try {
    // ========== STEP 1: CHECK UNLOCK LIMIT ==========
    const limitCheck = await checkCandidateUnlockLimit(idCompany, candidateIds.length);
    if (!limitCheck.canUnlock) {
      throw new Error('Cannot unlock candidates due to plan limit');
    }

    // ========== STEP 2: VALIDATE COMPANY ==========
    const company = await User.findById(idCompany);
    if (!company) {
      const error = new Error("Company not found");
      error.status = 404;
      throw error;
    }

    // ========== STEP 3: VALIDATE JOB ==========
    const job = await require("../models/Post.model").findById(idJob);
    if (!job) {
      const error = new Error("Job not found");
      error.status = 404;
      throw error;
    }

    // ========== STEP 4: VALIDATE CANDIDATES ==========
    if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
      throw new Error("candidateIds must be a non-empty array");
    }

    const candidates = await User.find({ _id: { $in: candidateIds } });
    if (candidates.length !== candidateIds.length) {
      throw new Error("One or more candidates not found");
    }

    // Compute per-candidate share
    const count = candidateIds.length;
    const perCandidateShare = Number((price / count).toFixed(8));

    // ========== STEP 5: PROCESS PAYMENT ==========
    const paymentResult = await postPaymentService.processPayment(
      company.hederaAccountId,
      company.hederaPrivateKey,
      price,
      idJob,
      company._id
    );

    const transactionId = paymentResult.transactionId;
    const unlockedRecords = [];

    // ========== STEP 6: CREATE UNLOCK RECORDS ==========
    for (const idCandidate of candidateIds) {
      // Check if already unlocked
      const existingUnlock = await UnlockCandidate.findOne({ idCompany, idCandidate });
      if (existingUnlock) {
        unlockedRecords.push(existingUnlock);
        continue;
      }

      const unlockRecord = new UnlockCandidate({
        idCompany,
        idCandidate,
        idJob,
        unlockPrice: perCandidateShare,
        transactionId
      });

      await unlockRecord.save();
      unlockedRecords.push(unlockRecord);
    }

    // ========== STEP 7: INCREMENT USAGE ==========
    const updatedProfile = await incrementCandidateUnlocksUsage(idCompany, count);

    return {
      success: true,
      message: `${count === 1 ? 'Single' : 'Pack'} unlock processed successfully (${count} candidate${count > 1 ? 's' : ''})`,
      data: unlockedRecords,
      totalPrice: price,
      pricePerCandidate: perCandidateShare,
      candidateCount: count,
      transactionId,
      planLimits: updatedProfile.planLimits
    };
  } catch (error) {
    console.error("Error creating unlock candidate:", error);
    throw error;
  }
};

/**
 * Get unlock record by ID
 */
const getUnlockById = async (unlockId) => {
  try {
    const unlockRecord = await UnlockCandidate.findById(unlockId)
      .populate('idCompany', 'firstName lastName email')
      .populate('idCandidate', 'firstName lastName email profileImage')
      .populate('idJob', 'title description')
      .populate('transactionId');

    return unlockRecord;
  } catch (error) {
    console.error("Error getting unlock record:", error);
    throw error;
  }
};

module.exports = {
  getUnlockedCandidatesByCompany,
  getUnlockedCandidatesByCompanyWithPagination,
  checkCandidateUnlockLimit,
  incrementCandidateUnlocksUsage,
  unlockCandidate,
  getUnlockById
};
