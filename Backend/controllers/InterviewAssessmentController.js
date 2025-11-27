const InterviewAssessmentService = require('../services/InterviewAssessmentService');

// POST - Create a new assessment
const create = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.interviewData?.sessionId) {
      return res.status(400).json({
        success: false,
        message: 'sessionId is required'
      });
    }

    const assessment = await InterviewAssessmentService.createAssessment(data);

    return res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// GET - Retrieve assessment by ID
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await InterviewAssessmentService.getAssessmentById(id);

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

// GET - Retrieve assessment by sessionId
const getBySessionId = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const assessment = await InterviewAssessmentService.getAssessmentBySessionId(sessionId);

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

// GET - Retrieve all assessments
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filters = {
      status: req.query.status,
      skill: req.query.skill,
      proficiency: req.query.proficiency,
      interviewType: req.query.interviewType,
      candidateId: req.query.candidateId,
      interviewerId: req.query.interviewerId,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await InterviewAssessmentService.getAllAssessments(
      parseInt(page),
      parseInt(limit),
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== undefined))
    );

    return res.status(200).json({
      success: true,
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

// GET - Retrieve assessments by candidate
const getByCandidate = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await InterviewAssessmentService.getAssessmentsByCandidate(
      candidateId,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
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

// GET - Retrieve assessments by skill
const getBySkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const result = await InterviewAssessmentService.getAssessmentsBySkill(
      skill,
      parseInt(page),
      parseInt(limit)
    );

    return res.status(200).json({
      success: true,
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

// PUT - Update assessment
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const assessment = await InterviewAssessmentService.updateAssessment(id, updateData);

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

// PATCH - Update status
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const assessment = await InterviewAssessmentService.updateStatus(id, status);

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: assessment
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE - Delete assessment
const deleteAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await InterviewAssessmentService.deleteAssessment(id);

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

// PATCH - Archive assessment
const archive = async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await InterviewAssessmentService.archiveAssessment(id);

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

// GET - Get assessment summary
const getSummary = async (req, res) => {
  try {
    const { id } = req.params;

    const summary = await InterviewAssessmentService.getAssessmentSummary(id);

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

// GET - Get global statistics
const getStatistics = async (req, res) => {
  try {
    const statistics = await InterviewAssessmentService.getGlobalStatistics();

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

module.exports = {
  create,
  getById,
  getBySessionId,
  getAll,
  getByCandidate,
  getBySkill,
  update,
  updateStatus,
  deleteAssessment,
  archive,
  getSummary,
  getStatistics
};
