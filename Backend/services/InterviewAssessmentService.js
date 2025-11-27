const InterviewAssessment = require('../models/InterviewAssessmentModel');

// Create a new assessment
const createAssessment = async (data) => {
  try {
    const assessment = new InterviewAssessment(data);
    return await assessment.save();
  } catch (error) {
    throw new Error(`Error creating assessment: ${error.message}`);
  }
};

// Get assessment by ID
const getAssessmentById = async (id) => {
  try {
    const assessment = await InterviewAssessment.findById(id)
      .populate('candidateId')
      .populate('interviewerId');
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    throw new Error(`Error retrieving assessment: ${error.message}`);
  }
};

// Get assessment by sessionId
const getAssessmentBySessionId = async (sessionId) => {
  try {
    const assessment = await InterviewAssessment.findOne({ 'interviewData.sessionId': sessionId })
      .populate('candidateId')
      .populate('interviewerId');
    if (!assessment) {
      throw new Error('Assessment not found for this session');
    }
    return assessment;
  } catch (error) {
    throw new Error(`Error retrieving assessment: ${error.message}`);
  }
};

// Get all assessments with pagination
const getAllAssessments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = buildQuery(filters);

    const assessments = await InterviewAssessment.find(query)
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewAssessment.countDocuments(query);

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error retrieving assessments: ${error.message}`);
  }
};

// Get assessments by candidate
const getAssessmentsByCandidate = async (candidateId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const assessments = await InterviewAssessment.find({ candidateId })
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewAssessment.countDocuments({ candidateId });

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error retrieving assessments: ${error.message}`);
  }
};

// Get assessments by skill
const getAssessmentsBySkill = async (skill, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const assessments = await InterviewAssessment.find({ 'metadata.skill': skill })
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await InterviewAssessment.countDocuments({ 'metadata.skill': skill });

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Error retrieving assessments: ${error.message}`);
  }
};

// Update assessment
const updateAssessment = async (id, updateData) => {
  try {
    const assessment = await InterviewAssessment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('candidateId')
      .populate('interviewerId');

    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    throw new Error(`Error updating assessment: ${error.message}`);
  }
};

// Update status
const updateStatus = async (id, status) => {
  try {
    const validStatuses = ['draft', 'in-progress', 'completed', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Accepted values: ${validStatuses.join(', ')}`);
    }

    const assessment = await InterviewAssessment.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    throw new Error(`Error updating status: ${error.message}`);
  }
};

// Delete assessment
const deleteAssessment = async (id) => {
  try {
    const assessment = await InterviewAssessment.findByIdAndDelete(id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return { message: 'Assessment deleted successfully' };
  } catch (error) {
    throw new Error(`Error deleting assessment: ${error.message}`);
  }
};

// Archive assessment
const archiveAssessment = async (id) => {
  try {
    const assessment = await InterviewAssessment.findByIdAndUpdate(
      id,
      { status: 'archived', updatedAt: new Date() },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    throw new Error(`Error archiving assessment: ${error.message}`);
  }
};

// Get assessment summary
const getAssessmentSummary = async (id) => {
  try {
    const assessment = await InterviewAssessment.findById(id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment.getSummary();
  } catch (error) {
    throw new Error(`Error retrieving summary: ${error.message}`);
  }
};

// Get global statistics
const getGlobalStatistics = async () => {
  try {
    const totalAssessments = await InterviewAssessment.countDocuments();
    const completedAssessments = await InterviewAssessment.countDocuments({ status: 'completed' });
    const draftAssessments = await InterviewAssessment.countDocuments({ status: 'draft' });
    const inProgressAssessments = await InterviewAssessment.countDocuments({ status: 'in-progress' });
    const archivedAssessments = await InterviewAssessment.countDocuments({ status: 'archived' });

    const averageScore = await InterviewAssessment.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$interviewData.finalReport.scores.overall' }
        }
      }
    ]);

    const assessmentsBySkill = await InterviewAssessment.aggregate([
      {
        $group: {
          _id: '$metadata.skill',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const assessmentsByProficiency = await InterviewAssessment.aggregate([
      {
        $group: {
          _id: '$metadata.proficiency',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalAssessments,
      byStatus: {
        completed: completedAssessments,
        draft: draftAssessments,
        inProgress: inProgressAssessments,
        archived: archivedAssessments
      },
      averageScore: averageScore[0]?.avgScore || 0,
      bySkill: assessmentsBySkill,
      byProficiency: assessmentsByProficiency
    };
  } catch (error) {
    throw new Error(`Error retrieving statistics: ${error.message}`);
  }
};

// Build query with filters
const buildQuery = (filters) => {
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.skill) {
    query['metadata.skill'] = filters.skill;
  }

  if (filters.proficiency) {
    query['metadata.proficiency'] = filters.proficiency;
  }

  if (filters.interviewType) {
    query['interviewData.interviewType'] = filters.interviewType;
  }

  if (filters.candidateId) {
    query.candidateId = filters.candidateId;
  }

  if (filters.interviewerId) {
    query.interviewerId = filters.interviewerId;
  }

  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  return query;
};

module.exports = {
  createAssessment,
  getAssessmentById,
  getAssessmentBySessionId,
  getAllAssessments,
  getAssessmentsByCandidate,
  getAssessmentsBySkill,
  updateAssessment,
  updateStatus,
  deleteAssessment,
  archiveAssessment,
  getAssessmentSummary,
  getGlobalStatistics
};
