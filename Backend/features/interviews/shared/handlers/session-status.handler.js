const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleSessionStatus(socket, { service }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'session_status', { error: 'No active session' });
    return;
  }

  try {
    const status = await service.getSessionStatus(sessionId);
    safeEmit(socket, 'session_status', { sessionId, ...status, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Failed to get session status', { err: error.message });
    safeEmit(socket, 'session_status', { error: 'Failed to get session status' });
  }
}

module.exports = { handleSessionStatus };
