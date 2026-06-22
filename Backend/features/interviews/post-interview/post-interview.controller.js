const service = require('./post-interview.service');

// ========== READ - Get all assessments ==========
module.exports.getAllPostInterviewAssessments = async (req, res) => {
  try {
    const { page = 1, limit = 10, post, candidate, company } = req.query;
    const filters = {};
    if (post) filters.post = post;
    if (candidate) filters.candidate = candidate;
    if (company) filters.company = company;

    const result = await service.getAllPostInterviewAssessments(filters, parseInt(page), parseInt(limit));
    return res.status(200).json({
      success: true,
      message: 'All assessments retrieved successfully',
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
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error retrieving assessments' });
  }
};

// ========== READ - Get by ID ==========
module.exports.getPostInterviewAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    if (!assessmentId) return res.status(400).json({ success: false, message: 'Assessment ID is required' });

    const assessment = await service.getPostInterviewAssessmentById(assessmentId);
    return res.status(200).json({ success: true, message: 'Post interview assessment retrieved successfully', data: assessment });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error retrieving assessment' });
  }
};

// ========== READ - Get assessment by post + candidate ==========
module.exports.getAssessmentByPostAndCandidate = async (req, res) => {
  try {
    const { postId, candidateUserId } = req.params;
    if (!postId || !candidateUserId) return res.status(400).json({ success: false, message: 'postId and candidateUserId are required.' });

    const data = await service.getAssessmentByPostAndCandidate(postId, candidateUserId);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.message || 'Error retrieving assessment.' });
  }
};

// ========== CHECK INTERVIEW ELIGIBILITY ==========
module.exports.checkInterviewEligibility = async (req, res) => {
  try {
    const { postId } = req.params;
    const result = await service.checkInterviewEligibility(req.user._id, postId, req.user.role);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
};
