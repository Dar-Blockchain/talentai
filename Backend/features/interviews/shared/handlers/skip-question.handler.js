const { withTimeout, safeEmit, AI_TIMEOUT_MS, resetInterTurnPauseTimer, startIntelligentSilenceMonitoring } = require('../interview.utils');
const { handleAIDecision } = require('./decision.handler');
const logger = require('../../../../utils/logger');

async function handleSkipQuestion(socket, { service, processing, onSessionEnded }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  if (processing.has(sessionId)) {
    logger.warn('Skip ignored â€” AI call in progress', { sessionId });
    return;
  }
  processing.add(sessionId);

  try {
    logger.info('Question skipped', { sessionId });
    safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });
    resetInterTurnPauseTimer(socket, sessionId);

    const decision = await withTimeout(
      service.processCandidateResponseIntelligently(sessionId, '[SKIPPED]', { skipped: true }),
      AI_TIMEOUT_MS,
      'processCandidateResponseIntelligently (skip)',
    );

    await handleAIDecision(socket, sessionId, decision, { service, onSessionEnded });

    safeEmit(socket, 'response_processed', {
      status: 'success', transcript: '[SKIPPED]',
      decisionType: decision.type || 'continue', timestamp: new Date().toISOString(),
    });

    startIntelligentSilenceMonitoring(socket, sessionId, decision, service);
  } catch (error) {
    logger.error('Failed to process skip', { sessionId, err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to skip question', message: error.message });
  } finally {
    processing.delete(sessionId);
  }
}

module.exports = { handleSkipQuestion };
