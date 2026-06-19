const intelligentInterviewService = require('./interview.service');
const logger = require('../../../utils/logger');
const { safeEmit } = require('./interview.utils');

const { handleStartInterview }    = require('./handlers/start-interview.handler');
const { handleCandidateResponse } = require('./handlers/candidate-response.handler');
const { handleSkipQuestion }      = require('./handlers/skip-question.handler');
const { handleSpeakingTooLong }   = require('./handlers/speaking-too-long.handler');
const { handleEndInterview }      = require('./handlers/end-interview.handler');
const { handleAudioStream }       = require('./handlers/audio-stream.handler');
const { handleSessionStatus }     = require('./handlers/session-status.handler');
const { handleDisconnect }        = require('./handlers/disconnect.handler');
const { handleSilenceDetected }   = require('./handlers/silence-detected.handler');

// Post-interview persistence
const postInterviewAssessmentService = require('../post-interview/post-interview.service');
const { persistInterviewResults }    = require('../post-interview/post-interview.persistence');

// Skill-interview persistence
const { persistSkillInterviewResults } = require('../skill-interview/skill-interview.persistence');

// â”€â”€ Persistence dispatchers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function onSessionStarted(socket, config) {
  if (config?.interviewType === 'TECHNICAL_SKILL') {
    // Skill interviews: no pending record needed at start â€” assessment saved on end
    return;
  }
  // Post-interview: create a pending assessment record immediately
  if (socket.postId && socket.candidateId) {
    await postInterviewAssessmentService.createPostInterviewAssessment({
      post: socket.postId,
      candidate: socket.candidateId,
      interviewData: { interviewType: config?.interviewType || 'HR_INTERVIEW' },
    });
  }
}

async function onSessionEnded(sessionId, result, socket) {
  try {
    let saved;
    if (socket.interviewType === 'TECHNICAL_SKILL') {
      saved = await persistSkillInterviewResults(sessionId, result, socket);
    } else {
      saved = await persistInterviewResults(sessionId, result, socket.candidateId, socket.postId);
    }
    const assessmentId = saved?.assessmentId?.toString?.() ?? null;
    if (assessmentId) {
      safeEmit(socket, 'assessment_saved', { assessmentId });
    }
  } catch (err) {
    logger.warn('Session persistence failed', { sessionId, err: err.message });
  }
}

// â”€â”€ Controller â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class IntelligentInterviewController {
  constructor() {
    this.activeSessions = new Set();
    this.processing     = new Set();
    this.service        = intelligentInterviewService;
  }

  initializeHandlers(io) {
    this.service.initialize();
    const ns = io.of('/interview');

    ns.on('connection', (socket) => {
      logger.info('New interview connection', { socketId: socket.id });

      socket._lastResponseAt = 0;
      socket._lastAudioAt    = 0;

      const ctx = {
        service:          this.service,
        activeSessions:   this.activeSessions,
        processing:       this.processing,
        onSessionStarted,
        onSessionEnded,
      };

      socket.on('start_interview',    (data)   => handleStartInterview(socket, data, ctx));
      socket.on('candidate_response', (data)   => handleCandidateResponse(socket, data, ctx));
      socket.on('skip_question',      ()       => handleSkipQuestion(socket, ctx));
      socket.on('speaking_too_long',  (data)   => handleSpeakingTooLong(socket, data, ctx));
      socket.on('silence_detected',   (data)   => handleSilenceDetected(socket, data, ctx));
      socket.on('end_interview',      ()       => handleEndInterview(socket, ctx));
      socket.on('audio_stream',       (data)   => handleAudioStream(socket, data));
      socket.on('get_session_status', ()       => handleSessionStatus(socket, ctx));
      socket.on('disconnect',         (reason) => handleDisconnect(socket, reason, ctx));

      socket.on('pause_interview',  () => {
        if (socket.sessionId) safeEmit(socket, 'interview_paused',  { sessionId: socket.sessionId, timestamp: new Date().toISOString() });
      });
      socket.on('resume_interview', () => {
        if (socket.sessionId) safeEmit(socket, 'interview_resumed', { sessionId: socket.sessionId, timestamp: new Date().toISOString() });
      });
      socket.on('error', (error) => {
        logger.error('Socket error', { socketId: socket.id, err: error.message });
        safeEmit(socket, 'interview_error', { error: 'Connection error', message: error.message });
      });
    });

    logger.info('Interview WebSocket handlers initialized');
    return ns;
  }
}

module.exports = new IntelligentInterviewController();
