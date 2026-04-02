const jobApplicationService = require("../services/jobApplication.service");
const { sendInterviewInvitation } = require("../utils/email-service");

// Centralized error handler
const handleError = (res, error, defaultStatus = 500) => {
  console.error("JobApplication error:", error?.message || error);
  const status = error?.status || defaultStatus;
  res.status(status).json({
    success: false,
    error: error?.message || "Internal server error",
  });
};

// ========== CREATE ==========
module.exports.createJobApplication = async (req, res) => {
  try {
    console.log("\n" + "=".repeat(80));
    console.log("🚀 [JOB APPLICATION] - STARTING CREATE JOB APPLICATION PROCESS");
    console.log("=".repeat(80));

    const userId = req.user._id;
    const { post: postId } = req.body;

    console.log(`📝 Request received from user: ${userId}`);
    console.log(`📋 Post ID: ${postId}`);

    // Validation: only post is required
    if (!postId) {
      console.error("❌ Validation failed: Missing postId");
      return res.status(400).json({
        success: false,
        error: "Missing required field: post (postId)",
      });
    }

    // Get candidate profile from current user
    const Profile = require("../models/Profile.model");
    console.log(`🔍 Fetching candidate profile for user: ${userId}`);
    const profile = await Profile.findOne({ userId }).populate("cvAnalyses");
    if (!profile) {
      console.error(`❌ Candidate profile not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found for current user",
      });
    }
    console.log(`✅ Candidate profile found: ${profile.firstName} ${profile.lastName}`);
    console.log(`   - Profile ID: ${profile._id}`);
    console.log(`   - Technical Skills: ${profile.skills?.length || 0} skills`);
    console.log(`   - Soft Skills: ${profile.softSkills?.length || 0} skills`);

    // Extract cvAnalysis from profile (use the most recent one)
    const cvAnalysis = profile.cvAnalyses && profile.cvAnalyses.length > 0 
      ? profile.cvAnalyses[profile.cvAnalyses.length - 1]._id 
      : null;
    console.log(`📄 CV Analysis: ${cvAnalysis ? "Found (ID: " + cvAnalysis + ")" : "Not available"}`);

    // Get post and extract company from it
    const Post = require("../models/Post.model");
    console.log(`\n🔍 Fetching job post: ${postId}`);
    const post = await Post.findById(postId);
    if (!post) {
      console.error(`❌ Job post not found: ${postId}`);
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }
    console.log(`✅ Job post found: "${post.jobDetails?.title || 'Untitled'}"`);
    console.log(`   - Company ID: ${post.user}`);
    console.log(`   - Required Skills: ${post.skillAnalysis?.requiredSkills?.length || 0} skills`);
    console.log(`   - Soft Skills Required: ${post.skillAnalysis?.softSkills?.length || 0} skills`);

    const company = post.user; // Company is the user who created the post

    const applicationData = {
      profile: profile._id,
      post: postId,
      company,
      cvAnalysis: cvAnalysis,
      // matchScore will be calculated automatically - DO NOT SET IT HERE
    };

    console.log(`\n📊 [MATCH SCORE CALCULATION]`);
    console.log(`   This will use an AI-powered matching algorithm that considers:`);
    console.log(`   1️⃣  HARD SKILLS (50%) - Technical skills match`);
    console.log(`        └─ Comparing: ${profile.skills?.length || 0} candidate skills vs ${post.skillAnalysis?.requiredSkills?.length || 0} required skills`);
    console.log(`   2️⃣  SOFT SKILLS (10%) - Behavioral skills match`);
    console.log(`        └─ Comparing: ${profile.softSkills?.length || 0} candidate soft skills vs ${post.skillAnalysis?.softSkills?.length || 0} required soft skills`);
    console.log(`   3️⃣  EXPERIENCE (10%) - Professional experience alignment`);
    console.log(`        └─ Based on skill levels and years of experience`);
    console.log(`   4️⃣  SALARY (10%) - Compensation alignment`);
    console.log(`        └─ Job range: ${post.jobDetails?.salary?.min}-${post.jobDetails?.salary?.max} ${post.jobDetails?.salary?.currency}`);
    console.log(`        └─ Candidate expectation: ${profile.expectedSalary?.min}-${profile.expectedSalary?.max} ${profile.expectedSalary?.currency}`);
    console.log(`   5️⃣  WORK MODE (10%) - Work location/mode match`);
    console.log(`        └─ Job: ${post.jobDetails?.workMode || "Not specified"} | Candidate preference: ${profile.workModePreference || "Not specified"}`);
    console.log(`   6️⃣  CONTRACT TYPE (10%) - Employment type match`);
    console.log(`        └─ Job: ${post.jobDetails?.employmentType || "Not specified"} | Candidate preference: ${profile.preferredContractType || "Not specified"}`);
    console.log(`\n   ⚙️  Processing with jobApplicationService.createJobApplication()...`);

    const application = await jobApplicationService.createJobApplication(
      applicationData
    );

    console.log(`\n✅ [SUCCESS] Job application created!`);
    console.log(`   - Application ID: ${application._id}`);
    console.log(`   - Match Score: ${application.matchScore}/100`);
    console.log(`   - Status: ${application.status}`);
    console.log("=".repeat(80) + "\n");

    res.status(201).json({
      success: true,
      message: "Job application created successfully (match score calculated by AI)",
      data: application,
    });
  } catch (error) {
    console.error(`\n❌ [ERROR] Error in createJobApplication: ${error.message}`);
    console.error("Stack trace:", error.stack);
    console.log("=".repeat(80) + "\n");
    handleError(res, error, 400);
  }
};

// ========== READ - Get all applications ==========
module.exports.getAllJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, profile, post, company, status } = req.query;

    const filters = {};
    if (profile) filters.profile = profile;
    if (post) filters.post = post;
    if (company) filters.company = company;
    if (status) filters.status = status;

    const result = await jobApplicationService.getAllJobApplications(
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get by ID ==========
module.exports.getJobApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.getJobApplicationById(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application retrieved successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by candidate ==========
module.exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const { page = 1, limit = 10, status, isArchived } = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "Candidate ID is required",
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (isArchived !== undefined) filters.isArchived = isArchived === "true";

    // Find profile for this user
    const Profile = require("../models/Profile.model");
    const profile = await Profile.findOne({ userId: candidateId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    const result = await jobApplicationService.getApplicationsByCandidate(
      profile._id,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by post ==========
module.exports.getApplicationsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 10, status, search } = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error: "Post ID is required",
      });
    }

    const filters = {};
    if (status) filters.status = status;
    if (search) filters.search = search;

    const result = await jobApplicationService.getApplicationsByPost(
      postId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by company ==========
module.exports.getApplicationsByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { page = 1, limit = 10, post, postId, status, search, candidateName, skill, skills } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const { scoreMin, scoreMax, dateFrom, dateTo } = req.query;

    const filters = {};
    if (post || postId) filters.post = post || postId;
    if (search) filters.search = search;
    if (candidateName) filters.candidateName = candidateName;
    const skillParam = skill || skills;
    if (skillParam) filters.skills = Array.isArray(skillParam) ? skillParam : [skillParam];
    if (scoreMin !== undefined) filters.scoreMin = parseFloat(scoreMin);
    if (scoreMax !== undefined) filters.scoreMax = parseFloat(scoreMax);
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    const result = await jobApplicationService.getApplicationsByCompany(
      companyId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    res.status(200).json({
      success: true,
      message: "Job applications retrieved successfully",
      data: result.data,
      pagination: {
        currentPage: result.currentPage,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== UPDATE ==========
module.exports.updateJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updateData = req.body;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.updateJobApplication(
      applicationId,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Job application updated successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== WITHDRAW APPLICATION ==========
module.exports.withdrawJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.withdrawJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application withdrawn successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== ARCHIVE APPLICATION ==========
module.exports.archiveJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.archiveJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application archived successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== DELETE ==========
module.exports.deleteJobApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    if (!applicationId) {
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    const application = await jobApplicationService.deleteJobApplication(
      applicationId
    );

    res.status(200).json({
      success: true,
      message: "Job application deleted successfully",
      data: application,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== GET STATISTICS ==========
module.exports.getApplicationStats = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const stats = await jobApplicationService.getApplicationStats(
      companyId,
      postId || null
    );

    res.status(200).json({
      success: true,
      message: "Application statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== GET METRICS ==========
module.exports.getApplicationMetrics = async (req, res) => {
  try {
    const companyId = req.user._id;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const metrics = await jobApplicationService.getApplicationMetrics(companyId);

    res.status(200).json({
      success: true,
      message: "Application metrics retrieved successfully",
      data: metrics,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== SEND INTERVIEW INVITATION EMAIL ==========
module.exports.inviteToInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { interviewDate, interviewTime, interviewLink } = req.body;
    const companyId = req.user._id;

    console.log("\n" + "=".repeat(80));
    console.log("🚀 [JOB APPLICATION] - STARTING INTERVIEW INVITATION PROCESS");
    console.log("=".repeat(80));

    // Validation
    if (!applicationId) {
      console.error("❌ Validation failed: Missing applicationId");
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }

    console.log(`📝 Request from company: ${companyId}`);
    console.log(`📋 Application ID: ${applicationId}`);

    // Fetch the job application
    console.log(`🔍 Fetching job application: ${applicationId}`);
    const application = await jobApplicationService.getJobApplicationById(applicationId);

    if (!application) {
      console.error(`❌ Job application not found: ${applicationId}`);
      return res.status(404).json({
        success: false,
        error: "Job application not found",
      });
    }

    console.log(`✅ Job application found`);
    console.log(`   - Candidate Profile ID: ${application.profile._id}`);
    console.log(`   - Post ID: ${application.post._id}`);
    console.log(`   - Status: ${application.status}`);

    // Verify that the current user is the company that owns this post
    if (application.company._id.toString() !== companyId.toString()) {
      console.error(`❌ Unauthorized: User ${application.company._id} is not the  owner of this application`);
      console.error(`❌ Unauthorized: User ${companyId} is not the owner of this post`);
      return res.status(403).json({
        success: false,
        error: "You are not authorized to send interview invitations for this application",
      });
    }

    // Fetch candidate profile to get email
    const Profile = require("../models/Profile.model");
    console.log(`🔍 Fetching candidate profile: ${application.profile._id}`);
    const candidateProfile = await Profile.findById(application.profile._id).populate("userId");

    if (!candidateProfile) {
      console.error(`❌ Candidate profile not found: ${application.profile._id}`);
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    const candidateEmail = candidateProfile.userId.email;
    const candidateName = `${candidateProfile.firstName} ${candidateProfile.lastName}`;

    console.log(`✅ Candidate profile found`);
    console.log(`   - Email: ${candidateEmail}`);
    console.log(`   - Name: ${candidateName}`);

    // Fetch post details
    const Post = require("../models/Post.model");
    console.log(`🔍 Fetching job post: ${application.post._id}`);
    const post = await Post.findById(application.post._id).populate("user");

    if (!post) {
      console.error(`❌ Job post not found: ${application.post._id}`);
      return res.status(404).json({
        success: false,
        error: "Job post not found",
      });
    }

    const jobTitle = post.jobDetails?.title || "Position";
    const companyName = post.user?.username || "Our Company";

    console.log(`✅ Job post found`);
    console.log(`   - Title: ${jobTitle}`);
    console.log(`   - Company: ${companyName}`);

    // Send interview invitation email
    console.log(`📧 Sending interview invitation email...`);
    const emailSent = await sendInterviewInvitation(
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
      interviewDate || null,
      interviewTime || null,
      interviewLink || null
    );

    if (!emailSent) {
      console.error(`❌ Failed to send interview invitation email`);
      return res.status(500).json({
        success: false,
        error: "Failed to send interview invitation email",
      });
    }

    console.log(`✅ Interview invitation email sent successfully`);

    // Update application status to "interview_scheduled" if interview date is provided
    if (interviewDate) {
      console.log(`📝 Updating application status to interview_scheduled`);
      application.status = "interview_scheduled";
      application.updatedAt = new Date();
      await application.save();
      console.log(`✅ Application status updated`);
    }

    console.log("=".repeat(80) + "\n");

    res.status(200).json({
      success: true,
      message: "Interview invitation sent successfully",
      data: {
        applicationId: application._id,
        candidateEmail,
        candidateName,
        jobTitle,
        interviewDate: interviewDate || null,
        interviewTime: interviewTime || null,
        interviewLink: interviewLink || null,
      },
    });
  } catch (error) {
    console.error(`\n❌ [ERROR] Error in inviteToInterview: ${error.message}`);
    console.error("Stack trace:", error.stack);
    console.log("=".repeat(80) + "\n");
    handleError(res, error, 400);
  }
};
