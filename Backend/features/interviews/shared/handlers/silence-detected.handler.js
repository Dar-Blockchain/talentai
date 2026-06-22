const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleSilenceDetected(socket, data, { service, processing }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  if (processing.has(sessionId)) {
    logger.warn('Silence skip ignored â€” AI call in progress', { sessionId });
    return;
  }
  processing.add(sessionId);

  try {
    const durationSeconds = data?.durationSeconds ?? 60;
    logger.info('Silence detected â€” auto-skipping question', { sessionId, durationSeconds });
    safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });

    const result = await service.handleSilence(sessionId, durationSeconds);

    if (result.action === 'next_question' && result.content) {
      safeEmit(socket, 'interviewer_message', {
        type: 'question',
        content: result.content,
        reasoning: result.reasoning,
        timestamp: new Date().toISOString(),
        sessionId,
        metadata: { silenceDuration: durationSeconds, autoSkip: true },
      });
    }
  } catch (error) {
    logger.error('Failed to handle silence detection', { sessionId, err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to skip on silence', message: error.message });
  } finally {
    processing.delete(sessionId);
  }
}

module.exports = { handleSilenceDetected };
