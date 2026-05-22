const PostInterviewAssessment = require("../../models/PostInterviewAssessment.model");
const JobApplication          = require("../../models/JobApplication.model");
const Profile                 = require("../../models/Profile.model");

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

  // Update the JobApplication status to "interview_completed"
  if (candidateId && postId) {
    try {
      const profile = await Profile.findOne({ userId: candidateId }).select('_id').lean();
      if (!profile) {
        console.warn(`⚠️ [DB] Profile not found for candidateId ${candidateId} — skipping JobApplication update`);
        return;
      }

      const updatedApp = await JobApplication.findOneAndUpdate(
        { profile: profile._id, post: postId },
        { status: 'interview_completed', updatedAt: new Date() },
        { new: true }
      );

      if (updatedApp) {
        console.log(`✅ [DB] JobApplication status → interview_completed — profile: ${profile._id}, post: ${postId}`);
      } else {
        console.warn(`⚠️ [DB] No JobApplication found — profile: ${profile._id}, post: ${postId}`);
      }
    } catch (err) {
      console.error(`⚠️ [DB] Failed to update JobApplication status for session ${sessionId}:`, err.message);
    }
  }
}

module.exports = { persistInterviewResults };
