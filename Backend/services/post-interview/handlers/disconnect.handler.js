const { persistInterviewResults } = require('../interviewPersistence.service');
const { resetInterTurnPauseTimer } = require('../silenceMonitor.service');
const logger = require('../../../utils/logger');

async function handleDisconnect(socket, reason, { service, activeSessions, processing }) {
  logger.info('Socket disconnected', { socketId: socket.id, reason });

  const sessionId = socket.sessionId;
  if (!sessionId) return;

  try {
    resetInterTurnPauseTimer(socket, sessionId);

    const { wasActive, result } = await service.handleDisconnect(sessionId, reason);
    if (wasActive) {
      persistInterviewResults(sessionId, result, socket.candidateId, socket.postId);
      logger.info('Session auto-ended on disconnect', { sessionId });
    }
  } catch (error) {
    logger.warn('Auto-end failed on disconnect', { sessionId, err: error.message });
  } finally {
    activeSessions.delete(sessionId);
    processing.delete(sessionId);
  }
}

module.exports = { handleDisconnect };
