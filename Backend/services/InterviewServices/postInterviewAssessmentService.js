const PostInterviewAssessment = require("../../models/PostInterviewAssessmentModel");
const Post = require("../../models/PostModel");
const Profile = require("../../models/ProfileModel");
const User = require("../../models/UserModel");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (assessmentData) => {
  try {
    console.log('📝 Creating post interview assessment:', assessmentData);

    // Validation
    if (!assessmentData.post || !assessmentData.candidate) {
      throw new Error('Missing required fields: post, candidate');
    }

    // Verify Post exists
    const post = await Post.findById(assessmentData.post);
    if (!post) {
      throw new Error('Post not found');
    }

    // Verify Candidate User exists
    const candidateUser = await User.findById(assessmentData.candidate);
    if (!candidateUser) {
      throw new Error('Candidate user not found');
    }

    // Verify Company User exists (if provided)
    if (assessmentData.company) {
      const companyUser = await User.findById(assessmentData.company);
      if (!companyUser) {
        throw new Error('Company user not found');
      }
    }

    // Create new assessment
    const newAssessment = new PostInterviewAssessment(assessmentData);
    await newAssessment.save();

    console.log('✅ Post interview assessment created:', newAssessment._id);
    return newAssessment;
  } catch (error) {
    console.error('❌ Error creating post interview assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (assessmentId) => {
  try {
    const assessment = await PostInterviewAssessment.findById(assessmentId)
      .populate('post', 'jobDetails title status')
      .populate('candidate', 'username email role')
      .populate('company', 'username email role');

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

    // Apply optional filters
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.stage) {
      query.stage = filters.stage;
    }
    if (filters.candidate) {
      query.candidate = filters.candidate;
    }

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

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.post) {
      query.post = filters.post;
    }

    const assessments = await PostInterviewAssessment.find(query)
      .populate('post', 'jobDetails title status')
      .populate('company', 'username email role')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error getting assessments by candidate:', error.message);
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
      .populate('candidate', 'firstName lastName skills')
      .populate('user', 'username email role');

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

// ========== UPDATE - Update status ==========
module.exports.updateAssessmentStatus = async (assessmentId, status) => {
  try {
    const validStatuses = ['draft', 'in-progress', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const updateData = { status };
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    const assessment = await PostInterviewAssessment.findByIdAndUpdate(
      assessmentId,
      { $set: updateData },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    console.log(`✅ Assessment status updated to ${status}`);
    return assessment;
  } catch (error) {
    console.error('❌ Error updating assessment status:', error.message);
    throw error;
  }
};

// ========== UPDATE - Update stage ==========
module.exports.updateAssessmentStage = async (assessmentId, stage) => {
  try {
    const validStages = ['pending', 'scheduled', 'completed', 'rejected'];
    if (!validStages.includes(stage)) {
      throw new Error(`Invalid stage. Must be one of: ${validStages.join(', ')}`);
    }

    const assessment = await PostInterviewAssessment.findByIdAndUpdate(
      assessmentId,
      { $set: { stage } },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Post interview assessment not found');
    }

    console.log(`✅ Assessment stage updated to ${stage}`);
    return assessment;
  } catch (error) {
    console.error('❌ Error updating assessment stage:', error.message);
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
          completedAssessments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          draftAssessments: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          averageScore: { $avg: '$interviewData.finalReport.scores.overall' }
        }
      }
    ]);

    return stats[0] || { totalAssessments: 0, completedAssessments: 0, draftAssessments: 0, averageScore: 0 };
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
    if (searchCriteria.userId) {
      query.user = searchCriteria.userId;
    }
    if (searchCriteria.status) {
      query.status = searchCriteria.status;
    }
    if (searchCriteria.stage) {
      query.stage = searchCriteria.stage;
    }
    if (searchCriteria.skill) {
      query['metadata.skill'] = { $regex: searchCriteria.skill, $options: 'i' };
    }

    const assessments = await PostInterviewAssessment.find(query)
      .populate('post', 'jobDetails title')
      .populate('candidate', 'firstName lastName')
      .populate('user', 'username email')
      .sort({ createdAt: -1 });

    return assessments;
  } catch (error) {
    console.error('❌ Error searching assessments:', error.message);
    throw error;
  }
};
