const PostInterviewAssessment = require("../../models/PostInterviewAssessmentModel");
const Post = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");
const User = require("../../models/UserModel");
const CandidatePostStepProgress = require("../../models/CandidatePostStepProgress");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (assessmentData) => {
  try {
    if (!assessmentData.post || !assessmentData.candidate) {
      throw new Error('Missing required fields: post, candidate');
    }

    const post = await Post.findById(assessmentData.post);
    if (!post) throw new Error('Post not found');

    const company = post.user;

    // =======================
    // CREATE ASSESSMENT
    // =======================
    const assessment = await PostInterviewAssessment.create({
      ...assessmentData,
      company,
      completed: false
    });

    // =======================
    // INCREMENT CANDIDATE QUOTA
    // =======================
    await Profile.findOneAndUpdate(
      { userId: assessmentData.candidate },
      { $inc: { quota: 1 } },
      { new: true }
    );

    // =======================
    // UPDATE PIPELINE
    // =======================
    const progress = await CandidatePostStepProgress.findOne({
      idCandidate: assessmentData.candidate,
      idPost: assessmentData.post
    }).populate('currentStep');

    if (!progress) return assessment;

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

    if (currentIndex === -1) return assessment;

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

    return assessment;

  } catch (error) {
    if (error.code === 11000) {
      const err = new Error('Duplicate session ID');
      err.code = 11000;
      err.status = 409;
      throw err;
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
      .populate('candidate')
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

    return assessment;
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
module.exports.getAssessmentsByCompany = async (companyId, filters = {}) => {
  try {
    const query = { company: companyId };

    const assessments = await PostInterviewAssessment.find(query)
      .populate('candidate', 'username email role')
      .populate('post', 'jobDetails title status')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error getting assessments by company:', error.message);
    throw error;
  }
};

// ========== UPDATE - Update assessment ==========
module.exports.updatePostInterviewAssessment = async (assessmentId, updateData) => {
  try {
    console.log('🔧 Updating post interview assessment:', assessmentId);

    const assessment = await PostInterviewAssessment.findByIdAndUpdate(
      assessmentId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('post', 'jobDetails title status')
      .populate('candidate', 'username email role')
      .populate('company', 'username email role');

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    console.log('✅ Post interview assessment updated');
    return assessment;
  } catch (error) {
    console.error('❌ Error updating post interview assessment:', error.message);
    throw error;
  }
};

// ========== UPDATE - Update interview data ==========
module.exports.updateInterviewData = async (assessmentId, interviewData) => {
  try {
    console.log('📊 Updating interview data for assessment:', assessmentId);

    const assessment = await PostInterviewAssessment.findByIdAndUpdate(
      assessmentId,
      {
        $set: {
          interviewData,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    console.log('✅ Interview data updated');
    return assessment;
  } catch (error) {
    console.error('❌ Error updating interview data:', error.message);
    throw error;
  }
};

// ========== DELETE - Delete assessment ==========
module.exports.deletePostInterviewAssessment = async (assessmentId) => {
  try {
    console.log('🗑️ Deleting post interview assessment:', assessmentId);

    const assessment = await PostInterviewAssessment.findByIdAndDelete(assessmentId);

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    console.log('✅ Post interview assessment deleted');
    return { message: 'Assessment deleted successfully', assessment };
  } catch (error) {
    console.error('❌ Error deleting post interview assessment:', error.message);
    throw error;
  }
};

// ========== DELETE - Delete all assessments for a post ==========
module.exports.deleteAssessmentsByPost = async (postId) => {
  try {
    console.log('🗑️ Deleting all assessments for post:', postId);

    const result = await PostInterviewAssessment.deleteMany({ post: postId });

    console.log(`✅ Deleted ${result.deletedCount} assessments`);
    return { message: `${result.deletedCount} assessments deleted`, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('❌ Error deleting assessments by post:', error.message);
    throw error;
  }
};

// ========== ANALYTICS - Get assessments statistics ==========
module.exports.getAssessmentStatistics = async (postId) => {
  try {
    const stats = await PostInterviewAssessment.aggregate([
      { $match: { post: require('mongoose').Types.ObjectId(postId) } },
      {
        $group: {
          _id: '$post',
          totalAssessments: { $sum: 1 },
          averageScore: { $avg: '$interviewData.finalReport.scores.overall' }
        }
      }
    ]);

    return stats[0] || { totalAssessments: 0, averageScore: 0 };
  } catch (error) {
    console.error('❌ Error getting assessment statistics:', error.message);
    throw error;
  }
};

// ========== SEARCH - Search assessments ==========
module.exports.searchAssessments = async (searchCriteria) => {
  try {
    const query = {};

    if (searchCriteria.postId) {
      query.post = searchCriteria.postId;
    }
    if (searchCriteria.candidateId) {
      query.candidate = searchCriteria.candidateId;
    }
    if (searchCriteria.companyId) {
      query.company = searchCriteria.companyId;
    }

    const assessments = await PostInterviewAssessment.find(query)
      .populate('post', 'jobDetails title')
      .populate('candidate', 'username email')
      .populate('company', 'username email')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error searching assessments:', error.message);
    throw error;
  }
};
