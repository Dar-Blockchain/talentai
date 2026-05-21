'use strict';

const bedrock  = require('../../../helpers/bedrock.helpers');
const AIUtils  = require('./AIUtils');
const { findLeastAskedArea, calculateAreaQualityAverage } = require('./coverageHelpers');
const { DECISION_ENGINE_SYSTEM } = require('../interviewPrompts');

// Quality thresholds for dynamic question-count limits per area
const QUALITY_THRESHOLDS = { EXCELLENT: 75, GOOD: 60, MODERATE: 40, POOR: 30 };
const QUESTIONS_PER_QUALITY = { EXCELLENT: 2, GOOD: 3, MODERATE: 4, POOR: 2 };
const MAX_QUESTIONS_PER_AREA = 5; // absolute fallback cap

/**
 * DecisionEngineAI — decides what the interview should do next:
 * stay in the current area, probe deeper, move to a new area, or end.
 *
 * One active method: makeIntelligentDecision.
 */
class DecisionEngineAI {
  /**
   * Determine the next interview action.
   * Returns early (no LLM call) when a hard rule fires (time budget or quality limit).
   * Falls back to an LLM decision when no rule applies.
   *
   * @param {object} session           - Full session object from Redis
   * @param {string} candidateResponse - Latest transcript (or sentinel string)
   * @param {object} allAnalyses       - Combined analysis results passed in
   * @returns {object} decision object { decision, targetArea, reasoning, ... }
   */
  async makeIntelligentDecision(session, candidateResponse, allAnalyses) {
    try {
      // ── Build question-count map ─────────────────────────────────────────
      const areaQuestionCounts = {};
      for (const [name, data] of Object.entries(session.coverage?.areas || {})) {
        areaQuestionCounts[name] = data.questionsAsked || 0;
      }

      // ── Identify the current topic area ─────────────────────────────────
      const recentInterviewerMessages = session.conversation
        .filter(e => e.type === 'interviewer')
        .slice(-2);
      const currentArea = recentInterviewerMessages.at(-1)?.metadata?.targetAreas?.[0] ?? null;

      // ── Rule 1: Time budget exhausted → move to least-asked area ────────
      if (currentArea && session.timeBudgetPerAreaMs) {
        const areaData = session.coverage?.areas?.[currentArea];
        if (areaData?.startTime) {
          const elapsed = Date.now() - areaData.startTime;
          if (elapsed >= session.timeBudgetPerAreaMs) {
            console.log(`⏰ [Time Budget] Exhausted for "${currentArea}" (${Math.round(elapsed / 1000)}s)`);
            const nextArea = findLeastAskedArea(session.coverage.areas, currentArea);
            return {
              decision: 'explore_new_area',
              targetArea: nextArea,
              reasoning: `Time budget for "${currentArea}" exhausted (${Math.round(elapsed / 1000)}s). Moving to "${nextArea}".`,
              forceAdvance: true,
              confidence: 95,
            };
          }
        }
      }

      // ── Rule 2: Quality-based question limit reached ─────────────────────
      if (currentArea && areaQuestionCounts[currentArea] > 0) {
        const quality     = calculateAreaQualityAverage(session.conversation, currentArea, areaQuestionCounts[currentArea]);
        let maxForArea    = MAX_QUESTIONS_PER_AREA;

        if      (quality >= QUALITY_THRESHOLDS.EXCELLENT) { maxForArea = QUESTIONS_PER_QUALITY.EXCELLENT; console.log(`⚡ [Smart Limit] Excellent (${quality.toFixed(1)}) in ${currentArea} — max ${maxForArea}q`); }
        else if (quality >= QUALITY_THRESHOLDS.GOOD)      { maxForArea = QUESTIONS_PER_QUALITY.GOOD;      console.log(`✅ [Smart Limit] Good (${quality.toFixed(1)}) in ${currentArea} — max ${maxForArea}q`); }
        else if (quality >= QUALITY_THRESHOLDS.MODERATE)  { maxForArea = QUESTIONS_PER_QUALITY.MODERATE;  console.log(`📊 [Smart Limit] Moderate (${quality.toFixed(1)}) in ${currentArea} — max ${maxForArea}q`); }
        else                                               { maxForArea = QUESTIONS_PER_QUALITY.POOR;      console.log(`⚠️  [Smart Limit] Poor (${quality.toFixed(1)}) in ${currentArea} — max ${maxForArea}q`); }

        if (areaQuestionCounts[currentArea] >= maxForArea) {
          const forced = {
            decision: 'explore_new_area',
            reasoning: `Asked ${areaQuestionCounts[currentArea]}q on ${currentArea} with ${quality.toFixed(1)}/100 avg quality. ` +
              (quality >= QUALITY_THRESHOLDS.GOOD ? 'Good performance — moving on.' : 'Limited value — exploring other areas.'),
            targetArea: findLeastAskedArea(session.coverage.areas, currentArea),
            strategy: 'Move to fresh topic for time efficiency',
            confidence: 95,
            expectedDuration: '2-3 minutes',
            forcedBySmartLimit: true,
            areaQuality: quality,
          };
          console.log(`✅ [Forced] Moving to: ${forced.targetArea}`);
          return forced;
        }
      }

      // ── LLM decision (no hard rule fired) ───────────────────────────────
      const userPrompt = `SESSION DATA:
${JSON.stringify({
        coverage: session.coverage,
        recentConversation: session.conversation.slice(-5),
        config: { targetRole: session.config.context.targetRole, duration: session.config.sessionSettings.duration },
        questionCounts: areaQuestionCounts,
        currentArea,
      }, null, 2)}

LATEST RESPONSE: "${candidateResponse}"

ANALYSES:
${JSON.stringify(allAnalyses, null, 2)}

QUESTION COUNTS PER AREA (Max 5 recommended):
${JSON.stringify(areaQuestionCounts, null, 2)}

Current Topic Area: ${currentArea || 'N/A'}

Make the next intelligent decision for interview progression.`;

      const response = await bedrock.callLLM({
        systemPrompt: DECISION_ENGINE_SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true,
      });

      return AIUtils.parseJSONResponse(response.content, 'makeIntelligentDecision');
    } catch (error) {
      console.error('Error in intelligent decision making:', error);
      throw error;
    }
  }
}

module.exports = DecisionEngineAI;
