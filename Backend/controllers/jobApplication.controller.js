const jobApplicationService = require("../services/jobApplication.service");
const { sendInterviewInvitation, sendCandidateEmail } = require("../utils/email-service");
const profileService = require("../services/ProfileService/profile.service");
const postService = require("../services/PosteServices/post.service");
const JobApplication = require("../models/jobApplication.model");
const Profile = require("../models/Profile.model");

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

    // Early check: has this user already applied to this post (via any of their profiles)?
    const userProfiles = await Profile.find({ userId }).select("_id").lean();
    if (userProfiles.length > 0) {
      const existingApp = await JobApplication.findOne({
        profile: { $in: userProfiles.map(p => p._id) },
        post: postId,
      });
      if (existingApp) {
        return res.status(409).json({ success: false, error: "You have already applied for this job." });
      }
    }

    // Get candidate profile from current user
    console.log(`🔍 Fetching candidate profile for user: ${userId}`);
    const profileResult = await profileService.getProfileByUserId(userId);
    const profile = profileResult.profile;
    if (profile) {
      await profile.populate("cvAnalyses");
    }
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
    console.log(`\n🔍 Fetching job post: ${postId}`);
    const post = await postService.getPostById(postId);
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
    const profileResult = await profileService.getProfileByUserId(candidateId);
    const profile = profileResult.profile;

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
    console.log(`🔍 Fetching job post: ${application.post._id}`);
    const post = await postService.getPostById(application.post._id);

    if (!post) {
      console.error(`❌ Job post not found: ${application.post._id}`);
      return res.status(404).json({
        success: false,
        error: "Job post not found",
      });
    }

    const jobTitle = post.jobDetails?.title || "Position";

    // Prefer the company's registered name over the login username
    const companyProfile = await Profile.findOne({ userId: post.user._id }).select("companyDetails").lean();
    const companyName = companyProfile?.companyDetails?.name || post.user?.username || "Our Company";

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

// ========== TRIGGER AUTO INVITE (FOR TESTING) ==========
module.exports.triggerAutoInvite = async (req, res) => {
  try {
    const { runAutoInviteJob } = require("../cron/autoInviteScheduler.cron");
    const { AUTO_INVITE_CONFIG } = require("../constants/scheduler.constants");

    console.log("\n" + "=".repeat(80));
    console.log("🚀 [JOB APPLICATION] - MANUAL AUTO INVITE TRIGGER");
    console.log("=".repeat(80) + "\n");

    // ?reset=true clears firstInvitationSentAt so applications can be re-tested
    if (req.query.reset === "true") {
      const resetResult = await JobApplication.updateMany(
        { status: { $in: AUTO_INVITE_CONFIG.VALID_STATUSES }, isArchived: false, isWithdrawn: false },
        { $set: { firstInvitationSentAt: null } }
      );
      console.log(`🔄 [RESET] Cleared firstInvitationSentAt on ${resetResult.modifiedCount} applications`);
    }

    // Diagnostic: show what the query would find BEFORE running
    const eligible = await JobApplication.find({
      appliedAt: { $lte: new Date(Date.now() - AUTO_INVITE_CONFIG.FIRST_INVITE_HOURS * 60 * 60 * 1000) },
      status: { $in: AUTO_INVITE_CONFIG.VALID_STATUSES },
      firstInvitationSentAt: null,
      isArchived: false,
      isWithdrawn: false
    }).select("_id status appliedAt firstInvitationSentAt profile").limit(20).lean();

    console.log(`🔍 [DIAGNOSTIC] Eligible applications found: ${eligible.length}`);
    eligible.forEach(a => console.log(`   - ${a._id} | status: ${a.status} | profile: ${a.profile} | firstInviteSent: ${a.firstInvitationSentAt}`));

    await runAutoInviteJob({ force: true });

    console.log("=".repeat(80) + "\n");

    res.status(200).json({
      success: true,
      message: "Auto-invite scheduler triggered successfully",
      eligibleCount: eligible.length,
      eligibleIds: eligible.map(a => a._id),
      note: req.query.reset === "true" ? "firstInvitationSentAt was reset before running" : "Add ?reset=true to clear firstInvitationSentAt and re-test",
    });
  } catch (error) {
    console.error(`\n❌ [ERROR] Error in triggerAutoInvite: ${error.message}`);
    console.error("Stack trace:", error.stack);
    console.log("=".repeat(80) + "\n");
    handleError(res, error, 400);
  }
};

// ========== TRIGGER REMINDER (FOR TESTING) ==========
module.exports.triggerReminder = async (req, res) => {
  try {
    const { runReminderJob } = require("../cron/reminderScheduler.cron");
    const { REMINDER_CONFIG } = require("../constants/scheduler.constants");

    console.log("\n" + "=".repeat(80));
    console.log("🚀 [JOB APPLICATION] - MANUAL REMINDER TRIGGER");
    console.log("=".repeat(80) + "\n");

    // ?reset=true clears reminder timestamps so applications can be re-tested
    if (req.query.reset === "true") {
      const resetResult = await JobApplication.updateMany(
        { status: { $in: REMINDER_CONFIG.VALID_STATUSES }, isArchived: false, isWithdrawn: false },
        { $set: { firstReminderSentAt: null, secondReminderSentAt: null } }
      );
      console.log(`🔄 [RESET] Cleared reminder timestamps on ${resetResult.modifiedCount} applications`);
    }

    // Diagnostic: show pending applications before running
    const pending = await JobApplication.find({
      status: { $in: REMINDER_CONFIG.VALID_STATUSES },
      isArchived: false,
      isWithdrawn: false
    }).select("_id status appliedAt firstReminderSentAt secondReminderSentAt").limit(20).lean();

    console.log(`🔍 [DIAGNOSTIC] Pending applications found: ${pending.length}`);
    pending.forEach(a => console.log(`   - ${a._id} | status: ${a.status} | 1st: ${a.firstReminderSentAt} | 2nd: ${a.secondReminderSentAt}`));

    await runReminderJob({ force: true });

    console.log("=".repeat(80) + "\n");

    res.status(200).json({
      success: true,
      message: "Reminder scheduler triggered successfully",
      pendingCount: pending.length,
      pendingIds: pending.map(a => a._id),
      note: req.query.reset === "true" ? "Reminder timestamps were reset before running" : "Add ?reset=true to clear reminder timestamps and re-test",
    });
  } catch (error) {
    console.error(`\n❌ [ERROR] Error in triggerReminder: ${error.message}`);
    handleError(res, error, 400);
  }
};

// ========== GET - Flat summary list for a post ==========
module.exports.getApplicationsSummaryByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      status,
      search,
      matchScoreMin,
      matchScoreMax,
      interviewScoreMin,
      interviewScoreMax,
      dateFrom,
      dateTo,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    const filters = {};
    if (status)   filters.status   = status;
    if (search)   filters.search   = search;
    if (sort)     filters.sort     = sort;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo)   filters.dateTo   = dateTo;
    if (matchScoreMin !== undefined)     filters.matchScoreMin     = parseFloat(matchScoreMin);
    if (matchScoreMax !== undefined)     filters.matchScoreMax     = parseFloat(matchScoreMax);
    if (interviewScoreMin !== undefined) filters.interviewScoreMin = parseFloat(interviewScoreMin);
    if (interviewScoreMax !== undefined) filters.interviewScoreMax = parseFloat(interviewScoreMax);

    const result = await jobApplicationService.getApplicationsSummaryByPost(
      postId,
      filters,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: "Applications summary retrieved successfully",
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

// ========== CONTACT CANDIDATE ==========
module.exports.contactCandidate = async (req, res) => {
  try {
    const { candidateEmail, candidateName, subject, message } = req.body;
    if (!candidateEmail || !subject || !message) {
      return res.status(400).json({ success: false, error: "candidateEmail, subject, and message are required." });
    }

    const Profile = require("../models/Profile.model");
    const companyProfile = await Profile.findOne({ userId: req.user._id }).select("companyDetails firstName lastName");
    const companyName =
      companyProfile?.companyDetails?.name ||
      `${companyProfile?.firstName || ""} ${companyProfile?.lastName || ""}`.trim() ||
      "A Company";

    const sent = await sendCandidateEmail(candidateEmail, candidateName || "Candidate", companyName, subject, message);
    if (!sent) {
      return res.status(500).json({ success: false, error: "Failed to send email. Please try again." });
    }

    res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== GET - Flat summary list for all company applications ==========
module.exports.getApplicationsSummaryByCompany = async (req, res) => {
  try {
    const companyId = req.user._id;
    const {
      status, search, postId,
      matchScoreMin, matchScoreMax,
      interviewScoreMin, interviewScoreMax,
      dateFrom, dateTo, sort,
      page = 1, limit = 20,
    } = req.query;

    const filters = {};
    if (status)   filters.status   = status;
    if (search)   filters.search   = search;
    if (postId)   filters.postId   = postId;
    if (sort)     filters.sort     = sort;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo)   filters.dateTo   = dateTo;
    if (matchScoreMin !== undefined)     filters.matchScoreMin     = parseFloat(matchScoreMin);
    if (matchScoreMax !== undefined)     filters.matchScoreMax     = parseFloat(matchScoreMax);
    if (interviewScoreMin !== undefined) filters.interviewScoreMin = parseFloat(interviewScoreMin);
    if (interviewScoreMax !== undefined) filters.interviewScoreMax = parseFloat(interviewScoreMax);

    const result = await jobApplicationService.getApplicationsSummaryByCompany(
      companyId, filters, parseInt(page), parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: "Company applications summary retrieved successfully",
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

module.exports.downloadCVsByCompany = async (req, res) => {
  try {
    const archiver = require("archiver");
    const companyId = req.user._id;
    const { status, search, postId, dateFrom, dateTo } = req.query;

    const filters = {};
    if (status)   filters.status   = status;
    if (search)   filters.search   = search;
    if (postId)   filters.postId   = postId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo)   filters.dateTo   = dateTo;

    const files = await jobApplicationService.downloadCVsByCompany(companyId, filters);

    if (files.length === 0) {
      return res.status(404).json({ success: false, message: "No CVs found for the selected filters." });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="candidates_cvs.zip"`);

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", (err) => { throw err; });
    archive.pipe(res);

    for (const { filePath, archiveName } of files) {
      archive.file(filePath, { name: archiveName });
    }

    await archive.finalize();
  } catch (error) {
    handleError(res, error);
  }
};
