'use strict';

/**
 * LLM helpers shared by BOTH interview flows (skill assessment + job interview).
 * Each class just: build a prompt from the flow's bundle -> call the model -> parse JSON.
 * The prompt text itself lives in {skill,post}-interview/prompts/*.prompts.js.
 *
 *   AIUtils            — parse LLM JSON (with fallbacks) + a promise-timeout helper
 *   MemoryAI           — is this question a near-duplicate? (RAG vector search, no LLM)
 *   CoverageAnalysisAI — how well did the answer cover each focus area?
 *   QuestionGeneratorAI — pick the next question
 */

const bedrock      = require('../../../utils/bedrock-client');
const promptBundle  = require('../prompt-bundle');
const ragService    = require('./interview.rag');

// ─────────────────────────────────────────────────────────────────────────────
// AIUtils — parse LLM JSON (with fallbacks) + a promise-timeout helper
// ─────────────────────────────────────────────────────────────────────────────

// parseJSONResponse's recovery strategies, tried in order:

/** Strip a ```json ... ``` fence if present, else return the text unchanged. */
function stripCodeFence(text) {
  if (!text.trimStart().startsWith('```')) return text;
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  return match ? match[1] : text;
}

/** Grab the substring between the first `{` and the last `}`. */
function extractBraceSubstring(text) {
  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');
  return start !== -1 && end > start ? text.substring(start, end + 1) : null;
}

/**
 * Repair JSON truncated mid-object (token limit hit): drop any dangling
 * unfinished key, then close whatever `{`/`[` were left open (ignoring
 * brackets inside string literals).
 */
function repairTruncatedJson(text) {
  const start = text.indexOf('{');
  if (start === -1) return null;

  let body = text.substring(start).replace(/,?\s*"[^"]*$/, ''); // drop dangling key
  let openBraces = 0, openBrackets = 0, inString = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === '"' && body[i - 1] !== '\\') inString = !inString;
    if (inString) continue;
    if (ch === '{') openBraces++;
    else if (ch === '}') openBraces--;
    else if (ch === '[') openBrackets++;
    else if (ch === ']') openBrackets--;
  }
  body = body.replace(/,\s*$/, '');

  const closing = ']'.repeat(Math.max(0, openBrackets)) + '}'.repeat(Math.max(0, openBraces));
  return closing ? body + closing : null;
}

class AIUtils {
  /**
   * Parse a JSON response from an LLM, trying recovery strategies in order:
   *  1. Strip markdown code fences, then JSON.parse
   *  2. Extract the first {...} substring and parse it
   *  3. Repair a truncated JSON by closing unclosed brackets
   * Falls back to a canned shape from getFallbackResponse() if all else fails.
   */
  static parseJSONResponse(responseContent, methodName) {
    try {
      return JSON.parse(stripCodeFence(responseContent));
    } catch {
      console.warn(`⚠️ JSON parse failed in ${methodName}, trying fallback extraction`);
    }

    const extracted = extractBraceSubstring(responseContent);
    if (extracted) {
      try {
        return JSON.parse(extracted);
      } catch {
        // fall through to repair
      }
    }

    const repaired = repairTruncatedJson(responseContent);
    if (repaired) {
      try {
        console.warn(`🔧 [${methodName}] Truncation repair: closed unfinished JSON`);
        return JSON.parse(repaired);
      } catch {
        // all strategies failed
      }
    }

    console.error(`All JSON parse strategies failed in ${methodName}`);
    return AIUtils.getFallbackResponse(methodName, responseContent);
  }

  /**
   * Canned fallback shape for each pipeline step, keyed by method name.
   * Returned when the LLM output can't be parsed, so the interview keeps running.
   * (`buildAgentPersona` only ever fires in a job interview — skill tests skip it.)
   */
  static getFallbackResponse(methodName, originalContent = '') {
    const preview = originalContent.substring(0, 100) + (originalContent.length > 100 ? '...' : '');
    const fallbacks = {
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

// ─────────────────────────────────────────────────────────────────────────────
// MemoryAI — question deduplication (RAG vector search, ~50ms, no LLM call)
// ─────────────────────────────────────────────────────────────────────────────

class MemoryAI {
  /**
   * Check if a proposed question is too similar to one already asked.
   *
   * @returns {{ isSimilar: boolean, confidence: number, reasoning: string, similarQuestions: Array, recommendations: string }}
   */
  async analyzeQuestionSimilarity(newQuestion, sessionHistory, sessionId) {
    try {
      const result = await ragService.findSimilarQuestions(sessionId, newQuestion);
      return {
        isSimilar: result.isSimilar,
        confidence: result.isSimilar ? Math.round(result.score * 100) : 0,
        reasoning: result.isSimilar
          ? `Similar to: "${result.similarQuestion}" (score: ${result.score.toFixed(2)})`
          : 'No similar questions found via vector search',
        similarQuestions: result.isSimilar
          ? [{ question: result.similarQuestion, similarity: result.score }]
          : [],
        recommendations: result.isSimilar
          ? 'Generate alternative question for same area'
          : 'Question is unique',
      };
    } catch (error) {
      console.error('Error in analyzeQuestionSimilarity:', error);
      return { isSimilar: false, confidence: 0, reasoning: 'Analysis failed', error: error.message };
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CoverageAnalysisAI — how well has the candidate covered each focus area?
// ─────────────────────────────────────────────────────────────────────────────

class CoverageAnalysisAI {
  /**
   * Analyse a candidate response against the current coverage state.
   * Returns which areas were impacted and by how much.
   *
   * @param {string} candidateResponse - Raw transcript or sentinel (e.g. "[SILENCE]")
   * @param {object} currentCoverage   - Current coverage state from session
   * @param {Array}  focusAreas        - intelligenceContext.focusAreas from session config
   * @param {Array}  sessionHistory    - Full conversation array (last 20 entries used)
   * @param {string} interviewType     - session.config.interviewType (picks the prompt bundle)
   */
  async analyzeCoverageIntelligently(candidateResponse, currentCoverage, focusAreas, sessionHistory, interviewType) {
    try {
      const { COVERAGE_ANALYSIS_SYSTEM } = promptBundle(interviewType);
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

// ─────────────────────────────────────────────────────────────────────────────
// QuestionGeneratorAI — the next interview question
// ─────────────────────────────────────────────────────────────────────────────

class QuestionGeneratorAI {
  /**
   * @param {object}      session          - Full session object from Redis
   * @param {object}      coverageAnalysis - Output of CoverageAnalysisAI (weakest areas etc.)
   * @param {object}      memoryAnalysis   - { previousQuestions: [...] } (unused; kept for call-site compat)
   * @param {object|null} questionStrategy - { mode, targetArea, context } from decideQuestionStrategy
   * @param {object|null} questionStyle    - { id, instruction } from selectQuestionStyle
   */
  async generateIntelligentQuestion(session, coverageAnalysis, memoryAnalysis, questionStrategy = null, questionStyle = null) {
    try {
      const P = promptBundle(session.config.interviewType);

      const persona          = session.agentPersona || {};
      const candidateProfile = session.candidateProfile || {};
      const interviewType    = session.config.interviewType;

      const experienceLevel     = persona.job?.experienceLevel || session.config.context?.experienceLevel || 'mid';
      const skillQuestionsAsked = (session.conversation || []).filter(e => e.type === 'interviewer').length;
      const focusAreaNames      = Object.keys(session.coverage?.areas || {});

      const systemPrompt = P.buildQuestionSystem({
        langInstruction:    P.getLanguageInstruction(session.config),
        personaBlock:       P.buildPersonaBlock(persona),
        profileBlock:       P.buildProfileBlock(candidateProfile),
        strategyBlock:      P.buildStrategyBlock(questionStrategy),
        questionGuidelines: P.buildQuestionGuidelines({
          interviewType,
          targetRole: session.config.context?.targetRole,
          focusAreaNames,
          skillQuestionsAsked,
          experienceLevel,
        }),
        styleInstruction:   P.buildStyleInstruction(candidateProfile),
        questionStyleBlock: P.buildQuestionStyleBlock(questionStyle),
        questionStyleId:    questionStyle?.id,
        jdRules:            P.JD_RULES,
        difficultyRules:    P.DIFFICULTY_RULES,
      });

      const userPrompt = P.buildQuestionUser(session, coverageAnalysis);

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.75,
        maxTokens: 500,
        timeout: 30000,
        useFastModel: true,
      });

      return AIUtils.parseJSONResponse(response.content, 'generateIntelligentQuestion');
    } catch (error) {
      console.error('Error generating intelligent question:', error);
      throw error;
    }
  }

  /**
   * Generate a targeted question for a specific area — dedup fallback when the
   * proposed question is too similar to a previous one.
   */
  async generateTargetedQuestionForArea(areaName, areaData, candidateHistory, roleContext, language = 'en', interviewType = 'HR_INTERVIEW') {
    try {
      const P = promptBundle(interviewType);

      const relevantHistory = candidateHistory.filter(e =>
        e.type === 'candidate' &&
        (e.content.toLowerCase().includes(areaName.toLowerCase()) ||
         e.aiAnalysis?.topicsDiscussed?.includes(areaName))
      );

      const askedQuestions = candidateHistory
        .filter(e => e.type === 'interviewer')
        .map(e => `- ${e.content}`)
        .join('\n');

      const userPrompt = P.buildTargetedQuestionUser({ areaName, areaData, roleContext, askedQuestions, relevantHistory });

      const aiResponse = await bedrock.callLLM({
        systemPrompt: P.buildTargetedQuestionSystem(language),
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.6,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true,
      });

      const responseContent = aiResponse.content;
      if (responseContent.length < 10 || !responseContent.includes('{')) {
        throw new Error(`AI returned malformed response: "${responseContent}"`);
      }

      const parsed = AIUtils.parseJSONResponse(responseContent, 'generateTargetedQuestionForArea');
      if (!parsed.question || parsed.question.length < 5) {
        throw new Error('AI response missing valid question field');
      }

      return parsed;
    } catch (error) {
      console.error(`Error generating targeted question for area: ${areaName} — ${error.message}`);
      throw error;
    }
  }
}

module.exports = { AIUtils, MemoryAI, CoverageAnalysisAI, QuestionGeneratorAI };
