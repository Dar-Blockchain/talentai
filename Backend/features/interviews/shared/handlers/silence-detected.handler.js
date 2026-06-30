const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleSilenceDetected(socket, data, { service, processing }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  if (processing.has(sessionId)) {
    // If AI is already processing a response, wait up to 8 s then proceed anyway
    const waited = await new Promise(resolve => {
      let elapsed = 0;
      const poll = setInterval(() => {
        elapsed += 500;
        if (!processing.has(sessionId) || elapsed >= 8000) {
          clearInterval(poll);
          resolve(!processing.has(sessionId));
        }
      }, 500);
    });
    if (!waited) {
      logger.warn('Silence skip proceeding despite concurrent processing', { sessionId });
    }
  }
  processing.add(sessionId);

  try {
    const durationSeconds = data?.durationSeconds ?? 60;
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
