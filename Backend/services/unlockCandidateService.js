const UnlockCandidate = require("../models/UnlockCandidateModel");
const tokenService = require("../services/tokenService");
const User = require("../models/UserModel");

/**
 * Get all unlocked candidates by company
 */
const getUnlockedCandidatesByCompany = async (idCompany) => {
  try {
    const unlockedCandidates = await UnlockCandidate.find({ idCompany })
      .populate('idCandidate', 'firstName lastName email profileImage')
      .populate('idJob', 'title description')
      .populate('transactionId', 'transactionId amount status')
      .sort({ createdAt: -1 });


    return unlockedCandidates;
  } catch (error) {
    console.error("Error getting unlocked candidates:", error);
    throw error;
  }
};

/**
 * Get all unlock candidates by company (including pending)
 */
const getUnlockCandidatesByCompany = async (idCompany) => {
  try {
    const unlockRecords = await UnlockCandidate.find({ idCompany })
      .populate('idCandidate', 'firstName lastName email profileImage')
      .populate('idJob', 'title description')
      .populate('transactionId', 'transactionId amount status')
      .sort({ createdAt: -1 });

    return unlockRecords;
  } catch (error) {
    console.error("Error getting unlock candidates:", error);
    throw error;
  }
};

/**
 * Create unlock candidate record
 */
const unlockCandidate = async (idCompany, idCandidate, idJob, unlockPrice) => {
  try {
    // Validate company exists
    const company = await User.findById(idCompany);
    if (!company) {
      throw new Error("Company not found");
    }

    // Validate candidate exists
    const candidate = await User.findById(idCandidate);
    if (!candidate) {
      throw new Error("Candidate not found");
    }

    // Validate Job exists
    const job = await require("../models/PostModel").findById(idJob);
    if (!job) {
      throw new Error("Job not found");
    }

    // Check if already unlocked
    const existingUnlock = await UnlockCandidate.findOne({
      idCompany,
      idCandidate,
    });

    if (existingUnlock) {
      return {
        success: false,
        message: "Candidate already unlocked for this Company",
        data: existingUnlock
      };
    }

    const result = await tokenService.spendTokens(idCompany, {
      amount : unlockPrice,
      service : "Unlock Candidate",
      description : `Unlocking candidate ${idCandidate} for job ${idJob}`,
      metadata : { unlockCandidate: true, idCandidate, idJob }
    });

    const transactionId = result.transaction.id; // Initially null since not paid yet

    // Create unlock record
    const unlockRecord = new UnlockCandidate({
      idCompany,
      idCandidate,
      idJob,
      unlockPrice,
    transactionId
    });

    await unlockRecord.save();

    return {
      success: true,
      message: "Unlock candidate record created",
      data: unlockRecord
    };
  } catch (error) {
    console.error("Error creating unlock candidate:", error);
    throw error;
  }
};

/**
 * Complete unlock after payment
 */
const completeUnlock = async (unlockId, transactionId) => {
  try {
    const unlockRecord = await UnlockCandidate.findById(unlockId);
    if (!unlockRecord) {
      throw new Error("Unlock record not found");
    }

    unlockRecord.transactionId = transactionId;
    unlockRecord.updatedAt = new Date();

    await unlockRecord.save();

    return unlockRecord;
  } catch (error) {
    console.error("Error completing unlock:", error);
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
  getUnlockCandidatesByCompany,
  unlockCandidate,
  completeUnlock,
  getUnlockById
};
