const Profile      = require('../../../features/users/profile.model');
const ProfileSkill = require('../../../features/skills/profile-skill.model');
const SkillInterviewAssessment = require('./skill-interview.model');

// ── Proficiency from overall score ───────────────────────────────────────────

const PROFICIENCY_LABELS = ['Entry Level', 'Junior', 'Mid Level', 'Senior', 'Expert'];

/** score 0-100 -> { level: 1-5, label } */
const scoreToProficiency = (score) => {
  const level = score >= 80 ? 5 : score >= 60 ? 4 : score >= 40 ? 3 : score >= 20 ? 2 : 1;
  return { level, label: PROFICIENCY_LABELS[level - 1] };
};

// ── Small persistence helpers ────────────────────────────────────────────────

/**
 * The socket hands us a User._id, but the schema's candidateId is a Profile ref
 * and every read path populates it as a Profile — resolve it before saving.
 * (Storing the raw User id made "my assessments" always return empty.)
 */
const resolveProfileId = async (userId) => {
  const profile = await Profile.findOne({ userId }).select('_id').lean();
  if (!profile) throw new Error(`Profile not found for candidate: ${userId}`);
  return profile._id;
};

/** Keep one assessment per (candidate, skill): drop the older ones. */
const replacePreviousAssessments = async (profileId, skillName, keepId) => {
  const stale = await SkillInterviewAssessment
    .find({ candidateId: profileId, skill: skillName, _id: { $ne: keepId } })
    .select('_id').lean();
  if (!stale.length) return;

  const ids = stale.map((a) => a._id);
  await SkillInterviewAssessment.deleteMany({ _id: { $in: ids } });
  // Mongo can't $pull and $push the same array path in one update, so pull
  // the stale ids here and push the new one separately (see chargeQuota).
  await Profile.findByIdAndUpdate(profileId, { $pull: { interviewDetails: { $in: ids } } });
};

/** Count this test against the candidate's quota and link the assessment. */
const chargeQuota = async (profileId, assessmentId) => {
  const profile = await Profile.findByIdAndUpdate(
    profileId,
    { $inc: { quota: 1 }, $push: { interviewDetails: assessmentId } },
    { new: true },
  );

  // First test of a cycle: anchor the rolling reset window. reset-quota.cron.js
  // zeroes the quota QUOTA_RESET_DAYS after quotaUpdatedAt and profile.service.js
  // surfaces that date to the candidate; later tests in the cycle must not move it.
  if (profile?.quota === 1) {
    await Profile.updateOne({ _id: profileId }, { $set: { quotaUpdatedAt: new Date() } });
  }
};

/**
 * Upsert the candidate's ProfileSkill row from this test result.
 * numberTestPassed is the source of truth for "has this skill been tested" —
 * testScore defaults to 0, indistinguishable from a genuine 0% (bug-017).
 */
const upsertProfileSkill = ({ profileId, kind, name, category, score, level }) =>
  ProfileSkill.findOneAndUpdate(
    { profile: profileId, kind, name },
    {
      $set: {
        category:         category || '',
        proficiencyLevel: level,
        experienceLevel:  PROFICIENCY_LABELS[level - 1],
        testScore:        score,
        levelConfirmed:   score > 80 ? level : level - 1,
      },
      $inc:         { numberTestPassed: 1 },
      $setOnInsert: { sourceCvAnalyses: [] },
    },
    { upsert: true },
  );

// ── Create ───────────────────────────────────────────────────────────────────

/**
 * Save one assessment and apply its side effects (replace older assessments for
 * the same skill, charge quota, upsert the ProfileSkill row).
 * Idempotent per session.
 *
 * @param {object} data   - assessment payload (candidateId is a User._id)
 * @param {object} result - raw engine result ({ finalReport, ... })
 */
const createAssessment = async (data, result) => {
  try {
    const sessionId = data.interviewData?.sessionId ?? result?.sessionId;
    if (sessionId) {
      const existing = await SkillInterviewAssessment
        .findOne({ 'interviewData.sessionId': sessionId }).select('_id').lean();
      if (existing) return getAssessmentById(existing._id);
    }

    const score = result?.finalReport?.coverage?.overall || 0;
    const { level, label } = scoreToProficiency(score);
    const profileId = data.candidateId ? await resolveProfileId(data.candidateId) : null;

    const assessment = await new SkillInterviewAssessment({
      ...data,
      ...(profileId && { candidateId: profileId }),
      proficiency: label,
    }).save();

    if (profileId) {
      const skillName = data.skill || 'Unknown Skill';
      const kind = data.skillType === 'soft' ? 'soft' : 'technical';

      await replacePreviousAssessments(profileId, skillName, assessment._id);
      await chargeQuota(profileId, assessment._id);
      await upsertProfileSkill({ profileId, kind, name: skillName, category: data.category, score, level });
    }

    return getAssessmentById(assessment._id);
  } catch (error) {
    console.error('Error creating skill interview assessment:', error.message);
    throw error;
  }
};

/**
 * Build the assessment payload from a finished socket session and save it.
 * Called by the shared interview socket (interview.socket.js -> onSessionEnded)
 * when a TECHNICAL_SKILL / SOFT_SKILL session ends.
 */
const persistSkillInterviewResults = async (sessionId, result, socket) => {
  const { candidateId, interviewConfig } = socket;
  if (!candidateId) return;

  const cfg = interviewConfig || {};
  const data = {
    candidateId,
    skill:     cfg.context?.targetRole || cfg.pipelineConfig?.skills?.[0]?.name || 'Unknown',
    skillType: cfg.interviewType === 'SOFT_SKILL' ? 'soft' : 'technical',
    category:  cfg.pipelineConfig?.categories?.[0] || '',
    interviewData: {
      sessionId,
      finalReport:      result?.finalReport,
      analytics:        result?.sessionAnalytics,
      conversation:     result?.conversation || [],
      status:           result?.interrupted ? 'interrupted' : 'completed',
      disconnectReason: result?.interrupted ? result?.disconnectReason : undefined,
    },
  };

  try {
    const assessment = await createAssessment(data, result);
    return { assessmentId: assessment?._id ?? null };
  } catch (err) {
    console.error('Failed to save skill interview results:', sessionId, err.message);
    throw err;
  }
};

// ── Read ─────────────────────────────────────────────────────────────────────

const getAssessmentById = async (id) => {
  const assessment = await SkillInterviewAssessment.findById(id).populate('candidateId').lean();
  if (!assessment) throw new Error('Assessment not found');
  return assessment;
};

/** A candidate's assessments, paginated. */
const getAllAssessments = async (page = 1, limit = 10, filters = {}) => {
  const query = {};
  if (filters.skillType)   query.skillType   = filters.skillType;
  if (filters.candidateId) query.candidateId = filters.candidateId;

  const [data, total] = await Promise.all([
    SkillInterviewAssessment.find(query)
      .populate('candidateId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    SkillInterviewAssessment.countDocuments(query),
  ]);

  const pages = Math.ceil(total / limit);
  return {
    data,
    pagination: { total, page, limit, pages, hasNextPage: page < pages, hasPrevPage: page > 1 },
  };
};

module.exports = {
  createAssessment,
  persistSkillInterviewResults,
  getAssessmentById,
  getAllAssessments,
};
