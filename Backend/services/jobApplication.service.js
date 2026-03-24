const JobApplication = require("../models/JobApplication.model");
const Profile = require("../models/Profile.model");
const Post = require("../models/Post.model");
const CVAnalysis = require("../models/CVAnalysis.model");
const { calculateMatchScore } = require("./MatchingService/matching.service");

// ========== CALCULATE MATCH SCORE (via AI Agent) ==========
const calculateApplicationMatchScore = async (profileId, postId, companyId) => {
  try {
    console.log("\n" + "=".repeat(80));
    console.log("📊 [MATCH SCORE ENGINE] - CALCULATING MATCH SCORE");
    console.log("=".repeat(80));
    console.log(`Profile ID: ${profileId}`);
    console.log(`Post ID: ${postId}`);
    console.log(`Company ID: ${companyId}`);

    // Fetch candidate profile with all skills data
    console.log(`\n🔍 Step 1: Fetching candidate profile...`);
    const profile = await Profile.findById(profileId).populate(
      "userId",
      "firstName lastName email",
    );
    if (!profile) {
      console.warn(`❌ Profile not found: ${profileId}`);
      return 0;
    }
    console.log(
      `✅ Profile loaded: ${profile.firstName || "Unknown"} ${profile.lastName || ""}`,
    );
    console.log(`   └─ Technical Skills: ${profile.skills?.length || 0} found`);
    if (profile.skills && profile.skills.length > 0) {
      console.log(
        `      Skills: ${profile.skills.map((s) => `${s.name} (Lvl: ${s.Levelconfirmed})`).join(", ")}`,
      );
    }
    console.log(`   └─ Soft Skills: ${profile.softSkills?.length || 0} found`);
    console.log(
      `   └─ Salary Expectation: ${profile.expectedSalary?.min}-${profile.expectedSalary?.max} ${profile.expectedSalary?.currency}`,
    );
    console.log(
      `   └─ Work Mode Preference: ${profile.workModePreference || "Not specified"}`,
    );
    console.log(
      `   └─ Contract Type: ${profile.preferredContractType || "Not specified"}`,
    );

    // Fetch job post with skill requirements
    console.log(`\n🔍 Step 2: Fetching job post...`);
    const post = await Post.findById(postId).populate("skillAnalysis");
    if (!post) {
      console.warn(`❌ Post not found: ${postId}`);
      return 0;
    }
    console.log(
      `✅ Job post loaded: "${post.jobDetails?.title || "Untitled"}"`,
    );
    console.log(
      `   └─ Required Skills: ${post.skillAnalysis?.requiredSkills?.length || 0} found`,
    );
    if (post.skillAnalysis && post.skillAnalysis.requiredSkills) {
      console.log(
        `      Skills: ${post.skillAnalysis.requiredSkills.map((s) => `${s.name} (Lvl: ${s.level}, Weight: ${s.percentage}%)`).join(", ")}`,
      );
    }
    console.log(
      `   └─ Soft Skills Required: ${post.skillAnalysis?.softSkills?.length || 0}`,
    );
    console.log(
      `   └─ Salary Offered: ${post.jobDetails?.salary?.min}-${post.jobDetails?.salary?.max} ${post.jobDetails?.salary?.currency}`,
    );
    console.log(
      `   └─ Work Mode: ${post.jobDetails?.workMode || "Not specified"}`,
    );
    console.log(
      `   └─ Employment Type: ${post.jobDetails?.employmentType || "Not specified"}`,
    );

    // Extract job skills from post skillAnalysis
    const jobSkills = post.skillAnalysis?.requiredSkills || [];
    const jobDetails = {
      title: post.jobDetails?.title,
      description: post.jobDetails?.description,
      skillAnalysis: post.skillAnalysis,
      salary: post.jobDetails?.salary,
      location: post.jobDetails?.location,
      workMode: post.jobDetails?.workMode,
      employmentType: post.jobDetails?.employmentType,
    };

    // Extract candidate skills from profile
    const candidateSkills = profile.skills || [];
    const candidateProfile = {
      _id: profile._id,
      userId: profile.userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      softSkills: profile.softSkills || [],
      expectedSalary: profile.expectedSalary,
      workModePreference: profile.workModePreference,
      preferredContractType: profile.preferredContractType,
    };

    // Get matching configuration (if exists)
    console.log(`\n🔍 Step 3: Loading matching configuration...`);
    const MatchingConfig = require("../models/MatchingConfig.model");
    const matchingConfig = await MatchingConfig.findOne({ company: companyId });
    const configData = matchingConfig || { weights: {} };
    console.log(
      `✅ Matching config loaded${matchingConfig ? " (custom weights)" : " (default weights)"}`,
    );
    const weights = configData.weights || {};
    console.log(`   └─ Hard Skills Weight: ${weights.hardSkill || 50}%`);
    console.log(`   └─ Soft Skills Weight: ${weights.SoftSkill || 10}%`);
    console.log(`   └─ Experience Weight: ${weights.experience || 10}%`);
    console.log(`   └─ Salary Weight: ${weights.salary || 10}%`);
    console.log(`   └─ Work Mode Weight: ${weights.workMode || 10}%`);
    console.log(`   └─ Contract Weight: ${weights.contract || 10}%`);

    // Calculate match score using AI matching algorithm
    console.log(`\n🔍 Step 4: Running AI matching algorithm...`);
    console.log(`   This algorithm will:`);
    console.log(`   1. Compare technical skills (levels and weights)`);
    console.log(`   2. Match soft skills presence`);
    console.log(`   3. Assess experience alignment`);
    console.log(`   4. Evaluate salary compatibility`);
    console.log(`   5. Check work mode preferences`);
    console.log(`   6. Verify contract type match`);

    const matchResult = await calculateMatchScore(
      jobSkills,
      candidateSkills,
      jobDetails,
      candidateProfile,
      companyId,
      configData,
    );

    const score = matchResult?.score || 0;
    console.log(`\n✅ [MATCH SCORE CALCULATED]`);
    console.log(
      `   Candidate: ${candidateProfile.firstName} ${candidateProfile.lastName}`,
    );
    console.log(`   Job: "${post.title}"`);
    console.log(`   Final Match Score: ${score}/100`);
    if (matchResult?.unlocked) {
      console.log(`   Status: 🔓 UNLOCKED CANDIDATE`);
    }
    console.log("=".repeat(80) + "\n");

    return score;
  } catch (error) {
    console.error(
      `❌ [MATCH SCORE ERROR] Error calculating match score:`,
      error,
    );
    console.error("Stack trace:", error.stack);
    return 0; // Return 0 if calculation fails
  }
};

// ========== CREATE ==========
module.exports.createJobApplication = async (applicationData) => {
  try {
    // Remove matchScore from applicationData if provided (it will be calculated)
    const { matchScore: _, ...cleanData } = applicationData;

    // Check if application already exists
    const existing = await JobApplication.findOne({
      profile: cleanData.profile,
      post: cleanData.post,
      isWithdrawn: false,
    });

    if (existing) {
      const error = new Error(
        "Application already exists for this candidate and post",
      );
      error.status = 409;
      throw error;
    }

    // Calculate match score automatically using AI matching
    const calculatedMatchScore = await calculateApplicationMatchScore(
      cleanData.profile,
      cleanData.post,
      cleanData.company,
    );

    // Add calculated match score to application data
    cleanData.matchScore = calculatedMatchScore;
    cleanData.status = "applied";

    const application = await JobApplication.create(cleanData);

    // Populate references
    const populatedApplication = await JobApplication.findById(application._id)
      .populate("profile")
      .populate("post")
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      )
      .populate("cvAnalysis")
      .populate("interviewAssessment");

    return populatedApplication;
  } catch (error) {
    error.status = error.status || 500;
    throw error;
  }
};

// ========== READ - Get all applications ==========
module.exports.getAllJobApplications = async (
  filters = {},
  page = 1,
  limit = 10,
) => {
  try {
    const query = {};

    // Build filters
    if (filters.profile) query.profile = filters.profile;
    if (filters.post) query.post = filters.post;
    if (filters.company) query.company = filters.company;
    if (filters.status) query.status = filters.status;
    if (filters.isArchived !== undefined) query.isArchived = filters.isArchived;
    if (filters.isWithdrawn !== undefined)
      query.isWithdrawn = filters.isWithdrawn;

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
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      )
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
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      )
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
module.exports.getApplicationsByCandidate = async (
  profileId,
  filters = {},
  page = 1,
  limit = 10,
) => {
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
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      )
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
module.exports.getApplicationsByPost = async (
  postId,
  filters = {},
  page = 1,
  limit = 10,
) => {
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
module.exports.getApplicationsByCompany = async (
  companyId,
  filters = {},
  page = 1,
  limit = 10,
) => {
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
      { new: true, runValidators: true },
    )
      .populate("profile")
      .populate("post")
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      )
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
      { new: true },
    )
      .populate("profile")
      .populate("post")
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      );

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
      { new: true },
    )
      .populate("profile")
      .populate("post")
      .populate(
        "company",
        "-authHistory -notifications -hederaAccountId -hederaPrivateKey -hederaPublicKey",
      );

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

    const matchStage = {
      company: require("mongoose").Types.ObjectId(companyId),
    };
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
