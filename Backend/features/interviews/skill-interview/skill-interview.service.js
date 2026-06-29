const Profile = require('../../../features/users/profile.model');
const SkillInterviewAssessment = require('./skill-interview.model')

// ========== HELPER - Functions for score calculation ==========
const getLevelFromScore = (score) => {
  if (score < 20) return 1;
  if (score < 40) return 2;
  if (score < 60) return 3;
  if (score < 80) return 4;
  return 5;
};

const getExperienceLabel = (level) => {
  const map = {
    1: 'Entry Level',
    2: 'Junior',
    3: 'Mid Level',
    4: 'Senior',
    5: 'Expert',
  };
  return map[level] || 'Unknown Level';
};

// ========== CREATE ==========
const createAssessment = async (data, rawInterviewData, userId) => {
  try {

    // Idempotency: if an assessment already exists for this sessionId, return it
    const sessionId = rawInterviewData?.sessionId;
    if (sessionId) {
      const existing = await SkillInterviewAssessment.findOne({ 'interviewData.sessionId': sessionId }).select('_id');
      if (existing) {
        return await getAssessmentById(existing._id);
      }
    }

    // Calculate proficiency from score before saving so it's part of the document
    const overallScore = rawInterviewData?.finalReport?.coverage?.overall || 0;
    const proficiencyLevel = getLevelFromScore(overallScore);
    const experienceLevel = getExperienceLabel(proficiencyLevel);

    const assessment = new SkillInterviewAssessment({ ...data, proficiency: experienceLevel });
    const savedAssessment = await assessment.save();

    const candidateId = data.candidateId; // User._id

    // If candidate exists, handle profile updates and remove previous assessments
    if (candidateId) {
      // Determine skill name from data (fallback to Unknown Skill)
      const skillName = data.skill || 'Unknown Skill';

      // candidateId is a User._id — resolve the Profile, and look up any prior
      // assessment for the same candidate+skill in parallel (the two queries
      // don't depend on each other's result).
      const [profile, previousAssessments] = await Promise.all([
        Profile.findOne({ userId: candidateId }).select('_id'),
        SkillInterviewAssessment.find({
          candidateId,
          skill: skillName,
          _id: { $ne: savedAssessment._id }
        }).select('_id'),
      ]);
      if (!profile) {
        console.warn(`Profile not found for userId ${candidateId}`);
        throw new Error(`Profile not found for candidate: ${candidateId}`);
      }
      const profileId = profile._id;

      const previousIds = previousAssessments.map(a => a._id);
      const previousDeletedCount = previousIds.length;

      if (previousDeletedCount > 0) {
        await SkillInterviewAssessment.deleteMany({ _id: { $in: previousIds } });
        // Mongo rejects $pull and $push on the same array path in one update,
        // so the stale-id removal has to happen before the new id is pushed.
        await Profile.findByIdAndUpdate(profileId, { $pull: { interviewDetails: { $in: previousIds } } });
      }

      // proficiencyLevel / experienceLevel already calculated above; derive levelconfirmed
      const levelconfirmedValue = overallScore > 80 ? proficiencyLevel : proficiencyLevel - 1;

      const updatedProfile = await Profile.findByIdAndUpdate(
        profileId,
        { $inc: { quota: 1 }, $push: { interviewDetails: savedAssessment._id } },
        { new: true }
      );

      if (!updatedProfile) {
        throw new Error(`Profile not found for candidate: ${candidateId}`);
      }


      // Handle skill type - manage technical vs soft skills
      const skillType = data.skillType || 'technical';

      if (skillType === 'soft') {
        const softSkill = {
          name: skillName,
          category: data.category || '',
          proficiencyLevel,
          experienceLevel,
          ScoreTest: overallScore,
          Levelconfirmed: levelconfirmedValue,
        };

        const existingSoft = await Profile.findOne(
          { _id: profileId, 'softSkills.name': skillName },
          { 'softSkills.$': 1 }
        );

        if (existingSoft && existingSoft.softSkills.length > 0) {
          await Profile.findByIdAndUpdate(
            profileId,
            {
              $set: {
                'softSkills.$[elem].ScoreTest': overallScore,
                'softSkills.$[elem].proficiencyLevel': proficiencyLevel,
                'softSkills.$[elem].experienceLevel': experienceLevel,
                'softSkills.$[elem].Levelconfirmed': levelconfirmedValue,
                'softSkills.$[elem].updatedAt': new Date(),
              },
            },
            { arrayFilters: [{ 'elem.name': skillName }], new: true }
          );
        } else {
          await Profile.findByIdAndUpdate(
            profileId,
            { $addToSet: { softSkills: { ...softSkill, createdAt: new Date(), updatedAt: new Date() } } },
            { new: true }
          );
        }
      } else {
        const technicalSkill = {
          name: skillName,
          category: data.category || '',
          proficiencyLevel,
          experienceLevel,
          NumberTestPassed: 1,
          ScoreTest: overallScore,
          Levelconfirmed: levelconfirmedValue,
        };

        const existingTech = await Profile.findOne(
          { _id: profileId, 'skills.name': skillName },
          { 'skills.$': 1 }
        );

        if (existingTech && existingTech.skills.length > 0) {
          await Profile.findByIdAndUpdate(
            profileId,
            {
              $set: {
                'skills.$[elem].ScoreTest': overallScore,
                'skills.$[elem].proficiencyLevel': proficiencyLevel,
                'skills.$[elem].experienceLevel': experienceLevel,
                'skills.$[elem].NumberTestPassed': (existingTech.skills[0].NumberTestPassed || 0) + 1,
                'skills.$[elem].Levelconfirmed': levelconfirmedValue,
                'skills.$[elem].updatedAt': new Date(),
              },
            },
            { arrayFilters: [{ 'elem.name': skillName }], new: true }
          );
        } else {
          await Profile.findByIdAndUpdate(
            profileId,
            { $addToSet: { skills: { ...technicalSkill, createdAt: new Date(), updatedAt: new Date() } } },
            { new: true }
          );
        }
      }
    }

    return await getAssessmentById(savedAssessment._id);
  } catch (error) {
    console.error('Error creating skill interview assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get by ID ==========
const getAssessmentById = async (id) => {
  try {
    const assessment = await SkillInterviewAssessment.findById(id)
      .populate('candidateId')
      .lean();
    if (!assessment) {
      throw new Error('Assessment not found');
    }
    return assessment;
  } catch (error) {
    console.error('Error retrieving assessment:', error.message);
    throw error;
  }
};

// ========== READ - Get all with pagination ==========
const getAllAssessments = async (page = 1, limit = 10, filters = {}) => {
  try {
    const skip = (page - 1) * limit;
    const query = buildQuery(filters);

    const [assessments, total] = await Promise.all([
      SkillInterviewAssessment.find(query)
        .populate('candidateId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SkillInterviewAssessment.countDocuments(query),
    ]);

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
    console.error('Error retrieving assessments:', error.message);
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

  if (filters.archived === true || filters.archived === 'true') {
    query.archived = true;
  } else if (filters.archived === false || filters.archived === 'false') {
    query.archived = { $ne: true };
  }

  return query;
};

module.exports = {
  createAssessment,
  getAssessmentById,
  getAllAssessments,
};
