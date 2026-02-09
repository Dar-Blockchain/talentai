const unlockCandidateService = require("../services/unlockCandidate.service");

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

// ========== CONSTANTS ==========
const UNLOCK_PRICING = {
  PACK_SIZE: 5,
  SINGLE_PRICE: 5,
  PACK_PRICE: 500
};

/**
 * Create unlock candidate record (single or pack)
 * Body:
 *   Single (1 candidate): { candidateIds: ["id"], idJob: "jobId" } → 5 tokens
 *   Pack (2-5 candidates): { candidateIds: ["id1", "id2", ...], idJob: "jobId" } → 500 tokens
 */
module.exports.unlockCandidate = async (req, res) => {
  try {
    // ========== 1. EXTRACT INPUT ==========
    const idCompany = req.user._id;
    const { idJob, candidateIds } = req.body;

    // ========== 2. VALIDATE INPUT ==========
    validateUnlockInput(idJob, candidateIds);

    // ========== 3. DETERMINE PRICING ==========
    const price = determinePricing(candidateIds.length);

    // ========== 4. CALL SERVICE ==========
    const result = await unlockCandidateService.unlockCandidate(
      idCompany,
      candidateIds,
      idJob,
      price
    );

    // ========== 5. RETURN SUCCESS ==========
    res.status(201).json(result);
  } catch (error) {
    // ========== 6. ERROR HANDLING ==========
    handleUnlockError(res, error);
  }
};

/**
 * Validate unlock candidate input
 * @throws {Error} if validation fails
 */
function validateUnlockInput(idJob, candidateIds) {
  if (!idJob) {
    const error = new Error("Missing required field: idJob");
    error.status = 400;
    throw error;
  }

  if (!candidateIds || !Array.isArray(candidateIds)) {
    const error = new Error("Missing required field: candidateIds (must be an array)");
    error.status = 400;
    throw error;
  }

  if (candidateIds.length < 1 || candidateIds.length > UNLOCK_PRICING.PACK_SIZE) {
    const error = new Error(
      `candidateIds must contain between 1 and ${UNLOCK_PRICING.PACK_SIZE} candidates. Received ${candidateIds.length}`
    );
    error.status = 400;
    throw error;
  }
}

/**
 * Determine pricing based on candidate count
 * @param {Number} candidateCount - Number of candidates to unlock
 * @returns {Number} - Total price
 */
function determinePricing(candidateCount) {
  const isPack = candidateCount > 1;
  return isPack ? UNLOCK_PRICING.PACK_PRICE : UNLOCK_PRICING.SINGLE_PRICE;
}

/**
 * Handle unlock candidate errors
 * @param {Object} res - Response object
 * @param {Error} error - Error object
 */
function handleUnlockError(res, error) {
  console.error("Error in unlockCandidate:", error);

  // Handle limit exceeded errors (403)
  if (error.status === 403) {
    return res.status(403).json({
      success: false,
      error: error.message,
      ...error.limitData
    });
  }

  // Handle validation errors (400)
  if (error.status === 400) {
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Handle not found errors (404)
  if (error.status === 404) {
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }

  // Handle all other errors (500)
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: "Failed to create unlock candidate",
    error: error.message
  });
}

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
