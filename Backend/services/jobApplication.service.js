const JobApplication = require("../models/JobApplication.model");
const Profile = require("../models/Profile.model");
const Post = require("../models/Post.model");

// ========== CREATE ==========
module.exports.createJobApplication = async (applicationData) => {
  try {
    // Check if application already exists
    const existing = await JobApplication.findOne({
      profile: applicationData.profile,
      post: applicationData.post,
      isWithdrawn: false,
    });

    if (existing) {
      const error = new Error("Application already exists for this candidate and post");
      error.status = 409;
      throw error;
    }

    const application = await JobApplication.create(applicationData);

    // Populate references
    const populatedApplication = await JobApplication.findById(application._id)
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    return populatedApplication;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get all applications ==========
module.exports.getAllJobApplications = async (filters = {}, page = 1, limit = 10) => {
  try {
    const query = {};

    // Build filters
    if (filters.profile) query.profile = filters.profile;
    if (filters.post) query.post = filters.post;
    if (filters.company) query.company = filters.company;
    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;
    if (filters.isWithdrawn !== undefined) query.isWithdrawn = filters.isWithdrawn;

    // Search filter for candidate name or email
    if (filters.search) {
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get by ID ==========
module.exports.getJobApplicationById = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findById(applicationId)
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by candidate ==========
module.exports.getApplicationsByCandidate = async (profileId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!profileId) {
      const error = new Error("Profile ID is required");
      error.status = 400;
      throw error;
    }

    const query = { profile: profileId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by company and post ==========
module.exports.getApplicationsByPost = async (postId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!postId) {
      const error = new Error("Post ID is required");
      error.status = 400;
      throw error;
    }

    const query = { post: postId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    // Search filter for candidate name
    if (filters.search) {
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("profile")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get applications by company ==========
module.exports.getApplicationsByCompany = async (companyId, filters = {}, page = 1, limit = 10) => {
  try {
    if (!companyId) {
      const error = new Error("Company ID is required");
      error.status = 400;
      throw error;
    }

    const query = { company: companyId, isWithdrawn: false };

    if (filters.status) query.status = filters.status;
    if (filters.post) query.post = filters.post;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;

    // Search filter for candidate name
    if (filters.search) {
      const profileMatches = await Profile.find({
        $or: [
          { firstName: { $regex: filters.search, $options: "i" } },
          { lastName: { $regex: filters.search, $options: "i" } },
        ],
      }).select("_id");

      query.profile = { $in: profileMatches.map((p) => p._id) };
    }

    const skip = (page - 1) * limit;
    const totalCount = await JobApplication.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    const applications = await JobApplication.find(query)
      .populate("profile")
      .populate("post")
      .populate("cvAnalysis")
      .populate("interviewAssessment")
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: applications,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== UPDATE ==========
module.exports.updateJobApplication = async (applicationId, updateData) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    // Prevent updating core references
    delete updateData.profile;
    delete updateData.post;
    delete updateData.company;

    // Updates timestamps
    updateData.updatedAt = new Date();

    // Handle status-based fields
    if (updateData.status === "viewed" && !updateData.viewedAt) {
      updateData.viewedAt = new Date();
    }
    if (updateData.status === "shortlisted" && !updateData.shortlistedAt) {
      updateData.shortlistedAt = new Date();
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true, runValidators: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey")
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== SOFT DELETE / WITHDRAW ==========
module.exports.withdrawJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        isWithdrawn: true,
        withdrawnAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== ARCHIVE ==========
module.exports.archiveJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndUpdate(
      applicationId,
      {
        isArchived: true,
        updatedAt: new Date(),
      },
      { new: true }
    )
      .populate("profile")
      .populate("post")
      .populate("company", "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey");

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== DELETE ==========
module.exports.deleteJobApplication = async (applicationId) => {
  try {
    if (!applicationId) {
      const error = new Error("Application ID is required");
      error.status = 400;
      throw error;
    }

    const application = await JobApplication.findByIdAndDelete(applicationId);

    if (!application) {
      const error = new Error("Application not found");
      error.status = 404;
      throw error;
    }

    return application;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== STATISTICS ==========
module.exports.getApplicationStats = async (companyId, postId = null) => {
  try {
    if (!companyId) {
      const error = new Error("Company ID is required");
      error.status = 400;
      throw error;
    }

    const matchStage = { company: require("mongoose").Types.ObjectId(companyId) };
    if (postId) matchStage.post = require("mongoose").Types.ObjectId(postId);

    const stats = await JobApplication.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          appliedCount: {
            $sum: { $cond: [{ $eq: ["$status", "applied"] }, 1, 0] },
          },
          viewedCount: {
            $sum: { $cond: [{ $eq: ["$status", "viewed"] }, 1, 0] },
          },
          shortlistedCount: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
          interviewScheduledCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_scheduled"] }, 1, 0],
            },
          },
          interviewCompletedCount: {
            $sum: {
              $cond: [{ $eq: ["$status", "interview_completed"] }, 1, 0],
            },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          averageMatchScore: { $avg: "$matchScore" },
        },
      },
    ]);

    return stats[0] || {};
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};
