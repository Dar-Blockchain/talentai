const mongoose = require("mongoose");
const PostInterviewAssessment = require("./post-interview.model");
const Post = require("../../posts/post.model");
const Profile = require("../../../features/users/profile.model");
const User = require("../../../features/users/user.model");
const crypto = require("crypto");
const subscriptionService = require("../../../features/billing/subscriptions/subscription.service");
const jobApplicationService = require("../../job-applications/job-application.service");

// ========== MONTHLY INTERVIEW LIMIT HELPERS ==========
const checkMonthlyInterviewLimit = async (companyId) => {
  try {
    const profile = await Profile.findOne({ userId: companyId });
    if (!profile) {
      const err = new Error('Company profile not found');
      err.status = 404;
      throw err;
    }
    if (profile.type !== 'Company') {
      const err = new Error('Only company accounts can create interview assessments');
      err.status = 403;
      throw err;
    }

    const result = await subscriptionService.checkSubscriptionLimit(profile._id.toString(), 'monthlyInterviews');
    if (!result.canUse) {
      const err = new Error(result.message);
      err.status = 403;
      err.limitData = result.limitData;
      throw err;
    }

    return { canCreate: true, used: result.limitData?.used ?? 0, limit: result.limitData?.limit ?? 0 };
  } catch (error) {
    console.error('Error checking monthly interview limit:', error.message || error);
    throw error;
  }
};

const incrementMonthlyInterviewsUsage = async (companyId) => {
  try {
    const profile = await Profile.findOne({ userId: companyId });
    if (!profile) {
      const err = new Error('Profile not found when incrementing monthly interviews');
      err.status = 404;
      throw err;
    }

    // Increment on all active non-Trial subscriptions (distributed evenly — first active sub gets +1)
    const Subscription = require("../../../features/billing/subscriptions/subscription.model");
    const active = await Subscription.find({
      companyProfileId: profile._id.toString(),
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("planId").sort({ createdAt: -1 });

    const paid = active.filter((s) => s.planId?.name !== "Trial");
    const targets = paid.length ? paid : active;

    if (targets.length === 0) {
      console.warn(`⚠️ [incrementMonthlyInterviewsUsage] No active subscription found for profile ${profile._id}`);
      return;
    }

    // Increment the subscription with the most remaining capacity first
    const target = targets.reduce((best, s) => {
      const remaining = (s.planId?.monthlyInterviewLimit || 0) - (s.monthlyInterviewsUsed || 0);
      const bestRemaining = (best.planId?.monthlyInterviewLimit || 0) - (best.monthlyInterviewsUsed || 0);
      return remaining > bestRemaining ? s : best;
    });

    await subscriptionService.incrementUsage(target._id.toString(), 'monthlyInterviewsUsed', 1);
  } catch (error) {
    console.error('Error incrementing monthly interviews usage:', error.message || error);
    throw error;
  }
};

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (assessmentData) => {
  try {
    if (!assessmentData.post || !assessmentData.candidate) {
      throw new Error('Missing required fields: post, candidate');
    }

    const post = await Post.findById(assessmentData.post);
    if (!post) throw new Error('Post not found');

    // Determine company id from post
    const company = post.user;
    const companyId = post.user && post.user._id ? post.user._id : post.user;

    // Check monthly interview limit before creating assessment
    await checkMonthlyInterviewLimit(companyId);

    // =======================
    // CHECK IF ASSESSMENT ALREADY EXISTS
    // =======================
    const existingAssessment = await PostInterviewAssessment.findOne({
      candidate: assessmentData.candidate,
      post: assessmentData.post
    });

    if (existingAssessment) {
      return await PostInterviewAssessment.findById(existingAssessment._id)
        .populate({
          path: 'candidate',
          populate: {
            path: 'profile',
            model: 'Profile'
          }
        })
        .populate('company')
        .populate('post');
    }

    // =======================
    // CREATE ASSESSMENT
    // =======================
    // Always generate a new unique sessionId (don't accept from client)
    // Format: timestamp-random-hash
    const sessionId = `session_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    const assessment = await PostInterviewAssessment.create({
      ...assessmentData,
      company,
      completed: false,
      interviewData: {
        ...assessmentData.interviewData,
        sessionId,
        timestamp: new Date()
      }
    });

    // Increment monthly interviews usage (best-effort)
    try {
      await incrementMonthlyInterviewsUsage(companyId);
    } catch (incErr) {
      console.error('⚠️ Warning: failed to increment monthly interviews usage:', incErr.message || incErr);
      // Do not fail assessment creation if increment fails
    }

    return await PostInterviewAssessment.findById(assessment._id)
      .populate({
        path: 'candidate',
        populate: {
          path: 'profile',
          model: 'Profile'
        }
      })
      .populate('company')
      .populate('post');

  } catch (error) {
    // If duplicate key error occurs, return the existing assessment instead
    if (error.code === 11000) {
      const existingAssessment = await PostInterviewAssessment.findOne({
        candidate: assessmentData.candidate,
        post: assessmentData.post
      })
        .populate({
          path: 'candidate',
          populate: {
            path: 'profile',
            model: 'Profile'
          }
        })
        .populate('company')
        .populate('post');

      if (existingAssessment) {
        return existingAssessment;
      }
    }
    throw error;
  }
};

// ========== READ - Get by post + candidate ==========
module.exports.getAssessmentByPostAndCandidate = async (postId, candidateUserId) => {
  try {
    const assessment = await PostInterviewAssessment.findOne({ post: postId, candidate: candidateUserId })
      .populate('post')
      .populate({ path: 'candidate', populate: { path: 'profile', model: 'Profile' } })
      .populate('company');
    if (!assessment) {
      const error = new Error('Assessment not found');
      error.status = 404;
      throw error;
    }
    return assessment;
  } catch (error) {
    console.error('Error getting assessment by post and candidate:', error.message);
    throw error;
  }
};

// ========== READ - Get all assessments ==========
module.exports.getAllPostInterviewAssessments = async (filters = {}, page = 1, limit = 10) => {
  try {
    const query = {};

    // Apply optional filters
    if (filters.post) {
      query.post = filters.post;
    }
    if (filters.candidate) {
      query.candidate = filters.candidate;
    }
    if (filters.company) {
      query.company = filters.company;
    }

    // Calculate skip and limit for pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination info
    const totalCount = await PostInterviewAssessment.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated data
    const assessments = await PostInterviewAssessment.find(query)
      .populate('post')
      .populate({
        path: 'candidate',
        populate: {
          path: 'profile',
          model: 'Profile'
        }
      })
      .populate('company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return {
      data: assessments,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  } catch (error) {
    console.error('❌ Error getting all assessments:', error.message);
    throw error;
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (assessmentId) => {
  try {
    const assessment = await PostInterviewAssessment.findById(assessmentId)
      .populate('post')
      .populate('candidate')
      .populate('company');

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    return {
      assessment,
      stepsData: null,
      hasSteps: false
    };
  } catch (error) {
    console.error('❌ Error getting post interview assessment:', error.message);
    throw error;
  }
};


// ========== CHECK INTERVIEW ELIGIBILITY ==========
module.exports.checkInterviewEligibility = async (candidateId, postId, userRole) => {
  if (userRole === "Company")  return { status: "company_blocked" };
  if (userRole === "Employee") return { status: "employee_blocked" };

  const post = await Post.findById(postId)
    .select("archived expirationDate thresholdScore user jobDetails title");
  if (!post) return { status: "not_found" };

  if (post.archived) return { status: "archived" };

  if (post.expirationDate && new Date(post.expirationDate) < new Date())
    return { status: "expired" };

  const companyProfile = await Profile.findOne({ userId: post.user }).select("_id activeSubscription");
  if (companyProfile) {
    const limitCheck = await subscriptionService.checkSubscriptionLimit(
      companyProfile._id, "monthlyInterviews"
    );
    if (!limitCheck.canUse) {
      return { status: "limit_reached", meta: { jobTitle: post.jobDetails?.title || "" } };
    }
  }

  // Record visit as a job application (idempotent — 409 on repeat visits is expected)
  const candidateProfile = await Profile.findOne({ userId: candidateId }).select("_id");
  if (candidateProfile) {
    jobApplicationService.createJobApplication({
      profile: candidateProfile._id,
      post: postId,
      company: post.user,
    }).catch(() => {});
  }

  const completed = await PostInterviewAssessment.exists({ candidate: candidateId, post: postId, completed: true });
  if (completed) return { status: "completed", meta: { jobTitle: post.jobDetails?.title || post.title || "" } };

  if (post.thresholdScore != null && candidateProfile) {
    const JobApplication = require("../../job-applications/job-application.model");
    const application = await JobApplication.findOne({ profile: candidateProfile._id, post: postId })
      .select("matchScore").lean();
    if (application?.matchScore != null && application.matchScore < post.thresholdScore) {
      return { status: "under_threshold", meta: { required: post.thresholdScore, score: application.matchScore } };
    }
  }

  return { status: "eligible" };
};

// ========== KPI - Unreviewed interviews older than 48 hours ==========
module.exports.getUnreviewedInterviewsOver48Hours = async (companyId, postId = null, dateFrom = null) => {
  try {
    const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const urgent = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const match = {
      company:           new mongoose.Types.ObjectId(companyId),
      completed:         true,
      recruiterFeedback: null,
      createdAt:         { $lte: cutoff },
    };

    if (postId)   match.post            = new mongoose.Types.ObjectId(postId);
    if (dateFrom) match.createdAt.$gte  = new Date(dateFrom);

    const [count, urgentCount] = await Promise.all([
      PostInterviewAssessment.countDocuments(match),
      PostInterviewAssessment.countDocuments({ ...match, createdAt: { ...match.createdAt, $lte: urgent } }),
    ]);

    return { count, urgent: urgentCount };
  } catch (error) {
    throw error;
  }
};
