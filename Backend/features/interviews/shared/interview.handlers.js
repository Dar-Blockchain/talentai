'use strict';

/**
 * Socket event handlers for the /interview namespace. One function per event,
 * wired up in interview.socket.js. Every handler receives the shared `ctx`:
 *   { service, activeSessions, processing, onSessionStarted, onSessionEnded }
 *
 * Events, in lifecycle order:
 *   start_interview     → handleStartInterview
 *   candidate_response  → handleCandidateResponse   ┐ both route the AI decision
 *   skip_question       → handleSkipQuestion        ┘ through applyAIDecision()
 *   speaking_too_long   → handleSpeakingTooLong
 *   silence_detected    → handleSilenceDetected
 *   get_session_status  → handleSessionStatus
 *   audio_stream        → handleAudioStream
 *   end_interview       → handleEndInterview
 *   disconnect          → handleDisconnect
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../../../utils/logger');
const {
  withTimeout, safeEmit,
  AI_TIMEOUT_MS, RESPONSE_RATE_LIMIT_MS, AUDIO_STREAM_THROTTLE_MS,
} = require('./interview.utils');

// flowFor(type).assertEligible() gates start_interview (skill-test quota for
// skill assessments, match-threshold/archived/plan-limit for job interviews).
const flowFor = require('../interview-flow');

// ─────────────────────────────────────────────────────────────────────────────
// start_interview
// ─────────────────────────────────────────────────────────────────────────────

async function handleStartInterview(socket, data, { service, activeSessions, onSessionStarted }) {
  try {
    const { config, candidateId, postId, source } = data;

    // Gate the request through the flow strategy (skill-test quota / job
    // eligibility). The UI gates its entry points too, but the /interviews/<session>
    // link can be opened directly — never trust the client for this.
    const denial = await flowFor(config?.interviewType).assertEligible({ candidateId, postId, config });
    if (denial) {
      logger.warn('start_interview blocked', { candidateId, interviewType: config?.interviewType, reason: denial.error });
      safeEmit(socket, 'interview_error', denial);
      return;
    }

    const sessionId = uuidv4();

    socket.candidateId     = candidateId || null;
    socket.postId          = postId || null;
    socket.source          = source || null;
    socket.sessionId       = sessionId;
    socket.interviewType   = config?.interviewType || null;
    socket.interviewConfig = config || null;

    socket.join(sessionId);
    activeSessions.add(sessionId);

    const onGreetingChunk = (chunk) => {
      if (socket.connected) socket.emit('greeting_chunk', { content: chunk, sessionId });
    };

    const result = await withTimeout(
      service.startInterview(sessionId, config, candidateId, onGreetingChunk),
      AI_TIMEOUT_MS,
      'startInterview',
    );

    safeEmit(socket, 'greeting_complete', { sessionId });
    safeEmit(socket, 'interview_started', {
      success: true, sessionId,
      greeting: result.greeting, config: result.config,
      jobDetails: result.jobDetails, targetRole: result.targetRole,
      targetCompany: result.targetCompany,
    });

    if (onSessionStarted) {
      onSessionStarted(socket, config).catch(err =>
        logger.warn('Initial assessment creation failed', { sessionId, err: err.message })
      );
    }

    safeEmit(socket, 'interviewer_message', {
      type: 'greeting', content: result.greeting,
      timestamp: new Date().toISOString(), sessionId,
    });

  } catch (error) {
    const isRedisError = error.message?.includes('Redis') ||
      error.code === 'ECONNREFUSED' || error.syscall === 'connect';

    logger.error('Failed to start interview', { err: error.message, isRedisError });
    safeEmit(socket, 'interview_error', {
      error: 'Failed to start interview', message: error.message,
      details: error.stack, isRedisError,
      hint: isRedisError ? 'Check if Redis server is running: redis-cli ping' : null,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI decision routing — shared by candidate_response and skip_question
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_CONTENT = {
  end_interview: 'Thank you for your time. This concludes our interview.',
  default:       'Can you tell me more about your experience?',
};

function resolveContent(decision) {
  return decision.content || FALLBACK_CONTENT[decision.action] || FALLBACK_CONTENT.default;
}

async function emitCoverageAndReport(socket, sessionId, service, timestamp) {
  if (!socket.connected) return;
  try {
    const { coverage, realTimeReport } = await service.getSessionStatus(sessionId);
    if (coverage)       safeEmit(socket, 'coverage_update', { coverage, timestamp, sessionId });
    if (realTimeReport) safeEmit(socket, 'report_update',   { report: realTimeReport, timestamp, sessionId });
  } catch (err) {
    logger.warn('Coverage/report update skipped', { sessionId, err: err.message });
  }
}

async function applyAIDecision(socket, sessionId, decision, { service, onSessionEnded }) {
  try {
    if (!socket.connected) {
      logger.warn('Socket disconnected â€” decision skipped', { sessionId });
      return;
    }

    const timestamp = new Date().toISOString();
    const content   = resolveContent(decision);

    switch (decision.action) {
      case 'immediate_intervention':
        safeEmit(socket, 'interviewer_message', {
          type: 'intervention', subtype: decision.interventionType,
          content, reasoning: decision.reasoning, urgency: decision.urgency,
          timestamp, sessionId,
        });
        break;

      case 'continue_probing':
      case 'question':
        safeEmit(socket, 'interviewer_message', {
          type: 'question', content, reasoning: decision.reasoning,
          nextFocus: decision.nextFocus, timestamp, sessionId,
        });
        break;

      case 'probe_deeper':
        safeEmit(socket, 'interviewer_message', {
          type: 'follow_up', content, reasoning: decision.reasoning, timestamp, sessionId,
        });
        break;

      case 'change_topic':
        safeEmit(socket, 'topic_change',        { newTopic: decision.nextFocus, reason: decision.reasoning, timestamp, sessionId });
        safeEmit(socket, 'interviewer_message', { type: 'new_topic', content, topic: decision.nextFocus, timestamp, sessionId });
        break;

      case 'wrap_up':
        safeEmit(socket, 'interview_wrap_up', { message: content, reasoning: decision.reasoning, timestamp, sessionId });
        break;

      case 'end_interview':
        safeEmit(socket, 'interviewer_message', { type: 'end_interview', content, reasoning: decision.reasoning, timestamp, sessionId });
        try {
          const result = await service.endInterview(sessionId);
          safeEmit(socket, 'interview_ended', { finalReport: result.finalReport, analytics: result.sessionAnalytics, sessionId });
          if (onSessionEnded) {
            onSessionEnded(sessionId, result, socket).catch(err =>
              logger.warn('Auto-end persistence failed', { sessionId, err: err.message })
            );
          }
        } catch (endErr) {
          logger.warn('Auto-end failed in decision handler', { sessionId, err: endErr.message });
        }
        break;

      default:
        logger.warn('Unknown decision action â€” fallback emitted', { sessionId, action: decision.action });
        safeEmit(socket, 'interviewer_message', { type: 'question', content, timestamp, sessionId });
    }

    await emitCoverageAndReport(socket, sessionId, service, timestamp);
  } catch (error) {
    logger.error('Failed to handle AI decision', { sessionId, err: error.message });
    if (socket.connected) {
      safeEmit(socket, 'interview_error', { error: 'Failed to process AI decision', message: error.message });
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// candidate_response
// ─────────────────────────────────────────────────────────────────────────────

async function handleCandidateResponse(socket, data, { service, processing, onSessionEnded }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  const now = Date.now();
  if (now - socket._lastResponseAt < RESPONSE_RATE_LIMIT_MS) {
    logger.warn('Rate limit hit â€” response ignored', { sessionId });
    return;
  }
  socket._lastResponseAt = now;

  if (processing.has(sessionId)) {
    logger.warn('Concurrent response rejected', { sessionId });
    return;
  }
  processing.add(sessionId);

  try {
    const { transcript, audioMetadata } = data;

    safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });

    const decision = await withTimeout(
      service.processCandidateResponseIntelligently(sessionId, transcript, audioMetadata),
      AI_TIMEOUT_MS,
      'processCandidateResponseIntelligently',
    );

    await applyAIDecision(socket, sessionId, decision, { service, onSessionEnded });

    safeEmit(socket, 'response_processed', {
      status: 'success',
      transcript: transcript.substring(0, 100),
      decisionType: decision.type || 'continue',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to process response', { sessionId, err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to process response', message: error.message });
    safeEmit(socket, 'response_processed', { status: 'error', error: error.message, timestamp: new Date().toISOString() });
  } finally {
    processing.delete(sessionId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// skip_question
// ─────────────────────────────────────────────────────────────────────────────

async function handleSkipQuestion(socket, { service, processing, onSessionEnded }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  if (processing.has(sessionId)) {
    logger.warn('Skip ignored â€” AI call in progress', { sessionId });
    return;
  }
  processing.add(sessionId);

  try {
    safeEmit(socket, 'interviewer_typing', { sessionId, status: 'thinking' });

    const decision = await withTimeout(
      service.processCandidateResponseIntelligently(sessionId, '[SKIPPED]', { skipped: true }),
      AI_TIMEOUT_MS,
      'processCandidateResponseIntelligently (skip)',
    );

    await applyAIDecision(socket, sessionId, decision, { service, onSessionEnded });

    safeEmit(socket, 'response_processed', {
      status: 'success', transcript: '[SKIPPED]',
      decisionType: decision.type || 'continue', timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Failed to process skip', { sessionId, err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to skip question', message: error.message });
  } finally {
    processing.delete(sessionId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// speaking_too_long
// ─────────────────────────────────────────────────────────────────────────────

async function handleSpeakingTooLong(socket, data, { service }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  try {
    const { duration } = data;

    const nextQuestion = await service.handleLongSpeaking(sessionId);

    safeEmit(socket, 'interviewer_message', {
      type: 'polite_interrupt',
      content: "Thank you for that detailed answer. Let's move on to the next question.",
      timestamp: new Date().toISOString(), sessionId,
    });

    // Brief pause so the interrupt message lands before the next question arrives
    setTimeout(() => {
      safeEmit(socket, 'interviewer_message', {
        type: 'question', content: nextQuestion.question,
        timestamp: new Date().toISOString(), sessionId,
        metadata: { reason: 'time_limit', previousDuration: duration, targetAreas: nextQuestion.targetAreas },
      });
    }, 2000);
  } catch (error) {
    logger.error('Failed to handle long speaking', { err: error.message });
    safeEmit(socket, 'interview_error', { error: 'Failed to handle long response', message: error.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// silence_detected
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// get_session_status
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// audio_stream
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// end_interview
// ─────────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────────
// disconnect
// ─────────────────────────────────────────────────────────────────────────────

async function handleDisconnect(socket, reason, { service, activeSessions, processing, onSessionEnded }) {

  const sessionId = socket.sessionId;
  if (!sessionId) return;

  try {
    const { wasActive, result } = await service.handleDisconnect(sessionId, reason);
    if (wasActive) {
      if (onSessionEnded) onSessionEnded(sessionId, result, socket);
    }
  } catch (error) {
    logger.warn('Auto-end failed on disconnect', { sessionId, err: error.message });
  } finally {
    activeSessions.delete(sessionId);
    processing.delete(sessionId);
  }
}

module.exports = {
  handleStartInterview,
  handleCandidateResponse,
  handleSkipQuestion,
  handleSpeakingTooLong,
  handleSilenceDetected,
  handleSessionStatus,
  handleAudioStream,
  handleEndInterview,
  handleDisconnect,
};
