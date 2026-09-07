const logger = require('../../../utils/logger');

// Max time to wait for any single AI/service call before treating it as failed.
const AI_TIMEOUT_MS            = 30_000;
// Minimum gap between two candidate_response events — anything faster is ignored (double-submit guard).
const RESPONSE_RATE_LIMIT_MS   = 1_500;
// Minimum gap between audio_stream (voice-activity) events we forward — the client fires these very often.
const AUDIO_STREAM_THROTTLE_MS = 150;

/**
 * Run `promise`, but reject with a "<label> timed out" error if it takes longer
 * than `ms`. Always clears the timer afterwards so it can't leak.
 */
function withTimeout(promise, ms, label) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

/**
 * Emit a socket event only if the client is still connected; otherwise log and
 * drop it. Prevents "emit to a dead socket" noise all over the handlers.
 */
function safeEmit(socket, event, data) {
  if (socket.connected) {
    socket.emit(event, data);
  } else {
    logger.warn('Emit dropped — socket disconnected', { event, sessionId: data?.sessionId });
  }
}

module.exports = {
  AI_TIMEOUT_MS,
  RESPONSE_RATE_LIMIT_MS,
  AUDIO_STREAM_THROTTLE_MS,
  withTimeout,
  safeEmit,
};
