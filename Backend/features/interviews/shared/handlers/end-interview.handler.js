const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleEndInterview(socket, { service, activeSessions, processing, onSessionEnded }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  try {
    logger.info('Ending session', { sessionId });

    const result = await service.endInterview(sessionId);
    if (onSessionEnded) onSessionEnded(sessionId, result, socket);

    safeEmit(socket, 'interview_ended', {
      success: true, finalReport: result.finalReport,
      analytics: result.sessionAnalytics, sessionId,
    });

    socket.leave(sessionId);
    activeSessions.delete(sessionId);
    processing.delete(sessionId);
    socket.sessionId = null;

    logger.info('Session ended', { sessionId });
  } catch (error) {
    logger.error('Failed to end interview', { err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to end interview', message: error.message });
  }
}

module.exports = { handleEndInterview };
