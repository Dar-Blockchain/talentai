const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleEndInterview(socket, { service, activeSessions, processing, onSessionEnded }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  try {

    const result = await service.endInterview(sessionId);

    safeEmit(socket, 'interview_ended', {
      success: true, finalReport: result.finalReport,
      analytics: result.sessionAnalytics, sessionId,
    });

    socket.leave(sessionId);
    activeSessions.delete(sessionId);
    processing.delete(sessionId);
    socket.sessionId = null;


    // Persist after emitting interview_ended so the client gets the result immediately
    if (onSessionEnded) {
      onSessionEnded(sessionId, result, socket).catch(err =>
        logger.warn('Session persistence failed', { sessionId, err: err.message })
      );
    }
  } catch (error) {
    logger.error('Failed to end interview', { err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to end interview', message: error.message });
  }
}

module.exports = { handleEndInterview };
