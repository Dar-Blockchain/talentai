'use strict';

const bedrock  = require('../../../../helpers/bedrock.helpers');
const AIUtils  = require('./ai.utils');
const { findLeastAskedArea, calculateAreaQualityAverage } = require('./coverage.helpers');
const { DECISION_ENGINE_SYSTEM } = require('../prompts/analysis.prompts');

// Quality thresholds for dynamic question-count limits per area
const QUALITY_THRESHOLDS = { EXCELLENT: 75, GOOD: 60, MODERATE: 40, POOR: 30 };
const QUESTIONS_PER_QUALITY = { EXCELLENT: 2, GOOD: 3, MODERATE: 4, POOR: 2 };
const MAX_QUESTIONS_PER_AREA = 5; // absolute fallback cap

/**
 * DecisionEngineAI â€” decides what the interview should do next:
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
      // â”€â”€ Build question-count map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const areaQuestionCounts = {};
      for (const [name, data] of Object.entries(session.coverage?.areas || {})) {
        areaQuestionCounts[name] = data.questionsAsked || 0;
      }

      // â”€â”€ Identify the current topic area â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const recentInterviewerMessages = session.conversation
        .filter(e => e.type === 'interviewer')
        .slice(-2);
      const currentArea = recentInterviewerMessages.at(-1)?.metadata?.targetAreas?.[0] ?? null;

      // â”€â”€ Rule 1: Time budget exhausted â†’ move to least-asked area â”€â”€â”€â”€â”€â”€â”€â”€
      if (currentArea && session.timeBudgetPerAreaMs) {
        const areaData = session.coverage?.areas?.[currentArea];
        if (areaData?.startTime) {
          const elapsed = Date.now() - areaData.startTime;
          if (elapsed >= session.timeBudgetPerAreaMs) {
            console.log(`â° [Time Budget] Exhausted for "${currentArea}" (${Math.round(elapsed / 1000)}s)`);
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

      // â”€â”€ Rule 2: Quality-based question limit reached â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      if (currentArea && areaQuestionCounts[currentArea] > 0) {
        const quality     = calculateAreaQualityAverage(session.conversation, currentArea, areaQuestionCounts[currentArea]);
        let maxForArea    = MAX_QUESTIONS_PER_AREA;

        if      (quality >= QUALITY_THRESHOLDS.EXCELLENT) { maxForArea = QUESTIONS_PER_QUALITY.EXCELLENT; console.log(`âš¡ [Smart Limit] Excellent (${quality.toFixed(1)}) in ${currentArea} â€” max ${maxForArea}q`); }
        else if (quality >= QUALITY_THRESHOLDS.GOOD)      { maxForArea = QUESTIONS_PER_QUALITY.GOOD;      console.log(`âœ… [Smart Limit] Good (${quality.toFixed(1)}) in ${currentArea} â€” max ${maxForArea}q`); }
        else if (quality >= QUALITY_THRESHOLDS.MODERATE)  { maxForArea = QUESTIONS_PER_QUALITY.MODERATE;  console.log(`ðŸ“Š [Smart Limit] Moderate (${quality.toFixed(1)}) in ${currentArea} â€” max ${maxForArea}q`); }
        else                                               { maxForArea = QUESTIONS_PER_QUALITY.POOR;      console.log(`âš ï¸  [Smart Limit] Poor (${quality.toFixed(1)}) in ${currentArea} â€” max ${maxForArea}q`); }

        if (areaQuestionCounts[currentArea] >= maxForArea) {
          const forced = {
            decision: 'explore_new_area',
            reasoning: `Asked ${areaQuestionCounts[currentArea]}q on ${currentArea} with ${quality.toFixed(1)}/100 avg quality. ` +
              (quality >= QUALITY_THRESHOLDS.GOOD ? 'Good performance â€” moving on.' : 'Limited value â€” exploring other areas.'),
            targetArea: findLeastAskedArea(session.coverage.areas, currentArea),
            strategy: 'Move to fresh topic for time efficiency',
            confidence: 95,
            expectedDuration: '2-3 minutes',
            forcedBySmartLimit: true,
            areaQuality: quality,
          };
          console.log(`âœ… [Forced] Moving to: ${forced.targetArea}`);
          return forced;
        }
      }

      // â”€â”€ Rule 3: Skip / non-answer â€” stay in area on 1st skip, move on 2nd â”€â”€â”€â”€â”€â”€â”€â”€
      // answeredQuestion: false is set by both the [SKIPPED] short-circuit and
      // the combinedAnalysis LLM when the candidate admits they cannot answer.
      const isNonAnswer = candidateResponse === '[SKIPPED]'
        || allAnalyses?.quality?.answeredQuestion === false;
      if (isNonAnswer && currentArea) {
        const areaSkipCount = session.coverage?.areas?.[currentArea]?.skipCount || 0;
        const reason        = candidateResponse === '[SKIPPED]' ? 'skipped' : 'could not answer';

        // First skip in this area: stay and try a different angle
        if (areaSkipCount <= 1) {
          console.log(`â­ï¸ [Skip Rule] Candidate ${reason} in "${currentArea}" (skip #${areaSkipCount}) â€” staying, different angle`);
          return {
            decision:     'continue_probing',
            targetArea:   currentArea,
            reasoning:    `Candidate ${reason} the question in "${currentArea}" (skip ${areaSkipCount}/2). Ask from a different angle â€” avoid the skipped question.`,
            strategy:     'Different angle on same area â€” skip tracker active',
            confidence:   90,
            forcedBySkip: true,
          };
        }

        // Second+ skip: give up on this area
        const nextArea = findLeastAskedArea(session.coverage.areas, currentArea);
        console.log(`â­ï¸ [Skip Rule] Candidate ${reason} twice in "${currentArea}" â€” moving to "${nextArea}"`);
        return {
          decision:         'explore_new_area',
          targetArea:       nextArea,
          reasoning:        `Candidate ${reason} twice in "${currentArea}". Moving to "${nextArea}".`,
          strategy:         'Area exhausted by repeated skips â€” move on',
          confidence:       99,
          expectedDuration: '2-3 minutes',
          forcedByNonAnswer: true,
        };
      }
      // â”€â”€ LLM decision (no hard rule fired) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
