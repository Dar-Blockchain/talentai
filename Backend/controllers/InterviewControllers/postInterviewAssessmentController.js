const postInterviewAssessmentService = require("../../services/InterviewServices/postInterviewAssessmentService");

// ========== CREATE ==========
module.exports.createPostInterviewAssessment = async (req, res) => {
  try {
    const assessmentData = req.body;
    assessmentData.candidate = req.user._id;
    // Validation
    if (!assessmentData.post) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: post, candidate (company will be extracted from post)'
      });
    }

    const assessment = await postInterviewAssessmentService.createPostInterviewAssessment(assessmentData);

    res.status(201).json({
      success: true,
      message: 'Post interview assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error creating post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error creating post interview assessment'
    });
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.getPostInterviewAssessmentById(assessmentId);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment retrieved successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error getting post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessment'
    });
  }
};

// ========== READ - Get all for a post ==========
module.exports.getAssessmentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const filters = req.query;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const assessments = await postInterviewAssessmentService.getAssessmentsByPost(postId, filters);

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error getting assessments by post:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== READ - Get all for a candidate ==========
module.exports.getAssessmentsByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const filters = req.query;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: 'Candidate ID is required'
      });
    }

    const assessments = await postInterviewAssessmentService.getAssessmentsByCandidate(candidateId, filters);

    res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error getting assessments by candidate:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving assessments'
    });
  }
};

// ========== UPDATE - Update assessment ==========
module.exports.updatePostInterviewAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const updateData = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.updatePostInterviewAssessment(assessmentId, updateData);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error updating assessment'
    });
  }
};

// ========== UPDATE - Update interview data ==========
module.exports.updateInterviewData = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const interviewData = req.body;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const assessment = await postInterviewAssessmentService.updateInterviewData(assessmentId, interviewData);

    res.status(200).json({
      success: true,
      message: 'Interview data updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating interview data:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error updating interview data'
    });
  }
};

// ========== DELETE - Delete assessment ==========
module.exports.deletePostInterviewAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;

    if (!assessmentId) {
      return res.status(400).json({
        success: false,
        message: 'Assessment ID is required'
      });
    }

    const result = await postInterviewAssessmentService.deletePostInterviewAssessment(assessmentId);

    res.status(200).json({
      success: true,
      message: 'Post interview assessment deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting post interview assessment:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error deleting assessment'
    });
  }
};

// ========== DELETE - Delete all for a post ==========
module.exports.deleteAssessmentsByPost = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const result = await postInterviewAssessmentService.deleteAssessmentsByPost(postId);

    res.status(200).json({
      success: true,
      message: 'Assessments deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting assessments by post:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error deleting assessments'
    });
  }
};

// ========== ANALYTICS - Get statistics ==========
module.exports.getAssessmentStatistics = async (req, res) => {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        message: 'Post ID is required'
      });
    }

    const stats = await postInterviewAssessmentService.getAssessmentStatistics(postId);

    res.status(200).json({
      success: true,
      message: 'Assessment statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error getting assessment statistics:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error retrieving statistics'
    });
  }
};

// ========== SEARCH ==========
module.exports.searchAssessments = async (req, res) => {
  try {
    const searchCriteria = req.query;

    const assessments = await postInterviewAssessmentService.searchAssessments(searchCriteria);

    res.status(200).json({
      success: true,
      message: 'Assessments search completed',
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error searching assessments:', error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error searching assessments'
    });
  }
};
