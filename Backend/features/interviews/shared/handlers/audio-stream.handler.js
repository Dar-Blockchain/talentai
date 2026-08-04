const { safeEmit, AUDIO_STREAM_THROTTLE_MS } = require('../interview.utils');
const logger = require('../../../../utils/logger');

function handleAudioStream(socket, data) {
  const now = Date.now();
  if (now - socket._lastAudioAt < AUDIO_STREAM_THROTTLE_MS) return;
  socket._lastAudioAt = now;

  try {
    const { isActive } = data;
    if (!socket.sessionId) return;
    safeEmit(socket, 'voice_activity', { isActive, timestamp: new Date().toISOString(), sessionId: socket.sessionId });
    if (isActive) safeEmit(socket, 'silence_reset', {});
  } catch (error) {
    logger.error('Failed to process audio stream', { err: error.message });
  }
}

module.exports = { handleAudioStream };
