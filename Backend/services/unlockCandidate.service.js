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
 * Orchestrates the entire unlock process:
 *   1. Check plan limits (canUnlock)
 *   2. Validate entities (company, job, candidates)
 *   3. Calculate pricing per candidate
 *   4. Process payment
 *   5. Create unlock records
 *   6. Increment usage counter
 *   7. Return success response
 *
 * @param {ObjectId} idCompany - Company ID
 * @param {Array} candidateIds - Array of candidate IDs (1 = single, 2-5 = pack)
 * @param {ObjectId} idJob - Job ID
 * @param {Number} price - Total price
 * @returns {Promise<{success, message, data, totalPrice, pricePerCandidate, candidateCount, transactionId, planLimits}>}
 */
const unlockCandidate = async (idCompany, candidateIds, idJob, price) => {
  try {
    const candidateCount = candidateIds.length;

    // ========== STEP 1: CHECK UNLOCK LIMIT ==========
    const limitCheck = await checkCandidateUnlockLimit(idCompany, candidateCount);
    if (!limitCheck.canUnlock) {
      throw new Error('Cannot unlock candidates due to plan limit');
    }

    // ========== STEP 2: VALIDATE ENTITIES ==========
    const { company, job } = await validateUnlockEntities(idCompany, idJob, candidateIds);

    // ========== STEP 3: CALCULATE PRICING ==========
    const perCandidateShare = Number((price / candidateCount).toFixed(8));

    // ========== STEP 4: PROCESS PAYMENT (commented out - free during beta) ==========
    // const transactionId = await processUnlockPayment(company, price, idJob);
    const transactionId = `FREE_BETA_${idJob}_${Date.now()}`;

    // ========== STEP 5: CREATE UNLOCK RECORDS ==========
    const unlockedRecords = await createUnlockRecords(idCompany, candidateIds, idJob, perCandidateShare, transactionId);

    // ========== STEP 6: INCREMENT USAGE ==========
    const updatedProfile = await incrementCandidateUnlocksUsage(idCompany, candidateCount);

    // ========== STEP 7: BUILD & RETURN RESPONSE ==========
    return buildUnlockSuccessResponse(candidateCount, unlockedRecords, price, perCandidateShare, transactionId, updatedProfile.planLimits);
  } catch (error) {
    console.error("Error in unlockCandidate:", error.message);
    throw error;
  }
};

/**
 * Validate company, job, and candidate entities exist
 * @param {ObjectId} idCompany - Company ID
 * @param {ObjectId} idJob - Job ID
 * @param {Array} candidateIds - Candidate IDs to validate
 * @returns {Promise<{company, job}>}
 * @throws {Error} if any validation fails
 */
async function validateUnlockEntities(idCompany, idJob, candidateIds) {
  // Validate company
  const company = await User.findById(idCompany);
  if (!company) {
    const error = new Error("Company not found");
    error.status = 404;
    throw error;
  }

  // Validate job
  const Post = require("../models/Post.model");
  const job = await Post.findById(idJob);
  if (!job) {
    const error = new Error("Job not found");
    error.status = 404;
    throw error;
  }

  // Validate candidate IDs array
  if (!Array.isArray(candidateIds) || candidateIds.length === 0) {
    throw new Error("candidateIds must be a non-empty array");
  }

  // Validate all candidates exist
  const candidates = await User.find({ _id: { $in: candidateIds } });
  if (candidates.length !== candidateIds.length) {
    throw new Error("One or more candidates not found");
  }

  return { company, job };
}

/**
 * Process payment for candidate unlock
 * @param {Object} company - Company object with Hedera credentials
 * @param {Number} price - Total price to charge
 * @param {ObjectId} idJob - Job ID for payment context
 * @returns {Promise<String>} - Transaction ID
 */
async function processUnlockPayment(company, price, idJob) {
  const paymentResult = await postPaymentService.processPayment(
    company.hederaAccountId,
    company.hederaPrivateKey,
    price,
    idJob,
    company._id
  );
  return paymentResult.transactionId;
}

/**
 * Create unlock records for each candidate
 * Checks if candidate is already unlocked and skips if so
 * @param {ObjectId} idCompany - Company ID
 * @param {Array} candidateIds - Candidate IDs to unlock
 * @param {ObjectId} idJob - Job ID
 * @param {Number} pricePerCandidate - Price per candidate
 * @param {String} transactionId - Payment transaction ID
 * @returns {Promise<Array>} - Array of created unlock records
 */
async function createUnlockRecords(idCompany, candidateIds, idJob, pricePerCandidate, transactionId) {
  const unlockedRecords = [];

  for (const idCandidate of candidateIds) {
    // Skip if already unlocked by this company for this candidate
    const existingUnlock = await UnlockCandidate.findOne({ idCompany, idCandidate });
    if (existingUnlock) {
      unlockedRecords.push(existingUnlock);
      continue;
    }

    // Create new unlock record
    const unlockRecord = new UnlockCandidate({
      idCompany,
      idCandidate,
      idJob,
      unlockPrice: pricePerCandidate,
      transactionId
    });

    await unlockRecord.save();
    unlockedRecords.push(unlockRecord);
  }

  return unlockedRecords;
}

/**
 * Build unlock success response
 * @param {Number} candidateCount - Total candidates unlocked
 * @param {Array} unlockedRecords - Unlock records created
 * @param {Number} totalPrice - Total amount charged
 * @param {Number} pricePerCandidate - Price per candidate
 * @param {String} transactionId - Payment transaction ID
 * @param {Object} planLimits - User plan limits
 * @returns {Object} - Formatted success response
 */
function buildUnlockSuccessResponse(candidateCount, unlockedRecords, totalPrice, pricePerCandidate, transactionId, planLimits) {
  const isPackUnlock = candidateCount > 1;
  const unlockedType = isPackUnlock ? 'Pack' : 'Single';
  const candidateText = candidateCount > 1 ? 's' : '';

  return {
    success: true,
    message: `${unlockedType} unlock processed successfully (${candidateCount} candidate${candidateText})`,
    data: unlockedRecords,
    totalPrice: totalPrice,
    pricePerCandidate: pricePerCandidate,
    candidateCount: candidateCount,
    transactionId: transactionId,
    planLimits: planLimits
  };
}

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
