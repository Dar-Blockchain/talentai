const jobApplicationService = require("./job-application.service");
const { sendInterviewInvitation, sendCandidateEmail } = require("../../utils/email.service");
const profileService = require("../users/profile.service");
const postService = require("../posts/post.service");
const JobApplication = require("./job-application.model");
const Profile = require("../users/profile.model");

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

    const userId = req.user._id;
    const { post: postId } = req.body;


    // Validation: only post is required
    if (!postId) {
      console.error("âŒ Validation failed: Missing postId");
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

    // Block company accounts from applying to jobs
    if (req.user.role === "Company") {
      return res.status(403).json({
        success: false,
        error: "Company accounts cannot apply to job postings.",
      });
    }

    // Get candidate profile from current user
    const profileResult = await profileService.getProfileByUserId(userId);
    const profile = profileResult.profile;
    if (profile) {
      await profile.populate("cvAnalyses");
    }
    if (!profile) {
      console.error(`âŒ Candidate profile not found for user: ${userId}`);
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found for current user",
      });
    }

    // Extract cvAnalysis from profile (use the most recent one)
    const cvAnalysis = profile.cvAnalyses && profile.cvAnalyses.length > 0 
      ? profile.cvAnalyses[profile.cvAnalyses.length - 1]._id 
      : null;

    // Get post and extract company from it
    const post = await postService.getPostById(postId);
    if (!post) {
      console.error(`âŒ Job post not found: ${postId}`);
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    const company = post.user; // Company is the user who created the post

    const applicationData = {
      profile: profile._id,
      post: postId,
      company,
      cvAnalysis: cvAnalysis,
      // matchScore will be calculated automatically - DO NOT SET IT HERE
    };


    const application = await jobApplicationService.createJobApplication(
      applicationData
    );

    res.status(201).json({
      success: true,
      message: application.recruiterDecision === "not_matched"
        ? "Job application created but automatically marked as not matched due to low match score"
        : "Job application created successfully (match score calculated by AI)",
      data: application,
    });
  } catch (error) {
    console.error(`\nâŒ [ERROR] Error in createJobApplication: ${error.message}`);
    console.error("Stack trace:", error.stack);
    handleError(res, error, 400);
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

// ========== READ - Get candidate dashboard stats ==========
module.exports.getCandidateStats = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const profileResult = await profileService.getProfileByUserId(candidateId);
    const profile = profileResult.profile;
    if (!profile) return res.status(404).json({ success: false, error: "Candidate profile not found" });

    const stats = await jobApplicationService.getCandidateStats(profile._id);
    res.status(200).json({ success: true, ...stats });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== READ - Get applications by candidate ==========
module.exports.getApplicationsByCandidate = async (req, res) => {
  try {
    const candidateId = req.user._id;
    const { page = 1, limit = 10, status, isArchived, search, sortBy, scoreMin, scoreMax, dateFrom, dateTo } = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "Candidate ID is required",
      });
    }

    const filters = {};
    if (status)              filters.status    = status;
    if (isArchived !== undefined) filters.isArchived = isArchived === "true";
    if (search)              filters.search    = search;
    if (sortBy)              filters.sortBy    = sortBy;
    if (scoreMin !== undefined) filters.scoreMin = scoreMin;
    if (scoreMax !== undefined) filters.scoreMax = scoreMax;
    if (dateFrom)            filters.dateFrom  = dateFrom;
    if (dateTo)              filters.dateTo    = dateTo;

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
    const { postId, dateFrom } = req.query;

    if (!companyId) {
      return res.status(400).json({
        success: false,
        error: "Company ID is required",
      });
    }

    const metrics = await jobApplicationService.getApplicationMetrics(companyId, postId || null, dateFrom || null);

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


    // Validation
    if (!applicationId) {
      console.error("âŒ Validation failed: Missing applicationId");
      return res.status(400).json({
        success: false,
        error: "Application ID is required",
      });
    }


    // Fetch the job application
    const application = await jobApplicationService.getJobApplicationById(applicationId);

    if (!application) {
      console.error(`âŒ Job application not found: ${applicationId}`);
      return res.status(404).json({
        success: false,
        error: "Job application not found",
      });
    }


    // Verify that the current user is the company that owns this post
    if (application.company._id.toString() !== companyId.toString()) {
      console.error(`âŒ Unauthorized: User ${application.company._id} is not the  owner of this application`);
      console.error(`âŒ Unauthorized: User ${companyId} is not the owner of this post`);
      return res.status(403).json({
        success: false,
        error: "You are not authorized to send interview invitations for this application",
      });
    }

    // Fetch candidate profile to get email
    const Profile = require("../users/profile.model");
    const candidateProfile = await Profile.findById(application.profile._id).populate("userId");

    if (!candidateProfile) {
      console.error(`âŒ Candidate profile not found: ${application.profile._id}`);
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    const candidateEmail = candidateProfile.userId.email;
    const candidateName =
      candidateProfile.type === "Company"
        ? (candidateProfile.companyDetails?.name || candidateProfile.userId.username || "Company")
        : [candidateProfile.firstName, candidateProfile.lastName].filter(Boolean).join(" ") || candidateProfile.userId.username || "Candidate";


    // Fetch post details
    const post = await postService.getPostById(application.post._id);

    if (!post) {
      console.error(`âŒ Job post not found: ${application.post._id}`);
      return res.status(404).json({
        success: false,
        error: "Job post not found",
      });
    }

    const jobTitle = post.jobDetails?.title || "Position";
    const jobLanguage = post.language || post.interviewLanguages?.[0] || "en";

    // Prefer the company's registered name over the login username
    const companyProfile = await Profile.findOne({ userId: post.user._id }).select("companyDetails").lean();
    const companyName = companyProfile?.companyDetails?.name || post.user?.username || "Our Company";


    // Send interview invitation email
    const emailSent = await sendInterviewInvitation(
      candidateEmail,
      candidateName,
      jobTitle,
      companyName,
      interviewDate || null,
      interviewTime || null,
      interviewLink || null,
      jobLanguage
    );

    if (!emailSent) {
      console.error(`âŒ Failed to send interview invitation email`);
      return res.status(500).json({
        success: false,
        error: "Failed to send interview invitation email",
      });
    }


    // Persist the manual invite timestamp and clear any auto-rejection â€”
    // a manual invite is an explicit recruiter override of the threshold.
    await JobApplication.findByIdAndUpdate(applicationId, {
      invitedAt: new Date(),
      recruiterDecision: null,
      recruiterDecisionAt: null,
      rejectionReason: null,
    });

    // Send in-app notification to candidate
    const notificationService = require('../notifications/notification.service');
    const candidateUserId = candidateProfile.userId._id;
    const { buildInterviewUrl } = require('../../utils/interview-url');
    const candidateInterviewUrl = buildInterviewUrl({ type: 'post', jobId: String(post._id) });

    notificationService.createNotification(
      candidateUserId,
      `You've been invited to interview for "${jobTitle}" at ${companyName}. Your AI interview is ready â€” click to start.`,
      'info',
      'job',
      candidateInterviewUrl
    ).catch(err => console.warn('âš ï¸ Failed to send invite in-app notification:', err.message));


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
    console.error(`\nâŒ [ERROR] Error in inviteToInterview: ${error.message}`);
    console.error("Stack trace:", error.stack);
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

    const Profile = require("../users/profile.model");
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

// ========== KPI - GET PENDING SHORTLISTS COUNT ==========
// ========== KPI - ACTIONS TO TAKE (Zone 1 â€” combined) ==========
module.exports.getActionsKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId = null, dateFrom = null } = req.query;
    const assessmentService = require("../interviews/post-interview/post-interview.service");

    const [pending, unreviewed, noshows, postsInAlert] = await Promise.all([
      jobApplicationService.getPendingShortlistsKPI(companyId, postId, dateFrom),
      assessmentService.getUnreviewedInterviewsOver48Hours(companyId, postId, dateFrom),
      jobApplicationService.getNoshowsKPI(companyId, postId, dateFrom),
      postService.getPostsInAlertKPI(companyId),
    ]);

    res.status(200).json({
      success: true,
      data: {
        pendingShortlists: pending.pendingShortlistsCount ?? 0,
        unreviewed:        unreviewed.count  ?? 0,
        unreviewedUrgent:  unreviewed.urgent ?? 0,
        noshows:           noshows.count     ?? 0,
        postsInAlert:      postsInAlert.count ?? 0,
      },
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - APPLICATION HISTORY (Zone 1 replacement) ==========
module.exports.getApplicationHistoryKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom, limit } = req.query;
    const data = await jobApplicationService.getApplicationHistoryKPI(
      companyId, postId || null, dateFrom || null, limit ? parseInt(limit, 10) : 4,
    );
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

module.exports.getPendingShortlistsKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;
    const kpiData = await jobApplicationService.getPendingShortlistsKPI(companyId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data: kpiData });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - GET PENDING SHORTLIST CANDIDATES DETAILS ==========
module.exports.getPendingShortlistDetails = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, page = 1, limit = 20 } = req.query;
    const result = await jobApplicationService.getPendingShortlistDetails(companyId, postId || null, parseInt(page), parseInt(limit));
    res.status(200).json({ success: true, data: result.data, pagination: result.pagination, threshold: result.threshold });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - SOURCING QUALITY ==========
module.exports.getSourcingKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;
    const data = await jobApplicationService.getSourcingKPI(companyId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - VELOCITY ==========
module.exports.getVelocityKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;
    const data = await jobApplicationService.getVelocityKPI(companyId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - GLOBAL FUNNEL ==========
module.exports.getFunnelKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;
    const data = await jobApplicationService.getFunnelKPI(companyId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - NO-SHOWS TO FOLLOW UP ==========
module.exports.getNoshowsKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;

    if (!companyId) {
      return res.status(400).json({ success: false, error: "Company ID is required" });
    }

    const data = await jobApplicationService.getNoshowsKPI(companyId, postId || null, dateFrom || null);

    res.status(200).json({
      success: true,
      message: "No-shows KPI retrieved successfully",
      data,
    });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== KPI - REPORTING & ROI ==========
module.exports.getRoiKPI = async (req, res) => {
  try {
    const companyId = req.user._id;
    const { postId, dateFrom } = req.query;
    const data = await jobApplicationService.getRoiKPI(companyId, postId || null, dateFrom || null);
    res.status(200).json({ success: true, data });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== UPDATE RECRUITER DECISION ==========
module.exports.updateRecruiterDecision = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { decision, rejectionReason } = req.body;
    const companyId = req.user._id;

    if (!applicationId)
      return res.status(400).json({ success: false, error: "Application ID is required" });

    if (!decision || !["shortlisted", "rejected"].includes(decision))
      return res.status(400).json({ success: false, error: "Decision must be 'shortlisted' or 'rejected'" });

    const application = await jobApplicationService.getJobApplicationById(applicationId);
    if (application.company._id.toString() !== companyId.toString())
      return res.status(403).json({ success: false, error: "You are not authorized to update this application" });

    const updatedApp = await jobApplicationService.updateRecruiterDecision(applicationId, decision, rejectionReason || null);

    res.status(200).json({ success: true, message: `Application ${decision} successfully`, data: updatedApp });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== WITHDRAW (candidate) ==========
module.exports.withdrawApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const profile = await Profile.findOne({ userId: req.user._id }).select("_id");
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found." });

    const app = await jobApplicationService.withdrawApplication(applicationId, profile._id);
    res.status(200).json({ success: true, message: "Application withdrawn successfully.", data: app });
  } catch (error) {
    handleError(res, error);
  }
};

// ========== REACTIVATE (candidate) ==========
module.exports.reactivateApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const profile = await Profile.findOne({ userId: req.user._id }).select("_id");
    if (!profile) return res.status(404).json({ success: false, error: "Profile not found." });

    const app = await jobApplicationService.reactivateApplication(applicationId, profile._id);
    res.status(200).json({ success: true, message: "Application reactivated successfully.", data: app });
  } catch (error) {
    handleError(res, error);
  }
};
