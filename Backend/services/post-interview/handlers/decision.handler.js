const { persistInterviewResults } = require('../interviewPersistence.service');
const { safeEmit } = require('../interviewUtils');
const logger = require('../../../utils/logger');

const FALLBACK_CONTENT = {
  end_interview: 'Thank you for your time. This concludes our interview.',
  default:       'Can you tell me more about your experience?',
};

function resolveContent(decision) {
  return decision.content || FALLBACK_CONTENT[decision.action] || FALLBACK_CONTENT.default;
}

async function emitCoverageAndReport(socket, sessionId, service, timestamp) {
  if (!socket.connected) return;
  try {
    const { coverage, realTimeReport } = await service.getSessionStatus(sessionId);
    if (coverage)       safeEmit(socket, 'coverage_update', { coverage, timestamp, sessionId });
    if (realTimeReport) safeEmit(socket, 'report_update',   { report: realTimeReport, timestamp, sessionId });
  } catch (err) {
    logger.warn('Coverage/report update skipped', { sessionId, err: err.message });
  }
}

async function handleAIDecision(socket, sessionId, decision, { service }) {
  try {
    if (!socket.connected) {
      logger.warn('Socket disconnected — decision skipped', { sessionId });
      return;
    }

    const timestamp = new Date().toISOString();
    const content   = resolveContent(decision);

    switch (decision.action) {
      case 'immediate_intervention':
        safeEmit(socket, 'interviewer_message', {
          type: 'intervention', subtype: decision.interventionType,
          content, reasoning: decision.reasoning, urgency: decision.urgency,
          timestamp, sessionId,
        });
        logger.info('Intervention emitted', { sessionId, type: decision.interventionType, urgency: decision.urgency });
        break;

      case 'continue_probing':
      case 'question':
        safeEmit(socket, 'interviewer_message', {
          type: 'question', content, reasoning: decision.reasoning,
          nextFocus: decision.nextFocus, timestamp, sessionId,
        });
        break;

      case 'probe_deeper':
        safeEmit(socket, 'interviewer_message', {
          type: 'follow_up', content, reasoning: decision.reasoning, timestamp, sessionId,
        });
        break;

      case 'change_topic':
        safeEmit(socket, 'topic_change',        { newTopic: decision.nextFocus, reason: decision.reasoning, timestamp, sessionId });
        safeEmit(socket, 'interviewer_message', { type: 'new_topic', content, topic: decision.nextFocus, timestamp, sessionId });
        break;

      case 'wrap_up':
        safeEmit(socket, 'interview_wrap_up', { message: content, reasoning: decision.reasoning, timestamp, sessionId });
        break;

      case 'end_interview':
        safeEmit(socket, 'interviewer_message', { type: 'end_interview', content, reasoning: decision.reasoning, timestamp, sessionId });
        try {
          const result = await service.endInterview(sessionId);
          persistInterviewResults(sessionId, result, socket.candidateId, socket.postId);
          safeEmit(socket, 'interview_ended', { finalReport: result.finalReport, analytics: result.sessionAnalytics, sessionId });
        } catch (endErr) {
          logger.warn('Auto-end failed in decision handler', { sessionId, err: endErr.message });
        }
        break;

      default:
        logger.warn('Unknown decision action — fallback emitted', { sessionId, action: decision.action });
        safeEmit(socket, 'interviewer_message', { type: 'question', content, timestamp, sessionId });
    }

    await emitCoverageAndReport(socket, sessionId, service, timestamp);
  } catch (error) {
    logger.error('Failed to handle AI decision', { sessionId, err: error.message });
    if (socket.connected) {
      safeEmit(socket, 'interview_error', { error: 'Failed to process AI decision', message: error.message });
    }
  }
}

module.exports = { handleAIDecision };
