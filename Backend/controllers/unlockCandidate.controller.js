const unlockCandidateService = require("../services/unlockCandidate.service");
const Profile = require("../models/Profile.model");
const profileService = require("../services/ProfileService/profile.service");

/**
 * Get all unlocked candidates by company with pagination
 */
module.exports.getUnlockedCandidatesByCompany = async (req, res) => {
  try {
    const idCompany = req.user._id;
    const {
      page = 1,
      limit = 6,
    } = req.query;

    // Parse and validate pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10))); // Cap limit at 100

    const result = await unlockCandidateService.getUnlockedCandidatesByCompanyWithPagination(
      idCompany,
      pageNum,
      limitNum
    );

    res.status(200).json({
      success: true,
      message: "Unlocked candidates retrieved successfully",
      results: result.unlockedCandidates,
      total: result.pagination.total,
      page: result.pagination.page,
      limit: result.pagination.limit,
      totalPages: result.pagination.totalPages,
      hasNextPage: result.pagination.hasNextPage,
      hasPrevPage: result.pagination.hasPrevPage,
    });
  } catch (error) {
    console.error("Error getting unlocked candidates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unlocked candidates",
      error: error.message
    });
  }
};

/**
 * Create unlock candidate record (single or pack)
 * Body:
 *   Single (1 candidate): { candidateIds: ["id"], idJob: "jobId" } → 5 tokens
 *   Pack (2-5 candidates): { candidateIds: ["id1", "id2", ...], idJob: "jobId" } → 25 tokens
 */
module.exports.unlockCandidate = async (req, res) => {
  try {
    const idCompany = req.user._id;
    const { idJob, candidateIds } = req.body;

    const PACK_SIZE = 5;
    const SINGLE_PRICE = 5;
    const PACK_PRICE = 500;

    // Validate required fields
    if (!idJob) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: idJob"
      });
    }

    if (!candidateIds || !Array.isArray(candidateIds)) {
      return res.status(400).json({
        success: false,
        message: "Missing required field: candidateIds (must be an array)"
      });
    }

    if (candidateIds.length < 1 || candidateIds.length > PACK_SIZE) {
      return res.status(400).json({
        success: false,
        message: `candidateIds must contain between 1 and ${PACK_SIZE} candidates. Received ${candidateIds.length}`
      });
    }

    // ========== CHECK CANDIDATE UNLOCK LIMIT ==========
    const userProfile = await Profile.findOne({ userId: idCompany }).populate('planLimits');

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // For companies, check candidate unlock limit
    if (userProfile.type === 'Company') {
      if (!userProfile.planLimits) {
        return res.status(403).json({
          success: false,
          error: 'No plan assigned to your company',
          message: 'Please contact support to get a plan assigned'
        });
      }

      const unlocksUsed = userProfile.planUsage?.candidateUnlocksUsed || 0;
      const unlocksLimit = userProfile.planLimits.candidateUnlockLimit;
      const candidatesCount = candidateIds.length;

      console.log(`📊 [unlockCandidate] Unlock check - Used: ${unlocksUsed}/${unlocksLimit}, Requesting: ${candidatesCount} candidates`);

      // Check if enough unlocks remaining
      if (unlocksUsed + candidatesCount > unlocksLimit) {
        const remaining = Math.max(0, unlocksLimit - unlocksUsed);
        return res.status(403).json({
          success: false,
          error: 'Candidate unlock limit reached',
          message: `You have reached the maximum number of candidate unlocks (${unlocksLimit}) for your current plan: ${userProfile.planLimits.name}. You can unlock ${remaining} more candidate(s).`,
          planName: userProfile.planLimits.name,
          unlocksLimit: unlocksLimit,
          unlocksUsed: unlocksUsed,
          remaining: remaining,
          requested: candidatesCount
        });
      }
    }

    // Determine flow: single (1 candidate) or pack (2-5 candidates)
    const isPack = candidateIds.length > 1;
    const price = isPack ? PACK_PRICE : SINGLE_PRICE;

    // Call service with unified interface
    const result = await unlockCandidateService.unlockCandidate(
      idCompany,
      candidateIds,
      idJob,
      price,
      { pack: isPack }
    );

    // ========== INCREMENT CANDIDATE UNLOCKS USAGE ==========
    if (userProfile.type === 'Company') {
      try {
        const candidatesCount = candidateIds.length;
        // Increment by the number of candidates being unlocked
        userProfile.planUsage.candidateUnlocksUsed = (userProfile.planUsage?.candidateUnlocksUsed || 0) + candidatesCount;
        await userProfile.save();
        console.log(`✅ [unlockCandidate] Candidate unlocks usage incremented by ${candidatesCount} to ${userProfile.planUsage.candidateUnlocksUsed}`);
      } catch (usageError) {
        console.error('⚠️ [unlockCandidate] Warning: Could not update candidate unlocks usage:', usageError.message);
        // Don't fail unlock if usage update fails
      }
    }

    const statusCode = result.success ? 201 : 400;
    res.status(statusCode).json(result);
  } catch (error) {
    console.error("Error creating unlock candidate:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create unlock candidate",
      error: error.message
    });
  }
};

/**
 * Get unlock record by ID
 */
module.exports.getUnlockById = async (req, res) => {
  try {
    const { unlockId } = req.params;

    if (!unlockId) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: unlockId"
      });
    }

    const unlockRecord = await unlockCandidateService.getUnlockById(unlockId);

    if (!unlockRecord) {
      return res.status(404).json({
        success: false,
        message: "Unlock record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Unlock record retrieved successfully",
      data: unlockRecord
    });
  } catch (error) {
    console.error("Error getting unlock record:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unlock record",
      error: error.message
    });
  }
};
