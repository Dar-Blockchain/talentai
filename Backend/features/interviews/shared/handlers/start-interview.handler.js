const { v4: uuidv4 } = require('uuid');
const { withTimeout, safeEmit, AI_TIMEOUT_MS } = require('../interview.utils');
const logger = require('../../../../utils/logger');
const Profile = require('../../../users/profile.model');

// Standalone skill assessments that draw down the candidate's skill-test quota
// (Profile.quota). Job/campaign interviews are gated by plan limits elsewhere.
const QUOTA_SKILL_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL'];
const SKILL_TEST_QUOTA = 5;

async function handleStartInterview(socket, data, { service, activeSessions, onSessionStarted }) {
  try {
    const { config, candidateId, postId, source } = data;

    // Reject a skill test the candidate has no quota left for -- the frontend
    // gates the entry points, but the /interviews/<session> link can be
    // opened directly. Never trust the client for this.
    if (candidateId && QUOTA_SKILL_TYPES.includes(config?.interviewType)) {
      const profile = await Profile.findOne({ userId: candidateId }).select('quota').lean();
      if (profile && (profile.quota || 0) >= SKILL_TEST_QUOTA) {
        logger.warn('start_interview blocked — skill-test quota reached', { candidateId, interviewType: config.interviewType });
        safeEmit(socket, 'interview_error', {
          error: 'quota_reached',
          message: `You've used all ${SKILL_TEST_QUOTA} of your skill tests. Your quota resets automatically.`,
        });
        return;
      }
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

module.exports = { handleStartInterview };
