const skillInterviewService = require('./skill-interview.service');
const logger = require('../../../utils/logger');

/**
 * Persist skill interview results into SkillInterviewAssessment and update Profile.
 * Called by the shared socket controller when a TECHNICAL_SKILL session ends.
 */
async function persistSkillInterviewResults(sessionId, result, socket) {
  const { candidateId, interviewConfig } = socket;

  if (!candidateId) {
    logger.info('Anonymous skill interview — skipping persistence', { sessionId });
    return;
  }

  const ctx = interviewConfig?.context || {};

  const data = {
    candidateId,
    skill:     ctx.skill     || interviewConfig?.targetRole || 'Unknown',
    skillType: ctx.skillType || 'technical',
    category:  ctx.category  || '',
    interviewData: {
      sessionId,
      interviewType: 'TECHNICAL_SKILL',
      finalReport:   result?.finalReport,
      analytics:     result?.sessionAnalytics,
      conversation:  result?.conversation || [],
    },
  };

  try {
    await skillInterviewService.createAssessment(data, result, candidateId);
    logger.info('Skill interview results saved', { sessionId, candidateId });
  } catch (err) {
    logger.error('Failed to save skill interview results', { sessionId, err: err.message });
    throw err;
  }
}

module.exports = { persistSkillInterviewResults };
