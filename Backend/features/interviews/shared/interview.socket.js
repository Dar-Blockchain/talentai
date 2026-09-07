/**
 * Socket.IO controller for the `/interview` namespace.
 * Real-time transport for skill assessments + job-post interviews.
 * (Campaign interviews use a separate stack.)
 *
 * This file only wires events to handlers. Logic lives in interview.service.js.
 */

const intelligentInterviewService = require('./interview.service');
const logger = require('../../../utils/logger');
const { safeEmit } = require('./interview.utils');

// One handler per socket event: handle*(socket, data?, ctx)
const {
  handleStartInterview,
  handleCandidateResponse,
  handleSkipQuestion,
  handleSpeakingTooLong,
  handleEndInterview,
  handleAudioStream,
  handleSessionStatus,
  handleDisconnect,
  handleSilenceDetected,
} = require('./interview.handlers');

// flowFor(type) -> skill or job strategy. Keeps flow differences out of shared/.
const flowFor = require('../interview-flow');

// ── Session lifecycle hooks (passed to handlers via ctx) ──────────────────────

// Runs flow-specific setup when the session starts (job flow pre-creates the
// assessment row; skill flow does nothing).
function onSessionStarted(socket, config) {
  return flowFor(config?.interviewType).onSessionStarted(socket, config);
}

// Runs once when the interview ends (normal end / skip-to-end / disconnect).
// Persists the result and tells the client the assessment id. Failure is logged,
// not thrown — the socket is already closing.
async function onSessionEnded(sessionId, result, socket) {
  try {
    const saved = await flowFor(socket.interviewType).persistResults(sessionId, result, socket);
    const assessmentId = saved?.assessmentId?.toString?.() ?? null;
    if (assessmentId) {
      safeEmit(socket, 'assessment_saved', { assessmentId });
    } else {
      logger.warn('Assessment save returned no ID', { sessionId });
    }
  } catch (err) {
    logger.warn('Session persistence failed', { sessionId, err: err.message });
  }
}

// ── Controller ────────────────────────────────────────────────────────────────

class IntelligentInterviewController {
  constructor() {
    this.activeSessions = new Set(); // sessions mid-interview (blocks duplicate start)
    this.processing     = new Set(); // sessions with a turn in flight (drops early input)
    this.service        = intelligentInterviewService;
  }

  // Called once at startup: boots the service, attaches the /interview namespace.
  initializeHandlers(io) {
    this.service.initialize();
    const ns = io.of('/interview');

    ns.on('connection', (socket) => {

      // Throttle clocks. sessionId / interviewType / etc. are set by start_interview.
      socket._lastResponseAt = 0;
      socket._lastAudioAt    = 0;

      const ctx = {
        service:          this.service,
        activeSessions:   this.activeSessions,
        processing:       this.processing,
        onSessionStarted,
        onSessionEnded,
      };

      socket.on('start_interview',    (data)   => handleStartInterview(socket, data, ctx));   // create session, send greeting + first question
      socket.on('candidate_response', (data)   => handleCandidateResponse(socket, data, ctx));// score answer, send next question (or end)
      socket.on('skip_question',      ()       => handleSkipQuestion(socket, ctx));           // skip current question
      socket.on('speaking_too_long',  (data)   => handleSpeakingTooLong(socket, data, ctx));  // long-answer nudge
      socket.on('silence_detected',   (data)   => handleSilenceDetected(socket, data, ctx));  // pause detected client-side, prompt next
      socket.on('end_interview',      ()       => handleEndInterview(socket, ctx));           // end early, run final report
      socket.on('audio_stream',       (data)   => handleAudioStream(socket, data));           // raw audio chunks
      socket.on('get_session_status', ()       => handleSessionStatus(socket, ctx));          // resync after reconnect
      socket.on('disconnect',         (reason) => handleDisconnect(socket, reason, ctx));     // cleanup + persist if mid-interview

      // Pause/resume: no server state, just echo back so all tabs stay in sync.
      socket.on('pause_interview',  () => {
        if (socket.sessionId) safeEmit(socket, 'interview_paused',  { sessionId: socket.sessionId, timestamp: new Date().toISOString() });
      });
      socket.on('resume_interview', () => {
        if (socket.sessionId) safeEmit(socket, 'interview_resumed', { sessionId: socket.sessionId, timestamp: new Date().toISOString() });
      });

      // Transport errors (not interview errors).
      socket.on('error', (error) => {
        logger.error('Socket error', { socketId: socket.id, err: error.message });
        safeEmit(socket, 'interview_error', { error: 'Connection error', message: error.message });
      });
    });

    return ns;
  }
}

// Singleton — app.js calls initializeHandlers(io) on this instance.
module.exports = new IntelligentInterviewController();
