/**
 * CV Analysis Service
 * Manages CV analysis data operations and business logic
 */

const CVAnalysis = require("../models/CVAnalysis.model");
const Profile = require("../models/Profile.model");

class CVAnalysisService {
  /**
   * Validate CV analysis data
   */
  static validateCVData(data) {
    const { name, email, phone, location, title, summary } = data;

    if (!name || !email) {
      throw {
        status: 400,
        message: "Name and email are required fields.",
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw {
        status: 400,
        message: "Invalid email format.",
      };
    }

    return data;
  }

  /**
   * Calculate analysis score based on CV completeness
   */
  static calculateAnalysisScore(data) {
    let score = 0;
    let totalPoints = 0;

    // Personal information (20 points)
    totalPoints += 20;
    if (data.name && data.email) score += 10;
    if (data.phone && data.location) score += 10;

    // Professional summary (20 points)
    totalPoints += 20;
    if (data.title) score += 10;
    if (data.summary && data.summary.length > 50) score += 10;

    // Career information (15 points)
    totalPoints += 15;
    if (data.yearsOfExperience >= 0) score += 10;
    if (data.seniority && data.seniority !== "Entry-Level") score += 5;

    // Skills (15 points)
    totalPoints += 15;
    if (data.skills && data.skills.length > 0) {
      score += Math.min(15, data.skills.length * 1.5);
    }

    // Education (15 points)
    totalPoints += 15;
    if (data.education && data.education.length > 0) {
      score += Math.min(15, data.education.length * 7.5);
    }

    // Experience (15 points)
    totalPoints += 15;
    if (data.experience && data.experience.length > 0) {
      score += Math.min(15, data.experience.length * 5);
    }

    return Math.round((score / totalPoints) * 100);
  }

  /**
   * Create a new CV analysis record
   * @param {Object} cvData - CV analysis data
   * @param {string} profileId - Profile ID to associate with CV analysis
   * @returns {Promise<Object>} Created CV analysis record
   */
  static async createCVAnalysis(cvData, profileId = null) {
    try {
      // Validate input
      this.validateCVData(cvData);

      // Calculate analysis score
      const analysisScore = this.calculateAnalysisScore(cvData);

      // Create new record
      const cvAnalysis = new CVAnalysis({
        ...cvData,
        analysisScore,
        analysisStatus: "completed",
        profile: profileId,
      });

      await cvAnalysis.save();

      // Add CV analysis to Profile's cvAnalyses array if profileId is provided
      if (profileId) {
        await Profile.findByIdAndUpdate(
          profileId,
          { $push: { cvAnalyses: cvAnalysis._id } },
          { new: true }
        );
      }

      return {
        success: true,
        data: cvAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analysis by ID
   * @param {string} id - CV analysis ID
   * @returns {Promise<Object>} CV analysis record
   */
  static async getCVAnalysisById(id) {
    try {
      const cvAnalysis = await CVAnalysis.findById(id)
        .populate("profile")
        .exec();

      if (!cvAnalysis) {
        throw {
          status: 404,
          message: "CV analysis not found.",
        };
      }

      return {
        success: true,
        data: cvAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all CV analyses with pagination
   * @param {Object} options - Query options (page, limit, filter)
   * @returns {Promise<Object>} Paginated CV analyses
   */
  static async getAllCVAnalyses(options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      // Build query filter
      const filter = {};
      if (options.seniority) filter.seniority = options.seniority;
      if (options.search) {
        filter.$or = [
          { name: { $regex: options.search, $options: "i" } },
          { email: { $regex: options.search, $options: "i" } },
          { title: { $regex: options.search, $options: "i" } },
        ];
      }
      if (options.minScore)
        filter.analysisScore = { $gte: parseInt(options.minScore) };

      const total = await CVAnalysis.countDocuments(filter);
      const cvAnalyses = await CVAnalysis.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update CV analysis by ID
   * @param {string} id - CV analysis ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated CV analysis record
   */
  static async updateCVAnalysis(id, updateData) {
    try {
      // Validate email if being updated
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          throw {
            status: 400,
            message: "Invalid email format.",
          };
        }
      }

      // Recalculate score if relevant data changed
      let updateObject = { ...updateData };
      const original = await CVAnalysis.findById(id);
      if (!original) {
        throw {
          status: 404,
          message: "CV analysis not found.",
        };
      }

      const mergedData = { ...original.toObject(), ...updateData };
      updateObject.analysisScore = this.calculateAnalysisScore(mergedData);
      updateObject.updatedAt = Date.now();

      const cvAnalysis = await CVAnalysis.findByIdAndUpdate(id, updateObject, {
        new: true,
        runValidators: true,
      });

      return {
        success: true,
        data: cvAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete CV analysis by ID
   * @param {string} id - CV analysis ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  static async deleteCVAnalysis(id) {
    try {
      const cvAnalysis = await CVAnalysis.findByIdAndDelete(id);

      if (!cvAnalysis) {
        throw {
          status: 404,
          message: "CV analysis not found.",
        };
      }

      // Remove CV analysis from Profile's cvAnalyses array if associated
      if (cvAnalysis.profile) {
        await Profile.findByIdAndUpdate(
          cvAnalysis.profile,
          { $pull: { cvAnalyses: id } },
          { new: true }
        );
      }

      return {
        success: true,
        message: "CV analysis deleted successfully.",
        data: cvAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analyses by User ID
   * @param {string} userId - User ID
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} User's CV analyses
   */
  static async getCVAnalysesByUserId(userId, options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      const total = await CVAnalysis.countDocuments({ User: userId });
      const cvAnalyses = await CVAnalysis.find({ User: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analyses by Company ID
   * @param {string} companyId - Company ID
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} Company's CV analyses
   */
  static async getCVAnalysesByCompanyId(companyId, options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      const total = await CVAnalysis.countDocuments({ Company: companyId });
      const cvAnalyses = await CVAnalysis.find({ Company: companyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search CV analyses
   * @param {string} query - Search query
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} Search results
   */
  static async searchCVAnalyses(query, options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      const searchFilter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
          { title: { $regex: query, $options: "i" } },
          { summary: { $regex: query, $options: "i" } },
          { skills: { $in: [new RegExp(query, "i")] } },
        ],
      };

      const total = await CVAnalysis.countDocuments(searchFilter);
      const cvAnalyses = await CVAnalysis.find(searchFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analyses by seniority level
   * @param {string} seniority - Seniority level
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} CV analyses by seniority
   */
  static async getCVAnalysesBySeniority(seniority, options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      const total = await CVAnalysis.countDocuments({ seniority });
      const cvAnalyses = await CVAnalysis.find({ seniority })
        .populate("profile")
        .sort({ analysisScore: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analysis statistics
   * @returns {Promise<Object>} Statistics
   */
  static async getCVAnalysisStats() {
    try {
      const totalRecords = await CVAnalysis.countDocuments();
      const avgScore = await CVAnalysis.aggregate([
        { $group: { _id: null, avgScore: { $avg: "$analysisScore" } } },
      ]);

      const seniorityDistribution = await CVAnalysis.aggregate([
        { $group: { _id: "$seniority", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]);

      const topSkills = await CVAnalysis.aggregate([
        { $unwind: "$skills" },
        { $group: { _id: "$skills", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]);

      return {
        success: true,
        data: {
          totalRecords,
          avgAnalysisScore: avgScore[0]?.avgScore || 0,
          seniorityDistribution,
          topSkills,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get CV analyses by Profile ID
   * @param {string} profileId - Profile ID
   * @param {Object} options - Query options (page, limit)
   * @returns {Promise<Object>} Profile's CV analyses
   */
  static async getCVAnalysesByProfileId(profileId, options = {}) {
    try {
      const page = Math.max(0, options.page || 0);
      const limit = Math.min(options.limit || 10, 100);
      const skip = page * limit;

      const total = await CVAnalysis.countDocuments({ profile: profileId });
      const cvAnalyses = await CVAnalysis.find({ profile: profileId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      return {
        success: true,
        data: cvAnalyses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Associate CV analysis with a Profile
   * @param {string} cvAnalysisId - CV Analysis ID
   * @param {string} profileId - Profile ID to associate
   * @returns {Promise<Object>} Updated CV analysis
   */
  static async associateCVAnalysisWithProfile(cvAnalysisId, profileId) {
    try {
      // Update CV analysis to add profile reference
      const cvAnalysis = await CVAnalysis.findByIdAndUpdate(
        cvAnalysisId,
        { profile: profileId },
        { new: true }
      );

      if (!cvAnalysis) {
        throw {
          status: 404,
          message: "CV analysis not found.",
        };
      }

      // Add CV analysis to Profile's cvAnalyses array
      await Profile.findByIdAndUpdate(
        profileId,
        { $addToSet: { cvAnalyses: cvAnalysisId } },
        { new: true }
      );

      return {
        success: true,
        message: "CV analysis associated with profile successfully.",
        data: cvAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Disassociate CV analysis from a Profile
   * @param {string} cvAnalysisId - CV Analysis ID
   * @returns {Promise<Object>} Updated CV analysis
   */
  static async disassociateCVAnalysisFromProfile(cvAnalysisId) {
    try {
      // Get CV analysis to find profile
      const cvAnalysis = await CVAnalysis.findById(cvAnalysisId);

      if (!cvAnalysis) {
        throw {
          status: 404,
          message: "CV analysis not found.",
        };
      }

      const profileId = cvAnalysis.profile;

      // Update CV analysis to remove profile reference
      const updatedCVAnalysis = await CVAnalysis.findByIdAndUpdate(
        cvAnalysisId,
        { $unset: { profile: 1 } },
        { new: true }
      );

      // Remove CV analysis from Profile's cvAnalyses array
      if (profileId) {
        await Profile.findByIdAndUpdate(
          profileId,
          { $pull: { cvAnalyses: cvAnalysisId } },
          { new: true }
        );
      }

      return {
        success: true,
        message: "CV analysis disassociated from profile successfully.",
        data: updatedCVAnalysis,
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CVAnalysisService;
