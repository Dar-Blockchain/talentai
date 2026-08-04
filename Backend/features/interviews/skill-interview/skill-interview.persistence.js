const skillInterviewService = require('./skill-interview.service');
const logger = require('../../../utils/logger');

/**
 * Persist skill interview results into SkillInterviewAssessment and update Profile.
 * Called by the shared socket controller when a TECHNICAL_SKILL session ends.
 */
async function persistSkillInterviewResults(sessionId, result, socket) {
  const { candidateId, interviewConfig } = socket;

  if (!candidateId) {
    return;
  }

  const ctx = interviewConfig?.context || {};

  const data = {
    candidateId,
    skill:     ctx.targetRole || interviewConfig?.pipelineConfig?.skills?.[0]?.name || 'Unknown',
    skillType: interviewConfig?.interviewType === 'SOFT_SKILL' ? 'soft' : 'technical',
    category:  interviewConfig?.pipelineConfig?.categories?.[0] || '',
    interviewData: {
      sessionId,
      interviewType: 'TECHNICAL_SKILL',
      finalReport:   result?.finalReport,
      analytics:     result?.sessionAnalytics,
      conversation:  result?.conversation || [],
    },
  };

  try {
    const assessment = await skillInterviewService.createAssessment(data, result, candidateId);
    return { assessmentId: assessment?._id ?? null };
  } catch (err) {
    logger.error('Failed to save skill interview results', { sessionId, err: err.message });
    throw err;
  }
}

module.exports = { persistSkillInterviewResults };
