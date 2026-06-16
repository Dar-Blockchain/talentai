const PostInterviewAssessment = require("./post-interview.model");
const Post = require("../../../models/Post.model");
const Profile = require("../../../features/users/profile.model");
const User = require("../../../features/users/user.model");
const CandidatePostStepProgress = require("../../../models/CandidatePostStepsProgress.model");
const crypto = require("crypto");
const subscriptionService = require("../../../services/subscription.service");

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
    const Subscription = require("../../../models/Subscription.model");
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
    console.log(`✅ [incrementMonthlyInterviewsUsage] subscription ${target._id} monthlyInterviewsUsed +1`);
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
      console.log(`✅ Assessment already exists for candidate ${assessmentData.candidate} and post ${assessmentData.post}. Returning existing assessment.`);
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

    // =======================
    // UPDATE PIPELINE
    // =======================
    const progress = await CandidatePostStepProgress.findOne({
      idCandidate: assessmentData.candidate,
      idPost: assessmentData.post
    }).populate('currentStep');

    if (!progress) {
      // No pipeline progress - populate and return
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
    }

    // sort steps by nodeNumber
    const sortedSteps = [...progress.steps].sort((a, b) => {
      const sa = post.PostSteps.find(ps => ps._id.equals(a.stepId));
      const sb = post.PostSteps.find(ps => ps._id.equals(b.stepId));
      return (sa?.data?.config?.nodeNumber ?? 0) -
             (sb?.data?.config?.nodeNumber ?? 0);
    });

    const currentIndex = sortedSteps.findIndex(s =>
      s.stepId.equals(progress.currentStep._id)
    );

    if (currentIndex === -1) {
      // No matching step - populate and return
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
    }

    // current → done
    const currentStep = progress.steps.find(s =>
      s.stepId.equals(progress.currentStep._id)
    );

    currentStep.status = 'done';
    currentStep.interviewDetails = assessment._id;
    currentStep.completedAt = new Date();
    currentStep.attempts = (currentStep.attempts || 0) + 1;

    // next → inProgress
    const next = sortedSteps[currentIndex + 1];
    if (next) {
      const nextStep = progress.steps.find(s =>
        s.stepId.equals(next.stepId)
      );
      nextStep.status = 'inProgress';
      progress.currentStep = next.stepId;
    }

    await progress.save();

    // Populate and return assessment with candidate profile
    const populatedAssessment = await PostInterviewAssessment.findById(assessment._id)
      .populate({
        path: 'candidate',
        populate: {
          path: 'profile',
          model: 'Profile'
        }
      })
      .populate('company')
      .populate('post');

    return populatedAssessment;

  } catch (error) {
    // If duplicate key error occurs, return the existing assessment instead
    if (error.code === 11000) {
      console.log('⚠️ Duplicate assessment detected. An assessment already exists for this candidate and post. Returning existing assessment...');
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

    // =======================
    // FETCH STEPS DATA
    // =======================
    let stepsData = null;
    try {
      const candidatePostStepProgress = await CandidatePostStepProgress.findOne({
        idCandidate: assessment.candidate._id,
        idPost: assessment.post._id
      })
        .populate({
          path: 'steps.stepId',
          model: 'PostSteps'
        })
        .populate({
          path: 'steps.interviewDetails',
          model: 'PostInterviewAssessment'
        })
        .populate('currentStep');

      if (candidatePostStepProgress) {
        stepsData = {
          _id: candidatePostStepProgress._id,
          idCandidate: candidatePostStepProgress.idCandidate,
          idPost: candidatePostStepProgress.idPost,
          currentStep: candidatePostStepProgress.currentStep,
          steps: candidatePostStepProgress.steps.map(step => ({
            stepId: step.stepId,
            interviewDetails: step.interviewDetails,
            status: step.status,
            passed: step.passed,
            finalScore: step.finalScore,
            attempts: step.attempts,
            completedAt: step.completedAt
          })),
          createdAt: candidatePostStepProgress.createdAt,
          updatedAt: candidatePostStepProgress.updatedAt
        };
      }
    } catch (stepsError) {
      console.warn('⚠️ Warning fetching steps data:', stepsError.message);
      // Don't throw - steps data is optional
    }

    // =======================
    // RETURN WITH STEPS DATA
    // =======================
    return {
      assessment,
      stepsData,
      hasSteps: stepsData !== null
    };
  } catch (error) {
    console.error('❌ Error getting post interview assessment:', error.message);
    throw error;
  }
};


// ========== KPI - Unreviewed interviews older than 48 hours ==========
module.exports.getUnreviewedInterviewsOver48Hours = async (companyId, postId = null, dateFrom = null) => {
  try {
    const mongoose = require('mongoose');
    const cutoff   = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const urgent   = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const match = {
      company:             new mongoose.Types.ObjectId(companyId),
      completed:           true,
      recruiterFeedback:   null,
      createdAt:           { $lte: cutoff },
    };

    if (postId)   match.post     = new mongoose.Types.ObjectId(postId);
    if (dateFrom) match.createdAt.$gte = new Date(dateFrom);

    const [count, urgentCount] = await Promise.all([
      PostInterviewAssessment.countDocuments(match),
      PostInterviewAssessment.countDocuments({ ...match, createdAt: { ...match.createdAt, $lte: urgent } }),
    ]);

    return {
      count,
      urgent:    urgentCount,
      lastCheck: new Date().toISOString(),
      message:   `${count} completed interview(s) pending recruiter review for 48+ hours`,
    };
  } catch (error) {
    console.error('❌ Error getting unreviewed interviews KPI:', error.message);
    throw error;
  }
};
