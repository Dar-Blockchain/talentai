const { withTimeout, safeEmit, AI_TIMEOUT_MS, RESPONSE_RATE_LIMIT_MS } = require('../interviewUtils');
const { handleAIDecision } = require('../interviewDecisionHandler.service');
const { resetInterTurnPauseTimer, startIntelligentSilenceMonitoring } = require('../silenceMonitor.service');
const logger = require('../../../utils/logger');

async function handleCandidateResponse(socket, data, { service, processing }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  const now = Date.now();
  if (now - socket._lastResponseAt < RESPONSE_RATE_LIMIT_MS) {
    logger.warn('Rate limit hit — response ignored', { sessionId });
    return;
  }
  socket._lastResponseAt = now;

  if (processing.has(sessionId)) {
    logger.warn('Concurrent response rejected', { sessionId });
    return;
  }
  processing.add(sessionId);

  try {
    const { transcript, audioMetadata } = data;
    logger.info('Processing response', { sessionId });

    safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });
    resetInterTurnPauseTimer(socket, sessionId);

    const decision = await withTimeout(
      service.processCandidateResponseIntelligently(sessionId, transcript, audioMetadata),
      AI_TIMEOUT_MS,
      'processCandidateResponseIntelligently',
    );

    await handleAIDecision(socket, sessionId, decision, { service });

    safeEmit(socket, 'response_processed', {
      status: 'success',
      transcript: transcript.substring(0, 100),
      decisionType: decision.type || 'continue',
      timestamp: new Date().toISOString(),
    });

    startIntelligentSilenceMonitoring(socket, sessionId, decision, service);
  } catch (error) {
    logger.error('Failed to process response', { sessionId, err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to process response', message: error.message });
    safeEmit(socket, 'response_processed', { status: 'error', error: error.message, timestamp: new Date().toISOString() });
  } finally {
    processing.delete(sessionId);
  }
}

module.exports = { handleCandidateResponse };
