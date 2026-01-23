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

    // Extract company from Post.user (the user who created the post)
    const company = post.user;
    console.log('🏢 Company extracted from post:', company);

    // Create new assessment with company extracted from post
    const newAssessmentData = {
      ...assessmentData,
      company
    };

    const newAssessment = new PostInterviewAssessment(newAssessmentData);
    await newAssessment.save();

    console.log('✅ Post interview assessment created:', newAssessment._id);
    return newAssessment;
  } catch (error) {
    console.error('❌ Error creating post interview assessment:', error.message);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      const err = new Error('An assessment with this session ID already exists.');
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
      .populate('post', 'jobDetails title status')
      .populate('candidate', 'username email role')
      .populate('company', 'username email role')
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
      .populate('post', 'jobDetails title status')
      .populate('company', 'username email role')
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
