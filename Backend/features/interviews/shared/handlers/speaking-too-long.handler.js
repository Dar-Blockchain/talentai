const { safeEmit } = require('../interview.utils');
const logger = require('../../../../utils/logger');

async function handleSpeakingTooLong(socket, data, { service }) {
  const sessionId = socket.sessionId;
  if (!sessionId) {
    safeEmit(socket, 'interview_error', { error: 'No active session' });
    return;
  }

  try {
    const { duration } = data;
    logger.info('Polite interrupt triggered', { sessionId, durationSec: Math.round(duration / 1000) });

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

module.exports = { handleSpeakingTooLong };
