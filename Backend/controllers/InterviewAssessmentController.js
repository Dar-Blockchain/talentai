const InterviewAssessmentService = require('../services/InterviewAssessmentService');
const interviewRewardService = require('../services/interviewRewardService');
const InterviewAssessment = require('../models/InterviewAssessmentModel');
const Profile = require('../models/ProfileModel');

// POST - Create a new assessment
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

    // Ensure candidateId is set - use from body or get from user's profile
    if (!data.candidateId && userId) {
      const Profile = require('../models/ProfileModel');
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

    // Extract metadata and raw interview data
    const metadata = data.metadata;
    const rawInterviewData = data.interviewData;

    const assessment = await InterviewAssessmentService.createAssessment(
      data,
      metadata,
      rawInterviewData,
      userId
    );

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
    const { page, limit, sort, type, candidateId } = req.query;

    const result = await InterviewAssessmentService.getAllAssessmentsWithPagination({
      page,
      limit,
      sort,
      type,
      candidateId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAll:', error);
    return res.status(500).json({ message: 'Internal server error' });
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
    const metadata = req.body.metadata;

    const assessment = await InterviewAssessmentService.updateAssessment(
      id,
      updateData,
      metadata
    );

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

// POST - Claim interview reward (manual)
const claimInterviewReward = async (req, res) => {
  try {
    const interviewId = req.params.id;
    const userId = req.user?._id;

    console.log(`🎯 Manual claim request for interview ${interviewId} by user ${userId}`);

    // Load the assessment
    const interview = await InterviewAssessment.findById(interviewId);
    if (!interview) {
      console.log(`Interview not found: ${interviewId}`);
      return res.status(404).json({ success: false, error: 'Interview not found' });
    }

    // Verify ownership: find profile for this user
    const userProfile = await Profile.findOne({ userId });
    if (!userProfile) {
      console.log(`User profile not found for user ${userId}`);
      return res.status(403).json({ success: false, error: 'User profile not found' });
    }

    if (interview.candidateId?.toString() !== userProfile._id.toString()) {
      console.log(`Unauthorized claim attempt by user ${userId} for interview ${interviewId}`);
      return res.status(403).json({ success: false, error: 'Not authorized to claim this reward' });
    }

    // Check if reward already claimed
    const claimStatus = await interviewRewardService.checkRewardClaimed(userId, interviewId);
    if (claimStatus.claimed) {
      console.log('Reward already claimed');
      return res.status(400).json({ success: false, error: 'Reward already claimed for this interview', transaction: claimStatus.transaction });
    }

    // Determine score (fallbacks applied)
    const score = interview.interviewData?.finalReport?.scores?.overall || 0;

    // Distribute reward
    const rewardResult = await interviewRewardService.distributeInterviewReward(userId, score, interviewId);

    if (rewardResult.success) {
      console.log(`Manual claim successful: ${rewardResult.amount} TAI`);
      return res.status(200).json({ success: true, message: 'Reward claimed successfully', reward: rewardResult });
    }

    console.log(`Manual claim failed: ${rewardResult.error}`);
    return res.status(400).json({ success: false, error: rewardResult.error, canRetry: rewardResult.canRetry, requiresWallet: rewardResult.requiresWallet });

  } catch (error) {
    console.error('Error in manual claim:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while claiming reward', message: error.message });
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
  claimInterviewReward,
  getStatistics
};
