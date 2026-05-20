const intelligentInterviewService = require('../services/post-interview/intelligentInterview.service');
const logger = require('../utils/logger');
const { safeEmit } = require('../services/post-interview/interviewUtils');

const { handleStartInterview }    = require('../services/post-interview/handlers/startInterview.handler');
const { handleCandidateResponse } = require('../services/post-interview/handlers/candidateResponse.handler');
const { handleSkipQuestion }      = require('../services/post-interview/handlers/skipQuestion.handler');
const { handleSpeakingTooLong }   = require('../services/post-interview/handlers/speakingTooLong.handler');
const { handleEndInterview }      = require('../services/post-interview/handlers/endInterview.handler');
const { handleAudioStream }       = require('../services/post-interview/handlers/audioStream.handler');
const { handleSessionStatus }     = require('../services/post-interview/handlers/sessionStatus.handler');
const { handleDisconnect }        = require('../services/post-interview/handlers/disconnect.handler');

class IntelligentInterviewController {
  constructor() {
    this.activeSessions = new Set();
    this.processing     = new Set();
    this.service        = intelligentInterviewService;
  }

  initializeHandlers(io) {
    const ns = io.of('/interview');

    ns.on('connection', (socket) => {
      logger.info('New interview connection', { socketId: socket.id });

      socket._lastResponseAt = 0;
      socket._lastAudioAt    = 0;

      const ctx = {
        service:        this.service,
        activeSessions: this.activeSessions,
        processing:     this.processing,
      };

      socket.on('start_interview',    (data)   => handleStartInterview(socket, data, ctx));
      socket.on('candidate_response', (data)   => handleCandidateResponse(socket, data, ctx));
      socket.on('skip_question',      ()       => handleSkipQuestion(socket, ctx));
      socket.on('speaking_too_long',  (data)   => handleSpeakingTooLong(socket, data, ctx));
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
