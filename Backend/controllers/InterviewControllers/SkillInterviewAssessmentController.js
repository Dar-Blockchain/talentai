const SkillInterviewAssessmentService = require('../../services/InterviewServices/SkillInterviewAssessmentService');
const SkillInterviewAssessment = require('../../models/SkillInterviewAssessmentModel');
const Profile = require('../../models/ProfileModel');

// ========== POST - Create a new assessment ==========
const create = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user?._id;

    // Basic validation
    if (!data.interviewData?.sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    // Ensure candidateId is set
    if (!data.candidateId && userId) {
      const userProfile = await Profile.findOne({ userId });
      if (userProfile) {
        data.candidateId = userProfile._id;
        console.log('Candidate ID set from user profile:', data.candidateId);
      }
    }

    if (!data.candidateId) {
      return res.status(400).json({
        success: false,
        message: 'candidateId is required or user must have a profile'
      });
    }

    const rawInterviewData = data.interviewData;

    const assessment = await SkillInterviewAssessmentService.createAssessment(
      data,
      rawInterviewData,
      userId
    );

    return res.status(201).json({
      success: true,
      message: 'Skill assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    
    // Handle duplicate key error (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An assessment with this session ID already exists. Please use a unique session ID.',
        code: 'DUPLICATE_SESSION_ID'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Retrieve all assessments ==========
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, interviewType, candidateId, interviewerId } = req.query;

    const filters = {};
    if (interviewType) filters.interviewType = interviewType;
    if (candidateId) filters.candidateId = candidateId;
    if (interviewerId) filters.interviewerId = interviewerId;

    const result = await SkillInterviewAssessmentService.getAllAssessments(
      parseInt(page),
      parseInt(limit),
      filters
    );

    return res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getAll:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// ========== GET - Retrieve by ID ==========
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await SkillInterviewAssessmentService.getAssessmentById(id);

    return res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error retrieving assessment:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Retrieve by sessionId ==========
const getBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const assessment = await SkillInterviewAssessmentService.getAssessmentBySessionId(sessionId);

    return res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error retrieving assessment:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Retrieve by candidate ==========
const getByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await SkillInterviewAssessmentService.getAssessmentsByCandidate(
      candidateId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Retrieve by interviewer ==========
const getByInterviewer = async (req, res) => {
  try {
    const { interviewerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await SkillInterviewAssessmentService.getAssessmentsByInterviewer(
      interviewerId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== PUT - Update assessment ==========
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assessment = await SkillInterviewAssessmentService.updateAssessment(id, updateData);

    return res.status(200).json({
      success: true,
      message: 'Assessment updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating assessment:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ========== DELETE - Delete assessment ==========
const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await SkillInterviewAssessmentService.deleteAssessment(id);

    return res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting assessment:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ========== PATCH - Archive assessment ==========
const archive = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await SkillInterviewAssessmentService.archiveAssessment(id);

    return res.status(200).json({
      success: true,
      message: 'Assessment archived successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error archiving assessment:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Get assessment summary ==========
const getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await SkillInterviewAssessmentService.getAssessmentSummary(id);

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error retrieving summary:', error);
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

// ========== GET - Get global statistics ==========
const getStatistics = async (req, res) => {
  try {
    const statistics = await SkillInterviewAssessmentService.getGlobalStatistics();

    return res.status(200).json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error retrieving statistics:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getMy = async (req, res) => {
  try {
    const { page = 1, limit = 10, interviewType} = req.query;

    const filters = {};
    if (interviewType) filters.interviewType = interviewType;
    filters.candidateId = req.user.profile;

    const result = await SkillInterviewAssessmentService.getAllAssessments(
      parseInt(page),
      parseInt(limit),
      filters
    );

    return res.status(200).json({
      success: true,
      message: 'Assessments retrieved successfully',
      ...result
    });
  } catch (error) {
    console.error('Error in getAll:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

module.exports = {
  create,
  getAll,
  getMy,
  getById,
  getBySessionId,
  getByCandidate,
  getByInterviewer,
  update,
  deleteAssessment,
  archive,
  getSummary,
  getStatistics
};
