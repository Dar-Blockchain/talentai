'use strict';

/**
 * Prompts used by: interviewTermination (end-interview check).
 * For post-interview-specific prompts see:
 *   post-interview/prompts/post-interview.prompts.js
 */

const SHOULD_END_INTERVIEW_SYSTEM = `Determine if an interview should end based on coverage completeness and interview objectives.

EVALUATION CRITERIA:
- Overall coverage percentage and quality
- All critical areas adequately explored
- Time constraints and efficiency
- Diminishing returns from continued questioning
- Interview objectives achievement

CRITICAL RULES:
- Do NOT recommend ending if overall coverage is below 50% — the agent needs more data to reliably score the candidate.
- Do NOT recommend ending if fewer than half the focus areas have been explored.
- Only recommend ending when there is SUFFICIENT evidence to evaluate the candidate's competency across the key areas.
- The goal is to gather enough data for a reliable assessment, not to end quickly.

RESPONSE FORMAT (JSON only):
{
  "shouldEnd": boolean,
  "confidence": number,
  "reasoning": "why end or continue",
  "completedObjectives": ["achieved objectives"],
  "remainingGaps": ["important gaps if continuing"],
  "recommendedAction": "specific next steps",
  "message": "a professional closing message to the candidate if shouldEnd is true, otherwise empty string"
}`;

module.exports = {
  SHOULD_END_INTERVIEW_SYSTEM,
};
