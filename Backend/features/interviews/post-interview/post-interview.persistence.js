const PostInterviewAssessment = require("./post-interview.model");
const JobApplication          = require("../../job-applications/job-application.model");
const Profile                 = require("../../../features/users/profile.model");
const Post                    = require("../../posts/post.model");
const notificationService     = require("../../notifications/notification.service");
const socket                  = require("../../../socket/io");

async function persistInterviewResults(sessionId, result, candidateId, postId) {
  if (!candidateId || !postId) {
    console.error(`⚠️ [DB] Cannot persist — missing candidateId or postId for session ${sessionId}`);
    return { assessmentId: null };
  }

  try {
    const query = { candidate: candidateId, post: postId };

    // Resolve company and job title for upsert & notifications
    let company  = null;
    let jobTitle = null;
    if (candidateId && postId) {
      const post = await Post.findById(postId).select('user jobDetails.title').lean();
      company  = post?.user          ?? null;
      jobTitle = post?.jobDetails?.title ?? null;
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

    // Update JobApplication status and send notifications
    if (candidateId && postId) {
      try {
        const profile = await Profile.findOne({ userId: candidateId }).select('_id firstName lastName').lean();
        if (profile) {
          await JobApplication.findOneAndUpdate(
            { profile: profile._id, post: postId },
            { status: 'interview_completed', isWithdrawn: false, withdrawnAt: null, updatedAt: new Date() },
          );

          // Notify the company (recruiter) that a candidate completed their interview
          if (company) {
            const candidateName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'A candidate';
            const content = jobTitle
              ? `${candidateName} has completed their interview for "${jobTitle}".`
              : `${candidateName} has completed their interview.`;
            try {
              await notificationService.createNotification(company, content, 'success', 'job', '/company/applications');
            } catch (err) {
              console.warn(`⚠️ [Notify] Failed to notify company ${company}:`, err.message);
            }
          }
        }
      } catch (err) {
        console.error(`⚠️ [DB] Failed to update JobApplication status:`, err.message);
      }
    }

    // Notify the candidate that their interview results are recorded
    const interviewType = saved?.interviewData?.interviewType ?? null;
    try {
      const io = socket.getIO();
      io.to(String(candidateId)).emit('interview_completed', { interviewType, jobTitle });
    } catch (err) {
      console.warn(`⚠️ [Socket] Failed to emit interview_completed to candidate ${candidateId}:`, err.message);
    }

    return { assessmentId: saved?._id ?? null };
  } catch (err) {
    console.error(`⚠️ [DB] Failed to save results for session ${sessionId}:`, err.message);
    return { assessmentId: null };
  }
}

module.exports = { persistInterviewResults };
