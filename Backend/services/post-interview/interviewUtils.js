const logger = require('../../utils/logger');

const AI_TIMEOUT_MS            = 30_000;
const RESPONSE_RATE_LIMIT_MS   = 1_500;
const AUDIO_STREAM_THROTTLE_MS = 150;

function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

function safeEmit(socket, event, data) {
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    logger.warn('Emit dropped — socket disconnected', { event, sessionId: data?.sessionId });
  }
}

module.exports = { AI_TIMEOUT_MS, RESPONSE_RATE_LIMIT_MS, AUDIO_STREAM_THROTTLE_MS, withTimeout, safeEmit };
