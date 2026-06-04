const { v4: uuidv4 } = require('uuid');
const postInterviewAssessmentService = require('../../InterviewServices/postInterviewAssessment.service');
const { withTimeout, safeEmit, AI_TIMEOUT_MS } = require('../interviewUtils');
const logger = require('../../../utils/logger');

async function handleStartInterview(socket, data, { service, activeSessions }) {
  try {
    const { config, candidateId, postId } = data;
    const sessionId = uuidv4();

    socket.candidateId = candidateId || null;
    socket.postId      = postId || null;
    socket.sessionId   = sessionId;

    socket.join(sessionId);
    activeSessions.add(sessionId);

    logger.info('Starting session', { sessionId, candidateId, postId });

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

    if (socket.postId && socket.candidateId) {
      postInterviewAssessmentService.createPostInterviewAssessment({
        post: socket.postId,
        candidate: socket.candidateId,
        interviewData: { interviewType: config.interviewType || 'HR_INTERVIEW' },
      }).catch(err => logger.warn('Assessment creation failed', { sessionId, err: err.message }));
    }

    safeEmit(socket, 'interviewer_message', {
      type: 'greeting', content: result.greeting,
      timestamp: new Date().toISOString(), sessionId,
    });

    logger.info('Session started', { sessionId });
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

module.exports = { handleStartInterview };
