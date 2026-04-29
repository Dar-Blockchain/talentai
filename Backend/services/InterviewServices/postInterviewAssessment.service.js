const PostInterviewAssessment = require("../../models/PostInterviewAssessment.model");
const Post = require("../../models/posts.model");
const Profile = require("../../models/Profile.model");
const User = require("../../models/User.model");
const CandidatePostStepProgress = require("../../models/CandidatePostStepsProgress.model");
const crypto = require("crypto");
const subscriptionService = require("../subscription.service");

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
    const Subscription = require("../../models/Subscription.model");
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

// ========== CHECK EXISTENCE ==========
/**
 * Check if an assessment already exists for a candidate and post
 * Only returns true if:
 * 1. The post has PostSteps
 * 2. The assessment exists for the candidate and post
 * @param {string} candidateId - The candidate ID
 * @param {string} postId - The post ID
 * @returns {Promise<boolean>} True if assessment exists, false otherwise
 */
module.exports.hasExistingAssessment = async (candidateId, postId) => {
  try {
    // Check if post exists and is not archived
    const post = await Post.findById(postId).select("PostSteps archived");

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if post is archived
    if (post.archived) {
      throw new Error("This post is archived and cannot accept assessments");
    }

    // If post HAS PostSteps → return false
    if (post.PostSteps && post.PostSteps.length > 0) {
      return false;
    }

    // If post has NO PostSteps → check assessment
    const assessment = await PostInterviewAssessment.findOne({
      candidate: candidateId,
      post: postId
    });

    return assessment !== null;

  } catch (error) {
    console.error("Error checking existing assessment:", error.message);
    throw error;
  }
};

// ========== GET MATCHING DETAILS ==========
module.exports.getMatchingDetails = async (candidateId, postId) => {
  try {
    console.log(`\n📊 [MATCHING DETAILS] - Getting match score and threshold for candidate`);
    
    // Check if post exists and is not archived
    const post = await Post.findById(postId).select("thresholdScore archived");

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if post is archived
    if (post.archived) {
      throw new Error("This post is archived and cannot accept assessments");
    }

    // Get candidate profile
    const Profile = require("../../models/Profile.model");
    const candidateProfile = await Profile.findOne({ userId: candidateId });
    
    if (!candidateProfile) {
      throw new Error("Candidate profile not found");
    }

    // Get threshold score — if 0 or not set, no restriction applies
    const thresholdScore = post.thresholdScore || 0;
    if (!thresholdScore) {
      return { matchScore: null, thresholdScore: 0, meetsThreshold: true, message: "No threshold set for this position" };
    }

    // Get JobApplication to retrieve matchScore
    const JobApplication = require("../../models/JobApplication.model");
    const application = await JobApplication.findOne({
      profile: candidateProfile._id,
      post: postId
    });

    // No application yet — fail open (let them proceed)
    if (!application) {
      return { matchScore: null, thresholdScore, meetsThreshold: true, message: "No application found — access granted" };
    }

    const matchScore = application.matchScore || 0;
    const meetsThreshold = matchScore >= thresholdScore;

    console.log(`✅ Matching Details Retrieved:`);
    console.log(`   Match Score: ${matchScore}/100`);
    console.log(`   Threshold Score: ${thresholdScore}/100`);
    console.log(`   Meets Threshold: ${meetsThreshold}`);

    return {
      matchScore,
      thresholdScore,
      meetsThreshold,
      message: meetsThreshold 
        ? "Your match score meets the required threshold" 
        : `Your match score (${matchScore}/100) is below the minimum required score (${thresholdScore}/100)`
    };
  } catch (error) {
    console.error("Error getting matching details:", error.message);
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

// ========== READ - Get all for a post ==========
module.exports.getAssessmentsByPost = async (postId, filters = {}) => {
  try {
    const query = { post: postId };

    const assessments = await PostInterviewAssessment.find(query)
      .populate('candidate', 'username email role')
      .populate('company', 'username email role')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error getting assessments by post:', error.message);
    throw error;
  }
};

// ========== READ - Get all for a candidate ==========
module.exports.getAssessmentsByCandidate = async (candidateId, filters = {}) => {
  try {
    const query = { candidate: candidateId };

    const assessments = await PostInterviewAssessment.find(query)
      .populate('post')
      .populate('company')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error getting assessments by candidate:', error.message);
    throw error;
  }
};

// ========== READ - Get all for a company ==========
// supports optional filters:
//   jobTitle           -> partial/case-insensitive match against post.jobDetails.title
//   candidateUsername  -> partial/case-insensitive match against candidate.username
// pagination parameters page & limit
module.exports.getAssessmentsByCompany = async (
  companyId,
  filters = {},
  page = 1,
  limit = 10,
) => {
  try {
    const matchStage = { company: companyId, archived: { $ne: true } };

    const pipeline = [
      { $match: matchStage },
      // bring in candidate and post documents
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidate',
        },
      },
      { $unwind: { path: '$candidate', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: { path: '$post', preserveNullAndEmptyArrays: true } },
    ];

    // Generic search that searches across candidate name, email, and job title
    if (filters.search) {
      pipeline.push({
        $match: {
          $or: [
            // Search in candidate email
            { 'candidate.email': { $regex: filters.search, $options: 'i' } },
            // Search in candidate name (firstName, lastName, username)
            { 'candidate.profile.firstName': { $regex: filters.search, $options: 'i' } },
            { 'candidate.profile.lastName': { $regex: filters.search, $options: 'i' } },
            { 'candidate.username': { $regex: filters.search, $options: 'i' } },
            // Search in job title
            { 'post.jobDetails.title': { $regex: filters.search, $options: 'i' } },
          ],
        },
      });
    }

    // project out sensitive or unnecessary fields before pagination
    pipeline.push({
      $project: {
        'candidate.authHistory': 0,
        'candidate.notifications': 0,
        'post.linkedinPost': 0,
      },
    });

    // prepare faceted pagination
    const skip = (page - 1) * limit;
    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
      },
    });

    const aggResult = await PostInterviewAssessment.aggregate(pipeline);
    const meta = (aggResult[0] && aggResult[0].metadata[0]) || { total: 0 };
    const data = (aggResult[0] && aggResult[0].data) || [];
    const totalCount = meta.total;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data,
      currentPage: page,
      totalPages,
      totalCount,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  } catch (error) {
    console.error('❌ Error getting assessments by company:', error.message);
    throw error;
  }
};

// ========== METRICS - Company interview summary ==========
module.exports.getInterviewMetricsForCompany = async (companyId, filters = {}) => {
  try {
    const matchStage = { company: companyId, archived: { $ne: true } };

    const pipeline = [
      { $match: matchStage },
      // populate candidate & post for filtering
      {
        $lookup: {
          from: 'users',
          localField: 'candidate',
          foreignField: '_id',
          as: 'candidate',
        },
      },
      { $unwind: { path: '$candidate', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'posts',
          localField: 'post',
          foreignField: '_id',
          as: 'post',
        },
      },
      { $unwind: { path: '$post', preserveNullAndEmptyArrays: true } },
    ];

    if (filters.jobTitle) {
      pipeline.push({
        $match: { 'post.jobDetails.title': { $regex: filters.jobTitle, $options: 'i' } },
      });
    }
    if (filters.candidateUsername) {
      pipeline.push({
        $match: { 'candidate.username': { $regex: filters.candidateUsername, $options: 'i' } },
      });
    }

    if (filters.candidateName) {
      pipeline.push({
        $match: {
          $or: [
            { 'candidate.username': { $regex: filters.candidateName, $options: 'i' } },
            { 'candidate.profile.firstName': { $regex: filters.candidateName, $options: 'i' } },
            { 'candidate.profile.lastName': { $regex: filters.candidateName, $options: 'i' } },
          ],
        },
      });
    }

    if (filters.candidateEmail) {
      pipeline.push({
        $match: { 'candidate.email': { $regex: filters.candidateEmail, $options: 'i' } },
      });
    }

    // compute summary metrics
    pipeline.push({
      $group: {
        _id: null,
        total: { $sum: 1 },
        sumScore: { $sum: '$interviewData.finalReport.scores.overall' },
        needWork: {
          $sum: {
            $cond: [
              { $lt: ['$interviewData.finalReport.scores.overall', 20] },
              1,
              0,
            ],
          },
        },
        excellent: {
          $sum: {
            $cond: [
              { $gt: ['$interviewData.finalReport.scores.overall', 70] },
              1,
              0,
            ],
          },
        },
      },
    });

    const agg = await PostInterviewAssessment.aggregate(pipeline);
    const row = agg[0] || { total: 0, sumScore: 0, needWork: 0, excellent: 0 };
    const avgScore = row.total > 0 ? row.sumScore / row.total : 0;

    return {
      total: row.total,
      needWork: row.needWork,
      excellent: row.excellent,
      avgScore,
    };
  } catch (error) {
    console.error('❌ Error computing interview metrics for company:', error.message);
    throw error;
  }
};