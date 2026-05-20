const PostInterviewAssessment = require("../../models/PostInterviewAssessment.model");

async function persistInterviewResults(sessionId, result, candidateId, postId) {
  try {
    const query = (candidateId && postId)
      ? { candidate: candidateId, post: postId }
      : { 'interviewData.sessionId': sessionId };

    const updated = await PostInterviewAssessment.findOneAndUpdate(
      query,
      {
        $set: {
          completed: true,
          'interviewData.finalReport': result.finalReport,
          'interviewData.analytics': result.sessionAnalytics,
          'interviewData.conversation': result.conversation || [],
        },
      },
      { new: false }
    );

    if (updated) {
      console.log(`✅ [DB] Interview results saved — candidate: ${candidateId}, post: ${postId}`);
    } else {
      console.warn(`⚠️ [DB] No assessment found — candidate: ${candidateId}, post: ${postId}, session: ${sessionId}`);
    }
  } catch (err) {
    console.error(`⚠️ [DB] Failed to save results for session ${sessionId}:`, err.message);
  }
}

module.exports = { persistInterviewResults };
