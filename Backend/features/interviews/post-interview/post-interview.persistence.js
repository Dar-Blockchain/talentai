const PostInterviewAssessment = require("./post-interview.model");
const JobApplication          = require("../../job-applications/job-application.model");
const Profile                 = require("../../../features/users/profile.model");
const Post                    = require("../../posts/post.model");

async function persistInterviewResults(sessionId, result, candidateId, postId) {
  if (!candidateId || !postId) {
    console.error(`⚠️ [DB] Cannot persist — missing candidateId or postId for session ${sessionId}`);
    return { assessmentId: null };
  }

  try {
    const query = { candidate: candidateId, post: postId };

    // Resolve company for upsert (needed when pending record was never created)
    let company = null;
    if (candidateId && postId) {
      const post = await Post.findById(postId).select('user').lean();
      company = post?.user ?? null;
    }

    const saved = await PostInterviewAssessment.findOneAndUpdate(
      query,
      {
        $set: {
          completed: true,
          'interviewData.finalReport': result.finalReport,
          'interviewData.analytics': result.sessionAnalytics,
          'interviewData.conversation': result.conversation || [],
        },
        $setOnInsert: {
          candidate: candidateId,
          post: postId,
          company,
          'interviewData.sessionId': sessionId,
        },
      },
      { new: true, upsert: true }
    );

    if (saved) {
      console.log(`✅ [DB] Interview results saved — candidate: ${candidateId}, post: ${postId}`);
    }

    // Update JobApplication status to "interview_completed"
    if (candidateId && postId) {
      try {
        const profile = await Profile.findOne({ userId: candidateId }).select('_id').lean();
        if (profile) {
          await JobApplication.findOneAndUpdate(
            { profile: profile._id, post: postId },
            { status: 'interview_completed', updatedAt: new Date() },
          );
        }
      } catch (err) {
        console.error(`⚠️ [DB] Failed to update JobApplication status:`, err.message);
      }
    }

    return { assessmentId: saved?._id ?? null };
  } catch (err) {
    console.error(`⚠️ [DB] Failed to save results for session ${sessionId}:`, err.message);
    return { assessmentId: null };
  }
}

module.exports = { persistInterviewResults };
