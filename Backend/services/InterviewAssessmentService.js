const InterviewAssessment = require('../models/InterviewAssessmentModel');
const Profile = require('../models/ProfileModel');

// Type translation map for metadata.type
const urlTypeMap = {
  "technical": "skill",
  "soft": "soft",
  "onboarding": "onboarding",
  "hr": "hr",
};

function getLevelFromScore(score) {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
}

function getExperienceLabel(level) {
  const map = {
    1: 'Entry Level',
    2: 'Junior',
    3: 'Mid Level',
    4: 'Senior',
    5: 'Expert',
  };
  return map[level] || 'Unknown Level';
}

// Create a new assessment
const createAssessment = async (data, metadata, rawInterviewData, userId) => {
  try {
    // Translate metadata.type before saving to database
    if (data.metadata && data.metadata.type) {
      const rawType = data.metadata.type.toLowerCase();
      data.metadata.type = urlTypeMap[rawType] || rawType;
    }

    const assessment = new InterviewAssessment(data);
    const savedAssessment = await assessment.save();

    // Get the candidate ID from data
    const candidateId = data.candidateId;
    console.log('Candidate ID from data:', candidateId);
    console.log('Assessment saved:', savedAssessment._id);
    
    // If candidate exists, handle profile updates and remove previous assessments
    if (candidateId) {
      // Determine skill name from metadata (fallback to Unknown Skill)
      const skillName = metadata?.skill || 'Unknown Skill';

      // Find any existing assessments for same candidate and same skill (exclude the newly saved one)
      const previousAssessments = await InterviewAssessment.find({
        candidateId,
        'metadata.skill': skillName,
        _id: { $ne: savedAssessment._id }
      }).select('_id');

      const previousIds = previousAssessments.map(a => a._id);
      const previousDeletedCount = previousIds.length;

      if (previousDeletedCount > 0) {
        // Delete previous assessments
        await InterviewAssessment.deleteMany({ _id: { $in: previousIds } });
        console.log(`Deleted ${previousDeletedCount} previous assessment(s) for skill "${skillName}" and candidate ${candidateId}`);
      }

      // Create skill object from metadata (used later)
      const skillNameFromMeta = skillName;
      const overallScore = rawInterviewData?.finalReport?.coverage?.overall || 0;

      const proficiencyLevel = getLevelFromScore(overallScore);

      const experienceLevel = getExperienceLabel(proficiencyLevel);

      const skill = {
        name: skillNameFromMeta,
        proficiencyLevel: proficiencyLevel,
        experienceLevel: experienceLevel,
        NumberTestPassed: 1,
        ScoreTest: overallScore,
        Levelconfirmed: proficiencyLevel - 1,
      };

      // Update profile interviewDetails and quota.
      // Note: MongoDB/Mongoose can raise a conflict when $push and $pull modify the same array in one update.
      // To avoid that, perform $pull first (if needed), then $push/$inc in a separate update.
      let updatedProfile = null;

      if (previousDeletedCount > 0) {
        // Remove references to deleted assessments first
        await Profile.findByIdAndUpdate(candidateId, { $pull: { interviewDetails: { $in: previousIds } } });

        // Then push the new assessment id. Do not increment quota for a replacement.
        updatedProfile = await Profile.findByIdAndUpdate(
          candidateId,
          { $push: { interviewDetails: savedAssessment._id } },
          { new: true }
        );
      } else {
        // No previous assessments deleted: increment quota and push the interview reference
        updatedProfile = await Profile.findByIdAndUpdate(
          candidateId,
          { $inc: { quota: 1 }, $push: { interviewDetails: savedAssessment._id } },
          { new: true }
        );
      }

      if (!updatedProfile) {
        console.warn(`Profile with ID ${candidateId} not found`);
        throw new Error(`Profile not found for candidate: ${candidateId}`);
      }

      console.log(`Profile updated: Quota incremented (if applicable), Interview added`);
      console.log(`Updated profile quota: ${updatedProfile.quota}`);

      // Handle skill type - translate using urlTypeMap
      const rawType = (metadata?.type || '').toLowerCase();
      const translatedType = urlTypeMap[rawType] || rawType;
      
      if (translatedType === 'soft') {
        const softSkill = {
          name: skillNameFromMeta,
          category: metadata?.category || '',
          proficiencyLevel: proficiencyLevel,
          experienceLevel: experienceLevel,
          ScoreTest: overallScore,
          Levelconfirmed: proficiencyLevel - 1,
        };

        // Check if soft skill exists
        const existingSoft = await Profile.findOne(
          { _id: candidateId, 'softSkills.name': skillNameFromMeta },
          { 'softSkills.$': 1 }
        );

        if (existingSoft && existingSoft.softSkills.length > 0) {
          // Update existing soft skill
          await Profile.findByIdAndUpdate(
            candidateId,
            {
              $inc: { quota: 1 },
              $set: {
                'softSkills.$[elem].ScoreTest': overallScore,
                'softSkills.$[elem].proficiencyLevel': proficiencyLevel,
                'softSkills.$[elem].experienceLevel': experienceLevel,
                'softSkills.$[elem].Levelconfirmed': proficiencyLevel - 1,
              },
            },
            {
              arrayFilters: [{ 'elem.name': skillNameFromMeta }],
              new: true,
            }
          );
          console.log(`Soft skill "${skillNameFromMeta}" updated`);
        } else {
          // Add new soft skill
          await Profile.findByIdAndUpdate(
            candidateId,
            { $inc: { quota: 1 },$addToSet: { softSkills: softSkill } },
            { new: true }
          );
          console.log(`Soft skill "${skillNameFromMeta}" added`);
        }
      } else {
        // Hard skill logic (for 'skill', 'onboarding', 'hr', etc.)
        const existingSkill = await Profile.findOne(
          { _id: candidateId, 'skills.name': skillNameFromMeta },
          { 'skills.$': 1 }
        );

        if (existingSkill && existingSkill.skills.length > 0) {
          // If we deleted previous assessments (this is a replacement), reset NumberTestPassed to 1,
          // otherwise increment the counter by 1.
          if (previousDeletedCount > 0) {
            await Profile.findByIdAndUpdate(
              candidateId,
              {
                $inc: { quota: 1 },
                $set: {
                  'skills.$[elem].NumberTestPassed': 1,
                  'skills.$[elem].ScoreTest': overallScore,
                  'skills.$[elem].proficiencyLevel': proficiencyLevel,
                  'skills.$[elem].experienceLevel': experienceLevel,
                  'skills.$[elem].Levelconfirmed': proficiencyLevel - 1,
                },
              },
              {
                arrayFilters: [{ 'elem.name': skillNameFromMeta }],
                new: true,
              }
            );
            console.log(`Skill "${skillNameFromMeta}" updated (replaced) - NumberTestPassed reset to 1`);
          } else {
            // Update existing skill (increment tests passed)
            await Profile.findByIdAndUpdate(
              candidateId,
              {
                $inc: { 'skills.$[elem].NumberTestPassed': 1 },
                $set: {
                  'skills.$[elem].ScoreTest': overallScore,
                  'skills.$[elem].proficiencyLevel': proficiencyLevel,
                  'skills.$[elem].experienceLevel': experienceLevel,
                  'skills.$[elem].Levelconfirmed': proficiencyLevel - 1,
                },
              },
              {
                arrayFilters: [{ 'elem.name': skillNameFromMeta }],
                new: true,
              }
            );
            console.log(`Skill "${skillNameFromMeta}" updated - NumberTestPassed incremented`);
          }
        } else {
          // Add new skill
          await Profile.findByIdAndUpdate(
            candidateId,
            { $inc: { quota: 1 },$addToSet: { skills: skill } },
            { new: true }
          );
          console.log(`Skill "${skillNameFromMeta}" added as new`);
        }
      }
      // End candidate-related handling
      return await getAssessmentById(savedAssessment._id);
    }
    // If there's no candidateId, just return saved assessment
    return await getAssessmentById(savedAssessment._id);
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
const updateAssessment = async (id, updateData, metadata) => {
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

    // Update profile if metadata provided
    if (metadata && assessment.candidateId) {
      const candidateId = assessment.candidateId._id;
      const skillName = metadata?.skill || 'Unknown Skill';
      const experienceLevel = metadata?.proficiency || 'NoLevel';
      const overallScore = updateData?.interviewData?.finalReport?.scores?.overall || 0;

      const experienceLevelMap = {
        'Entry Level': 1,
        'Junior': 2,
        'Mid Level': 3,
        'Senior': 4,
        'Expert': 5,
      };
      const proficiencyLevel = experienceLevelMap[experienceLevel] || 0;

      const rawType = (metadata?.type || '').toLowerCase();
      const translatedType = urlTypeMap[rawType] || rawType;

      if (translatedType === 'soft') {
        await Profile.findByIdAndUpdate(
          candidateId,
          {
            $set: {
              'softSkills.$[elem].ScoreTest': overallScore,
              'softSkills.$[elem].proficiencyLevel': proficiencyLevel,
            },
          },
          {
            arrayFilters: [{ 'elem.name': skillName }],
            new: true,
          }
        );
      } else {
        await Profile.findByIdAndUpdate(
          candidateId,
          {
            $set: {
              'skills.$[elem].ScoreTest': overallScore,
              'skills.$[elem].proficiencyLevel': proficiencyLevel,
            },
          },
          {
            arrayFilters: [{ 'elem.name': skillName }],
            new: true,
          }
        );
      }
    }

    return await getAssessmentById(assessment._id);
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

// Get all assessments with pagination, filtering, and sorting
const getAllAssessmentsWithPagination = async ({
  page = 1,
  limit = 10,
  sort = '-createdAt',
  type,
  candidateId
}) => {
  try {
    const query = {};

    if (type) query['metadata.type'] = type;
    if (candidateId) query.candidateId = candidateId;

    const skip = (page - 1) * limit;

    const [results, total] = await Promise.all([
      InterviewAssessment.find(query)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('candidateId', 'firstName lastName email')
        .populate('interviewerId', 'firstName lastName email')
        .exec(),
      InterviewAssessment.countDocuments(query),
    ]);

    return {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      results,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    throw new Error(`Error retrieving assessments: ${error.message}`);
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
  getGlobalStatistics,
  getAllAssessmentsWithPagination
};
