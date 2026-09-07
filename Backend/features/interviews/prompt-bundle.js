'use strict';

/**
 * Picks the full prompt bundle for an interview type.
 *
 * The skill-assessment flow and the job/HR interview flow each keep a complete,
 * self-contained copy of every prompt (no shared prompt code). The live pipeline
 * (shared/interview.*.js) calls this to get the right one.
 *
 *   const P = promptBundle(session.config.interviewType);
 *   P.buildQuestionSystem({...});  P.COVERAGE_ANALYSIS_SYSTEM;  ...
 *
 * Both bundles expose the SAME export names, so callers stay flow-agnostic.
 */

const skillPrompts = require('./skill-interview/prompts/skill-interview.prompts');
const jobPrompts   = require('./post-interview/prompts/post-interview.prompts');

const SKILL_INTERVIEW_TYPES = new Set(['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION']);

/** @param {string} interviewType */
module.exports = function promptBundle(interviewType) {
  return SKILL_INTERVIEW_TYPES.has(interviewType) ? skillPrompts : jobPrompts;
};

module.exports.SKILL_INTERVIEW_TYPES = SKILL_INTERVIEW_TYPES;
