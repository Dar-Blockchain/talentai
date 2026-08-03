'use strict';

const bedrock  = require('../../../../utils/bedrock-client');
const AIUtils  = require('./ai.utils');
const { COVERAGE_ANALYSIS_SYSTEM } = require('../prompts/analysis.prompts');

/**
 * CoverageAnalysisAI â€” evaluates how well the candidate has covered each focus area.
 * One active method: analyzeCoverageIntelligently.
 */
class CoverageAnalysisAI {
  /**
   * Analyse a candidate response against the current coverage state.
   * Returns which areas were impacted and by how much.
   *
   * @param {string}   candidateResponse - Raw transcript or sentinel (e.g. "[SILENCE]")
   * @param {object}   currentCoverage   - Current coverage state from session
   * @param {Array}    focusAreas        - intelligenceContext.focusAreas from session config
   * @param {Array}    sessionHistory    - Full conversation array (last 20 entries used)
   * @returns {object} parsedCoverageAnalysis
   */
  async analyzeCoverageIntelligently(candidateResponse, currentCoverage, focusAreas, sessionHistory) {
    try {
      const contextHistory = sessionHistory.slice(-20)
        .map(e => `${e.type}: ${e.content}`)
        .join('\n');

      const userPrompt = `CANDIDATE RESPONSE: "${candidateResponse}"

CURRENT COVERAGE STATE:
${JSON.stringify(currentCoverage, null, 2)}

FOCUS AREAS TO EVALUATE:
${JSON.stringify(focusAreas, null, 2)}

RECENT CONVERSATION CONTEXT:
${contextHistory}

Analyze this response intelligently for coverage of focus areas. Look for implicit evidence and progressive skill demonstration.`;

      const response = await bedrock.callLLM({
        systemPrompt: COVERAGE_ANALYSIS_SYSTEM,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.2,
        maxTokens: 1200,
        timeout: 30000,
        useFastModel: true,
      });

      return AIUtils.parseJSONResponse(response.content, 'analyzeCoverageIntelligently');
    } catch (error) {
      console.error('Error in intelligent coverage analysis:', error);
      throw error;
    }
  }
}

module.exports = CoverageAnalysisAI;
