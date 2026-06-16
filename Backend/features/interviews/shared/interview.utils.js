const logger = require('../../../utils/logger');

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

// ── Silence monitor ───────────────────────────────────────────────────────────

function resetInterTurnPauseTimer(socket, sessionId) {
  if (!socket.interTurnTimers?.has(sessionId)) return;
  const timers = socket.interTurnTimers.get(sessionId);
  clearTimeout(timers.stage1);
  clearTimeout(timers.stage2);
  clearTimeout(timers.stage3);
  socket.interTurnTimers.delete(sessionId);
}

async function startIntelligentSilenceMonitoring(socket, sessionId, decision, service) {
  resetInterTurnPauseTimer(socket, sessionId);

  if (decision.metadata?.responseQuality >= 75 || decision.action === 'immediate_intervention') return;

  const session    = await service.sessionManager.getSession(sessionId);
  const complexity = session?.currentQuestionContext?.complexity || 'medium';
  const responseQuality = decision.metadata?.responseQuality || 50;

  const baseThresholds =
    responseQuality >= 60 ? { stage1: 40000, stage2: 70000,  stage3: 100000 }
    : responseQuality >= 40 ? { stage1: 30000, stage2: 60000, stage3: 90000  }
    : { stage1: 20000, stage2: 45000, stage3: 70000 };

  const multiplier  = { simple: 0.8, medium: 1.0, complex: 1.3 }[complexity] ?? 1.0;
  const thresholds  = {
    stage1: Math.floor(baseThresholds.stage1 * multiplier),
    stage2: Math.floor(baseThresholds.stage2 * multiplier),
    stage3: Math.floor(baseThresholds.stage3 * multiplier),
  };

  console.log(`⏱️ [Smart Silence] ${sessionId} — quality: ${responseQuality}, complexity: ${complexity}`, {
    stage1: `${thresholds.stage1 / 1000}s`,
    stage2: `${thresholds.stage2 / 1000}s`,
    stage3: `${thresholds.stage3 / 1000}s`,
  });
  // Timers removed for MVP — manual "Next" button only
}

module.exports = {
  AI_TIMEOUT_MS,
  RESPONSE_RATE_LIMIT_MS,
  AUDIO_STREAM_THROTTLE_MS,
  withTimeout,
  safeEmit,
  resetInterTurnPauseTimer,
  startIntelligentSilenceMonitoring,
};
