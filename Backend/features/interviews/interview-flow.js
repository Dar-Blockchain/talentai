'use strict';

/**
 * Picks the flow strategy for an interview type.
 *
 * The shared interview engine (shared/interview.*.js) is
 * fully generic — every place that used to branch on interviewType now asks the
 * flow for that behaviour instead. All skill-assessment specifics live in
 * skill-interview/interview.flow.js, all job-interview specifics in
 * post-interview/interview.flow.js.
 *
 * A flow exposes:
 *   assertEligible({ candidateId, postId, config }) -> Promise<null | { error, message }>
 *                                                      gate start_interview; null = allow
 *   requiresCompany                         {boolean}  context.targetCompany is required
 *   saveMinimalReportOnDisconnectFailure    {boolean}  on a disconnect where the final
 *                                                      report fails, save a stub record
 *                                                      instead of re-throwing
 *   fallbackGreeting(config)                 -> string  used when AI greeting generation fails
 *   fallbackFirstQuestion(config)            -> string  used when the first-question call fails
 *   onSessionStarted(socket, config)         -> Promise  side effects at interview start
 *   persistResults(sessionId, result, socket)-> Promise<{ assessmentId }>
 */

const skillFlow = require('./skill-interview/interview.flow');
const jobFlow   = require('./post-interview/interview.flow');

const SKILL_INTERVIEW_TYPES = new Set(['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION']);

/** @param {string} interviewType */
module.exports = (interviewType) => (SKILL_INTERVIEW_TYPES.has(interviewType) ? skillFlow : jobFlow);

module.exports.SKILL_INTERVIEW_TYPES = SKILL_INTERVIEW_TYPES;
