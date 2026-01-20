const SkillInterviewAssessment = require('../../models/SkillInterviewAssessmentModel');
const Profile = require('../../models/ProfileModel');

// ========== CREATE ==========
const createAssessment = async (data, rawInterviewData, userId) => {
  try {
    console.log('📝 Creating skill interview assessment:', data);

    // Idempotency: if an assessment already exists for this sessionId, return it
    const sessionId = rawInterviewData?.sessionId;
    if (sessionId) {
      const existing = await SkillInterviewAssessment.findOne({ 'interviewData.sessionId': sessionId }).select('_id');
      if (existing) {
        console.log(`Assessment already exists for sessionId ${sessionId}, returning existing assessment ${existing._id}`);
        return await getAssessmentById(existing._id);
      }
    }

    const assessment = new SkillInterviewAssessment(data);
    const savedAssessment = await assessment.save();

    const candidateId = data.candidateId;
    console.log('Candidate ID from data:', candidateId);
    console.log('✅ Skill interview assessment created:', savedAssessment._id);
    
    // If candidate exists, update profile
    if (candidateId) {
      const overallScore = rawInterviewData?.finalReport?.coverage?.overall || 0;

      // Update profile with interview reference
      const updatedProfile = await Profile.findByIdAndUpdate(
        candidateId,
        { 
          $inc: { quota: 1 }, 
          $push: { interviewDetails: savedAssessment._id } 
        },
        { new: true }
      );

      if (updatedProfile) {
        console.log(`Profile updated: Quota incremented to ${updatedProfile.quota}`);
      }
    }

    return await getAssessmentById(savedAssessment._id);
  } catch (error) {
    console.error('❌ Error creating skill interview assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get by ID ==========
const getAssessmentById = async (id) => {
  try {
    const assessment = await SkillInterviewAssessment.findById(id)
      .populate('candidateId')
      .populate('interviewerId');
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    console.error('❌ Error retrieving assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get by sessionId ==========
const getAssessmentBySessionId = async (sessionId) => {
  try {
    const assessment = await SkillInterviewAssessment.findOne({ 'interviewData.sessionId': sessionId })
      .populate('candidateId')
      .populate('interviewerId');
    if (!assessment) {
      throw new Error('Assessment not found for this session');
    }
    return assessment;
  } catch (error) {
    console.error('❌ Error retrieving assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get all with pagination ==========
const getAllAssessments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = buildQuery(filters);

    const assessments = await SkillInterviewAssessment.find(query)
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SkillInterviewAssessment.countDocuments(query);

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('❌ Error retrieving assessments:', error.message);
    throw error;
  }
};

// ========== READ - Get by candidate ==========
const getAssessmentsByCandidate = async (candidateId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const assessments = await SkillInterviewAssessment.find({ candidateId })
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SkillInterviewAssessment.countDocuments({ candidateId });

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('❌ Error retrieving assessments:', error.message);
    throw error;
  }
};

// ========== READ - Get by interviewer ==========
const getAssessmentsByInterviewer = async (interviewerId, page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const assessments = await SkillInterviewAssessment.find({ interviewerId })
      .populate('candidateId')
      .populate('interviewerId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await SkillInterviewAssessment.countDocuments({ interviewerId });

    return {
      data: assessments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  } catch (error) {
    console.error('❌ Error retrieving assessments:', error.message);
    throw error;
  }
};

// ========== UPDATE - Update assessment ==========
const updateAssessment = async (id, updateData) => {
  try {
    console.log('🔧 Updating skill interview assessment:', id);

    const assessment = await SkillInterviewAssessment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('candidateId')
      .populate('interviewerId');

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    console.log('✅ Skill interview assessment updated');
    return assessment;
  } catch (error) {
    console.error('❌ Error updating assessment:', error.message);
    throw error;
  }
};

// ========== DELETE - Delete assessment ==========
const deleteAssessment = async (id) => {
  try {
    console.log('🗑️ Deleting skill interview assessment:', id);

    const assessment = await SkillInterviewAssessment.findByIdAndDelete(id);

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    console.log('✅ Assessment deleted');
    return { message: 'Assessment deleted successfully' };
  } catch (error) {
    console.error('❌ Error deleting assessment:', error.message);
    throw error;
  }
};

// ========== ARCHIVE - Archive assessment ==========
const archiveAssessment = async (id) => {
  try {
    console.log('📦 Archiving skill interview assessment:', id);

    const assessment = await SkillInterviewAssessment.findByIdAndUpdate(
      id,
      { $set: { updatedAt: new Date() } },
      { new: true }
    );

    if (!assessment) {
      throw new Error('Assessment not found');
    }

    console.log('✅ Assessment archived');
    return assessment;
  } catch (error) {
    console.error('❌ Error archiving assessment:', error.message);
    throw error;
  }
};

// ========== SUMMARY - Get assessment summary ==========
const getAssessmentSummary = async (id) => {
  try {
    const assessment = await SkillInterviewAssessment.findById(id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment.getSummary();
  } catch (error) {
    console.error('❌ Error retrieving summary:', error.message);
    throw error;
  }
};

// ========== STATISTICS - Get global statistics ==========
const getGlobalStatistics = async () => {
  try {
    const totalAssessments = await SkillInterviewAssessment.countDocuments();

    const averageScore = await SkillInterviewAssessment.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$interviewData.finalReport.scores.overall' }
        }
      }
    ]);

    const assessmentsByInterviewType = await SkillInterviewAssessment.aggregate([
      {
        $group: {
          _id: '$interviewData.interviewType',
          count: { $sum: 1 }
        }
      }
    ]);

    const assessmentsBySkillType = await SkillInterviewAssessment.aggregate([
      {
        $group: {
          _id: '$skillType',
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      totalAssessments,
      averageScore: averageScore[0]?.avgScore || 0,
      byInterviewType: assessmentsByInterviewType,
      bySkillType: assessmentsBySkillType
    };
  } catch (error) {
    console.error('❌ Error retrieving statistics:', error.message);
    throw error;
  }
};

// ========== HELPER - Build query with filters ==========
const buildQuery = (filters) => {
  const query = {};

  if (filters.interviewType) {
    query['interviewData.interviewType'] = filters.interviewType;
  }

  if (filters.skillType) {
    query.skillType = filters.skillType;
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
  getAssessmentsByInterviewer,
  updateAssessment,
  deleteAssessment,
  archiveAssessment,
  getAssessmentSummary,
  getGlobalStatistics
};
