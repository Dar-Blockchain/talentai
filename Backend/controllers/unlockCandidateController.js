const unlockCandidateService = require("../services/unlockCandidateService");

/**
 * Get all unlocked candidates by company
 */
module.exports.getUnlockedCandidatesByCompany = async (req, res) => {
  try {
    const idCompany = req.user._id;

    const unlockedCandidates = await unlockCandidateService.getUnlockedCandidatesByCompany(idCompany);

    res.status(200).json({
      success: true,
      message: "Unlocked candidates retrieved successfully",
      data: unlockedCandidates
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
 * Get all unlock candidates by company (including pending)
 */
module.exports.getUnlockCandidatesByCompany = async (req, res) => {
  try {
    const idCompany = req.user._id;

    const unlockRecords = await unlockCandidateService.getUnlockCandidatesByCompany(idCompany);

    res.status(200).json({
      success: true,
      message: "Unlock candidates retrieved successfully",
      data: unlockRecords
    });
  } catch (error) {
    console.error("Error getting unlock candidates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get unlock candidates",
      error: error.message
    });
  }
};

/**
 * Create unlock candidate record
 */
module.exports.unlockCandidate = async (req, res) => {
  try {
    const idCompany = req.user._id;
    const { idCandidate, idJob } = req.body;

    const unlockPrice = 5; // Example fixed price, could be dynamic

    // Validate required fields
    if (!idCandidate || !idJob || unlockPrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: idCandidate, idJob, unlockPrice"
      });
    }

    if (unlockPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Unlock price cannot be negative"
      });
    }

    const result = await unlockCandidateService.unlockCandidate(
      idCompany,
      idCandidate,
      idJob,
      unlockPrice
    );

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
 * Complete unlock after payment
 */
module.exports.completeUnlock = async (req, res) => {
  try {
    const { unlockId, transactionId } = req.body;

    if (!unlockId || !transactionId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: unlockId, transactionId"
      });
    }

    const unlockRecord = await unlockCandidateService.completeUnlock(unlockId, transactionId);

    res.status(200).json({
      success: true,
      message: "Unlock completed successfully",
      data: unlockRecord
    });
  } catch (error) {
    console.error("Error completing unlock:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete unlock",
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
