const UnlockCandidate = require("../models/UnlockCandidateModel");
const tokenService = require("../services/tokenService");
const User = require("../models/UserModel");
const postPaymentService = require('../services/postPaymentService');

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

        // Process payment
        const paymentResult = await postPaymentService.processPayment(
          company.hederaAccountId,
          company.hederaPrivateKey,
          unlockPrice,
          idJob,
          company._id
        );
    

    // const result = await tokenService.spendTokens(idCompany, {
    //   amount : unlockPrice,
    //   service : "Unlock Candidate",
    //   description : `Unlocking candidate ${idCandidate} for job ${idJob}`,
    //   metadata : { unlockCandidate: true, idCandidate, idJob }
    // });

    const transactionId = paymentResult.transactionId; // Initially null since not paid yet

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
 * Unlock candidate pack (5 candidates for 25 tokens)
 */
const unlockCandidatePack = async (idCompany, candidateIds, idJob, packPrice) => {
  try {
    const unlockedRecords = [];

    // Create an unlock record for each candidate in the pack
    for (const idCandidate of candidateIds) {
      // Validate candidate and job exist
      const [candidateExists, jobExists] = await Promise.all([
        User.findById(idCandidate),
        User.findById(idJob) // Assuming idJob is a job ID reference
      ]);

      if (!candidateExists) {
        throw new Error(`Candidate ${idCandidate} not found`);
      }

      if (!jobExists) {
        throw new Error(`Job ${idJob} not found`);
      }

      // Create unlock record for this candidate
      const unlockRecord = new UnlockCandidate({
        idCompany,
        idCandidate,
        idJob,
        unlockPrice: packPrice, // Same price for all candidates in pack
        status: 'pending'
      });

      await unlockRecord.save();
      unlockedRecords.push(unlockRecord);
    }

    return {
      success: true,
      message: `Pack of ${unlockedRecords.length} candidates created successfully`,
      data: unlockedRecords,
      packPrice: packPrice,
      packSize: unlockedRecords.length
    };
  } catch (error) {
    console.error("Error creating unlock candidate pack:", error);
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
  getUnlockedCandidatesByCompanyWithPagination,
  getUnlockCandidatesByCompany,
  unlockCandidate,
  unlockCandidatePack,
  completeUnlock,
  getUnlockById
};
