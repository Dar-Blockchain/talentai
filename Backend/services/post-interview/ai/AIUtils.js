'use strict';

/**
 * Shared AI utilities — JSON parsing with multi-stage fallback, and a promise timeout wrapper.
 * No external dependencies; safe to import anywhere.
 */
class AIUtils {
  /**
   * Parse a JSON response from an LLM, with three recovery strategies:
   *  1. Strip markdown code fences, then JSON.parse
   *  2. Extract the first {...} substring and parse it
   *  3. Repair a truncated JSON by closing unclosed brackets
   * Falls back to a canned shape from getFallbackResponse() if all else fails.
   */
  static parseJSONResponse(responseContent, methodName) {
    try {
      let cleaned = responseContent;
      if (cleaned.trimStart().startsWith('```')) {
        const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (fenceMatch) cleaned = fenceMatch[1];
      }
      return JSON.parse(cleaned);
    } catch {
      console.warn(`⚠️ JSON parse failed in ${methodName}, trying fallback extraction`);
    }

    // Strategy 2: extract first {...} substring
    try {
      const start = responseContent.indexOf('{');
      const end   = responseContent.lastIndexOf('}');
      if (start !== -1 && end > start) {
        return JSON.parse(responseContent.substring(start, end + 1));
      }
    } catch {
      // fall through to repair
    }

    // Strategy 3: repair truncated JSON
    try {
      const start = responseContent.indexOf('{');
      if (start !== -1) {
        let truncated = responseContent.substring(start);
        truncated = truncated.replace(/,?\s*"[^"]*$/, ''); // remove dangling key
        let openBraces = 0, openBrackets = 0, inString = false;
        for (let i = 0; i < truncated.length; i++) {
          const ch = truncated[i];
          if (ch === '"' && truncated[i - 1] !== '\\') inString = !inString;
          if (!inString) {
            if (ch === '{') openBraces++;
            else if (ch === '}') openBraces--;
            else if (ch === '[') openBrackets++;
            else if (ch === ']') openBrackets--;
          }
        }
        truncated = truncated.replace(/,\s*$/, '');
        const closing = ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces));
        if (closing.length > 0) {
          console.warn(`🔧 [${methodName}] Truncation repair: added ${closing.length} closing brackets`);
          return JSON.parse(truncated + closing);
        }
      }
    } catch {
      // all strategies failed
    }

    console.error(`All JSON parse strategies failed in ${methodName}`);
    return AIUtils.getFallbackResponse(methodName, responseContent);
  }

  /**
   * Canned fallback shapes keyed by method name.
   * Returned when LLM output is unparseable so the pipeline keeps running.
   */
  static getFallbackResponse(methodName, originalContent = '') {
    const preview = originalContent.substring(0, 100) + (originalContent.length > 100 ? '...' : '');
    const fallbacks = {
      analyzeQuestionSimilarity: {
        isSimilar: false, confidence: 0,
        reasoning: 'Analysis failed, assuming different',
        similarQuestions: [], recommendations: 'Manual review needed', fallback: true
      },
      analyzeCoverageIntelligently: {
        coverageUpdates: {},
        overallAssessment: { totalCoverage: 0, strongestAreas: [], weakestAreas: [], recommendedFocus: [] },
        fallback: true, originalContent: preview
      },
      generateIntelligentQuestion: {
        question: "Can you tell me more about your experience?",
        targetAreas: ["General"],
        reasoning: "Fallback question due to generation failure",
        expectedOutcomes: ["Basic response"],
        followUpStrategy: "Continue conversation",
        fallback: true
      },
      makeIntelligentDecision: {
        decision: "continue_probing",
        reasoning: "Default decision due to analysis failure",
        targetArea: "General", strategy: "Ask follow-up question",
        confidence: 50, expectedDuration: "2-3 minutes", fallback: true
      },
      updateRealTimeReport: {
        strengths: ["Communication attempted"],
        weaknesses: ["Analysis unavailable"],
        recommendations: ["Continue interview for better assessment"],
        scores: { communication: 60, overall: 60 },
        overallProgress: 50,
        aiInsights: ["Report generation failed, using fallback"],
        trends: ["Unable to analyze trends"], fallback: true
      },
      combinedAnalysis: {
        quality: { score: 10, answeredQuestion: false, depthLevel: "surface", isOffTopic: false, completeness: "avoided" },
        skills: { demonstrated: [], hinted: [], gaps: [] },
        coverage: { areasImpacted: [] },
        style: { verbosity: "detailed", confidence: "moderate", usesExamples: false },
        interestingTopics: [],
        shouldEnd: { shouldEnd: false, reason: "" },
        fallback: true
      },
      buildAgentPersona: {
        mustHaveSkills: [], niceToHaveSkills: [], keyBehaviors: [], redFlags: [],
        seniorityExpectations: "Standard expectations",
        domainSpecificTopics: [],
        agentTone: "professional and conversational",
        fallback: true
      },
    };

    return fallbacks[methodName] || { error: 'Parsing failed', fallback: true };
  }

  /**
   * Race a promise against a timeout. Rejects with a descriptive error if the
   * promise doesn't resolve within timeoutMs.
   */
  static withTimeout(promise, timeoutMs, label = 'AI call') {
    let timerId;
    const timeout = new Promise((_, reject) => {
      timerId = setTimeout(
        () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timerId));
  }
}

module.exports = AIUtils;
