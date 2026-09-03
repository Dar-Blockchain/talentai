const Profile          = require('../../../features/users/profile.model');
const ProfileSkill     = require('../../../features/skills/profile-skill.model');
const SkillInterviewAssessment = require('./skill-interview.model');

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

    const candidateId = data.candidateId; // User._id, as sent by the interview socket

    // The schema's candidateId field is a Profile ref (and every read path —
    // GET /my, GET /:id populate — queries/populates it as a Profile id), so
    // resolve the Profile *before* saving and store that id, not the raw
    // User id we were handed. Storing the User id here made "my assessments"
    // permanently return empty for every candidate.
    let profileId = null;
    if (candidateId) {
      const profile = await Profile.findOne({ userId: candidateId }).select('_id');
      if (!profile) {
        console.warn(`Profile not found for userId ${candidateId}`);
        throw new Error(`Profile not found for candidate: ${candidateId}`);
      }
      profileId = profile._id;
    }

    const assessment = new SkillInterviewAssessment({
      ...data,
      ...(profileId && { candidateId: profileId }),
      proficiency: experienceLevel,
    });
    const savedAssessment = await assessment.save();

    // If candidate exists, handle profile updates and remove previous assessments
    if (profileId) {
      // Determine skill name from data (fallback to Unknown Skill)
      const skillName = data.skill || 'Unknown Skill';

      const previousAssessments = await SkillInterviewAssessment.find({
        candidateId: profileId,
        skill: skillName,
        _id: { $ne: savedAssessment._id }
      }).select('_id');

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

      // Anchor the rolling quota-reset window to the FIRST test of the cycle.
      // When quota just went 0 -> 1 this is the start of a new window, so
      // stamp quotaUpdatedAt now -- the cron (reset-quota.cron.js) clears the
      // quota QUOTA_RESET_DAYS after this timestamp, and profile.service.js
      // derives the candidate-facing quotaResetAt from it. Later tests in the
      // same cycle must not touch it, or the window would never elapse.
      if (updatedProfile.quota === 1) {
        const now = new Date();
        await Profile.updateOne({ _id: profileId }, { $set: { quotaUpdatedAt: now } });
        updatedProfile.quotaUpdatedAt = now;
      }


      // Handle skill type - manage technical vs soft skills
      const skillType = data.skillType || 'technical';

      if (skillType === 'soft') {
        await ProfileSkill.findOneAndUpdate(
          { profile: profileId, kind: 'soft', name: skillName },
          {
            $set: {
              category:       data.category || '',
              proficiencyLevel,
              experienceLevel,
              testScore:      overallScore,
              levelConfirmed: levelconfirmedValue,
            },
            // Was missing here (only incremented for technical below) --
            // testScore defaults to 0 in the schema, identical to a genuine
            // 0% result, so numberTestPassed is the only reliable "has this
            // skill actually been tested" signal for BOTH kinds.
            $inc:         { numberTestPassed: 1 },
            $setOnInsert: { sourceCvAnalyses: [] },
          },
          { upsert: true, new: true }
        );
      } else {
        await ProfileSkill.findOneAndUpdate(
          { profile: profileId, kind: 'technical', name: skillName },
          {
            $set: {
              proficiencyLevel,
              experienceLevel,
              testScore:      overallScore,
              levelConfirmed: levelconfirmedValue,
            },
            $inc:         { numberTestPassed: 1 },
            $setOnInsert: { sourceCvAnalyses: [] },
          },
          { upsert: true, new: true }
        );
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
