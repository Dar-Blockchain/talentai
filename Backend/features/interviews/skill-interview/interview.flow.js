'use strict';

/**
 * Flow strategy for standalone skill assessments (TECHNICAL_SKILL / SOFT_SKILL /
 * ASSESSMENT / EVALUATION). Selected by features/interviews/interview-flow.js.
 * The job-interview equivalent is post-interview/interview.flow.js.
 */

// Skill tests draw down Profile.quota. Keep in sync with the frontend gate.
const SKILL_TEST_QUOTA = 5;

module.exports = {
  // Skill assessments have no company/JD to anchor on.
  requiresCompany: false,

  /**
   * Gate a start_interview request. The UI blocks the entry points when quota is
   * spent, but the /interviews/<session> link can be opened directly — never
   * trust the client. Returns null to allow, or { error, message } to reject.
   */
  async assertEligible({ candidateId }) {
    if (!candidateId) return null;
    const Profile = require('../../users/profile.model');
    const profile = await Profile.findOne({ userId: candidateId }).select('quota').lean();
    if (profile && (profile.quota || 0) >= SKILL_TEST_QUOTA) {
      return {
        error: 'quota_reached',
        message: `You've used all ${SKILL_TEST_QUOTA} of your skill tests. Your quota resets automatically.`,
      };
    }
    return null;
  },

  // If the candidate disconnects and the final report can't be generated, still
  // save a minimal 'interrupted' record (the quota was already spent) rather
  // than losing the session entirely.
  saveMinimalReportOnDisconnectFailure: true,

  fallbackGreeting(config) {
    const role = config.context?.targetRole || 'this skill';
    return `Hi, I'm Olga — I'll be running your ${role} assessment today. Let's start with the basics: in your own words, what is ${role} at its core, and what problem is it there to solve?`;
  },

  fallbackFirstQuestion(config) {
    const role = config.context?.targetRole || 'this role';
    return `Let's get concrete — walk me through what actually happens, step by step, in a typical ${role} workflow from start to finish.`;
  },

  // Nothing to do at start — skill assessments only produce a record on completion.
  async onSessionStarted() {},

  persistResults(sessionId, result, socket) {
    const { persistSkillInterviewResults } = require('./skill-interview.service');
    return persistSkillInterviewResults(sessionId, result, socket);
  },
};
