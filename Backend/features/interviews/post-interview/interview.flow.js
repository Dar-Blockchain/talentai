'use strict';

const logger = require('../../../utils/logger');

/**
 * Flow strategy for job-anchored interviews (HR_INTERVIEW and JD-driven types).
 * Selected by features/interviews/interview-flow.js. The skill-assessment
 * equivalent is skill-interview/interview.flow.js.
 */

// Short client-facing text per non-eligible status returned by
// post-interview.service.js checkInterviewEligibility.
const ELIGIBILITY_MESSAGES = {
  not_found:        'This interview link is no longer valid.',
  archived:         'This job posting has been closed.',
  expired:          'This job posting has expired.',
  completed:        'You have already completed this interview.',
  withdrawn:        'You have withdrawn your application for this position.',
  no_cv:            'Please upload your CV before starting the interview.',
  under_threshold:  "Your profile doesn't currently meet the requirements for this interview.",
  limit_reached:    'This company has reached its interview limit for now.',
  company_blocked:  'This interview link is for candidates only.',
  employee_blocked: 'This interview link is for candidates only.',
};

module.exports = {
  // Job interviews are anchored to a Post + company.
  requiresCompany: true,

  /**
   * Gate a start_interview request. Mirrors the REST eligibility check
   * (post-interview.service.js checkInterviewEligibility) so a direct socket
   * connection can't skip the match-threshold / archived / plan-limit gates the
   * EligibilityGate UI enforces. Returns null to allow, or { error, message }.
   */
  async assertEligible({ candidateId, postId }) {
    if (!candidateId || !postId) return null;
    const { checkInterviewEligibility } = require('./post-interview.service');
    let result;
    try {
      result = await checkInterviewEligibility(candidateId, postId);
    } catch (err) {
      logger.warn('Socket eligibility check errored — allowing', { postId, err: err.message });
      return null; // fail open: a technical fault must not block a valid candidate
    }
    if (!result || result.status === 'eligible') return null;
    return {
      error: result.status,
      message: ELIGIBILITY_MESSAGES[result.status] || 'You are not eligible to start this interview.',
    };
  },

  // On a disconnect where the final report fails, keep the original
  // re-throw behaviour (no stub record).
  saveMinimalReportOnDisconnectFailure: false,

  fallbackGreeting(config) {
    return `Hello! I'm excited to speak with you today about the ${config.context?.targetRole} position at ${config.context?.targetCompany}. Let's start our conversation!`;
  },

  fallbackFirstQuestion(config) {
    return `Tell me about your experience with ${config.context?.targetRole || 'this role'}.`;
  },

  /**
   * Create a pending PostInterviewAssessment when the interview starts, and
   * record the application source. Needs socket.postId + socket.candidateId.
   */
  async onSessionStarted(socket, config) {
    if (!socket.postId || !socket.candidateId) {
      logger.warn('onSessionStarted skipped — missing postId or candidateId', {
        postId: socket.postId, candidateId: socket.candidateId,
      });
      return;
    }

    const Post                    = require('../../posts/post.model');
    const Profile                 = require('../../users/profile.model');
    const JobApplication          = require('../../job-applications/job-application.model');
    const PostInterviewAssessment = require('./post-interview.model');

    try {
      const post = await Post.findById(socket.postId).select('user').lean();
      await PostInterviewAssessment.findOneAndUpdate(
        { candidate: socket.candidateId, post: socket.postId },
        {
          $setOnInsert: {
            candidate: socket.candidateId,
            post:      socket.postId,
            company:   post?.user ?? null,
            completed: false,
            'interviewData.sessionId':     `session_${Date.now()}`,
            'interviewData.interviewType': config?.interviewType || 'HR_INTERVIEW',
          },
        },
        { upsert: true, new: false },
      );
    } catch (err) {
      if (err.code !== 11000) logger.warn('Pending assessment creation failed', { err: err.message });
    }

    if (socket.source) {
      try {
        const profile = await Profile.findOne({ userId: socket.candidateId }).select('_id').lean();
        if (profile) {
          await JobApplication.findOneAndUpdate(
            { profile: profile._id, post: socket.postId },
            { $set: { source: socket.source } },
          );
        }
      } catch (err) {
        logger.warn('Failed to persist application source', { err: err.message });
      }
    }
  },

  persistResults(sessionId, result, socket) {
    const { persistInterviewResults } = require('./post-interview.persistence');
    return persistInterviewResults(sessionId, result, socket.candidateId, socket.postId);
  },
};
