/**
 * Intelligent Interview Service
 * Core AI engine for adaptive interview management
 */

const bedrock = require("../helpers/bedrock.helpers");
const ragService = require("./rag.service");
const configManager = require("../utils/config-manager");
const redisSessionManager = require("../utils/redis-session-manager");
const Post = require("../models/Post.model");
require('dotenv').config();

/**
 * Shared AI utilities for JSON parsing and error handling
 */
class AIUtils {
  /**
   * Robust JSON parsing with fallback handling
   */
  static parseJSONResponse(responseContent, methodName) {
    try {
      // Try direct parsing first
      return JSON.parse(responseContent);
    } catch (error) {
      console.error(`JSON parsing error in ${methodName}:`, error.message);
      console.error('Response content (first 200 chars):', responseContent.substring(0, 200));

      try {
        // Extract JSON from markdown code blocks
        const jsonMatch = responseContent.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }

        // Extract JSON that might have text before/after
        const jsonStart = responseContent.indexOf('{');
        const jsonEnd = responseContent.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
          const jsonSubstring = responseContent.substring(jsonStart, jsonEnd + 1);
          return JSON.parse(jsonSubstring);
        }

        // Return fallback structure based on method
        return AIUtils.getFallbackResponse(methodName, responseContent);
      } catch (fallbackError) {
        console.error(`Fallback parsing also failed in ${methodName}:`, fallbackError.message);
        return AIUtils.getFallbackResponse(methodName, responseContent);
      }
    }
  }

  /**
   * Get fallback response structure when JSON parsing fails
   */
  static getFallbackResponse(methodName, originalContent) {
    const fallbacks = {
      'analyzeResponseIntelligence': {
        skillsInferred: ['Communication'],
        competenciesShown: ['Basic response'],
        topicsDiscussed: ['General discussion'],
        depthLevel: 'moderate',
        communicationQuality: 'fair',
        keyInsights: ['Response provided but analysis failed'],
        fallback: true,
        originalContent: originalContent.substring(0, 100) + '...'
      },
      'analyzeQuestionSimilarity': {
        isSimilar: false,
        confidence: 0,
        reasoning: 'Analysis failed, assuming different',
        similarQuestions: [],
        recommendations: 'Manual review needed',
        fallback: true
      },
      'analyzeCoverageIntelligently': {
        coverageUpdates: {},
        overallAssessment: {
          totalCoverage: 0,
          strongestAreas: [],
          weakestAreas: [],
          recommendedFocus: []
        },
        fallback: true,
        originalContent: originalContent.substring(0, 100) + '...'
      },
      'generateIntelligentQuestion': {
        question: "Can you tell me more about your experience?",
        targetAreas: ["General"],
        reasoning: "Fallback question due to generation failure",
        expectedOutcomes: ["Basic response"],
        followUpStrategy: "Continue conversation",
        fallback: true
      },
      'makeIntelligentDecision': {
        decision: "continue_probing",
        reasoning: "Default decision due to analysis failure",
        targetArea: "General",
        strategy: "Ask follow-up question",
        confidence: 50,
        expectedDuration: "2-3 minutes",
        fallback: true
      },
      'updateRealTimeReport': {
        strengths: ["Communication attempted"],
        weaknesses: ["Analysis unavailable"],
        recommendations: ["Continue interview for better assessment"],
        scores: { communication: 60, overall: 60 },
        overallProgress: 50,
        aiInsights: ["Report generation failed, using fallback"],
        trends: ["Unable to analyze trends"],
        fallback: true
      }
    };

    return fallbacks[methodName] || { error: 'Parsing failed', fallback: true };
  }

  /**
   * Wrap a promise with a timeout. Rejects if the promise doesn't resolve within timeoutMs.
   */
  static withTimeout(promise, timeoutMs, label = 'AI call') {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`${label} timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
      clearTimeout(timeoutId);
    });
  }
}

/**
 * Memory AI - Manages conversation memory and semantic deduplication
 */
class MemoryAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async analyzeQuestionSimilarity(newQuestion, sessionHistory, sessionId) {
    try {
      // Use RAG vector search instead of LLM call (100x faster, near-free)
      const result = await ragService.findSimilarQuestions(sessionId, newQuestion);
      return {
        isSimilar: result.isSimilar,
        confidence: result.isSimilar ? Math.round(result.score * 100) : 0,
        reasoning: result.isSimilar
          ? `Similar to: "${result.similarQuestion}" (score: ${result.score.toFixed(2)})`
          : "No similar questions found via vector search",
        similarQuestions: result.isSimilar ? [{ question: result.similarQuestion, similarity: result.score }] : [],
        recommendations: result.isSimilar ? "Generate alternative question for same area" : "Question is unique"
      };
    } catch (error) {
      console.error('Error in analyzeQuestionSimilarity:', error);
      return { isSimilar: false, confidence: 0, reasoning: "Analysis failed", error: error.message };
    }
  }

  async storeConversationWithIntelligence(sessionId, entry) {
    try {
      // Add AI analysis to the entry
      if (entry.type === 'candidate' && entry.content) {
        entry.aiAnalysis = await this.analyzeResponseIntelligence(entry.content);
      }

      return await this.sessionManager.addConversationEntry(sessionId, entry);
    } catch (error) {
      console.error('Error storing conversation with intelligence:', error);
      throw error;
    }
  }

  async analyzeResponseIntelligence(candidateResponse) {
    try {
      const systemPrompt = `Analyze this interview response for intelligence insights that will help with coverage analysis.

EXTRACT:
- Skills/knowledge demonstrated
- Competencies evidenced
- Topics discussed
- Depth of understanding shown
- Communication quality

RESPONSE FORMAT (JSON only):
{
  "skillsInferred": ["specific skills demonstrated"],
  "competenciesShown": ["competencies evidenced"],
  "topicsDiscussed": ["main topics covered"],
  "depthLevel": "shallow|moderate|deep|expert",
  "communicationQuality": "poor|fair|good|excellent",
  "keyInsights": ["important insights about candidate"]
}`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Analyze: "${candidateResponse}"` }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 12000
      });

      return AIUtils.parseJSONResponse(aiResponse.content, 'analyzeResponseIntelligence');
    } catch (error) {
      console.error('Error analyzing response intelligence:', error);
      return { error: error.message };
    }
  }

  /**
   * Analyze if candidate's response adequately answered the interviewer's question
   */
  async analyzeResponseQuality(question, response, targetArea) {
    try {
      const systemPrompt = `You are an expert interview evaluator analyzing if a candidate's response adequately addresses the interviewer's question.

EVALUATION CRITERIA:
- Does the response relate to the question topic?
- Does it provide examples/details specifically asked for?
- Is the response vague, unclear, or evasive?
- Did the candidate dodge or avoid answering directly?
- Is there missing information that should be clarified?

RESPONSE FORMAT (JSON only):
{
  "answeredQuestion": boolean,
  "qualityScore": number (0-100),
  "completeness": "complete|partial|minimal|avoided",
  "missingElements": ["specific elements not addressed"],
  "clarificationNeeded": boolean,
  "suggestedFollowUp": "clarifying question if needed (or null)",
  "reasoning": "detailed explanation of evaluation"
}`;

      const userPrompt = `INTERVIEWER QUESTION: "${question}"

CANDIDATE RESPONSE: "${response}"

TARGET AREA: ${targetArea || 'General'}

Evaluate if the response adequately answered the question. If clarification is needed, suggest a specific follow-up question.`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.3,
        maxTokens: 700,
        timeout: 12000
      });

      const result = AIUtils.parseJSONResponse(aiResponse.content, 'analyzeResponseQuality');

      console.log(`🔍 [Response Quality] ${result.answeredQuestion ? '✅ Answered' : '❌ Not Answered'} - Score: ${result.qualityScore}/100`);

      return result;
    } catch (error) {
      console.error('Error analyzing response quality:', error);
      return {
        answeredQuestion: true, // Default to true on error to not block flow
        qualityScore: 50,
        completeness: 'unknown',
        missingElements: [],
        clarificationNeeded: false,
        suggestedFollowUp: null,
        reasoning: 'Analysis failed: ' + error.message,
        error: error.message
      };
    }
  }
}

/**
 * Coverage Analysis AI - Intelligent topic coverage evaluation
 */
class CoverageAnalysisAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async analyzeCoverageIntelligently(candidateResponse, currentCoverage, focusAreas, sessionHistory) {
    try {
      const systemPrompt = `You are an expert interview coverage analyst. Analyze candidate responses to determine coverage of competency areas.

INTELLIGENCE REQUIREMENTS:
- Infer coverage even when keywords aren't explicitly mentioned
- Recognize implicit demonstrations of skills/knowledge
- Evaluate depth and quality of evidence
- Consider progressive coverage building
- Account for different communication styles

RESPONSE FORMAT (JSON only):
{
  "coverageUpdates": {
    "areaName": {
      "percentageIncrease": number,
      "evidence": ["specific evidence from response"],
      "qualityScore": number,
      "indicators": ["which indicators were addressed"],
      "reasoning": "why this coverage was detected"
    }
  },
  "overallAssessment": {
    "totalCoverage": number,
    "strongestAreas": ["areas"],
    "weakestAreas": ["areas"],
    "recommendedFocus": ["areas needing attention"]
  }
}`;

      const contextHistory = sessionHistory.slice(-20).map(entry =>
        `${entry.type}: ${entry.content}`
      ).join('\n');

      const userPrompt = `CANDIDATE RESPONSE: "${candidateResponse}"

CURRENT COVERAGE STATE:
${JSON.stringify(currentCoverage, null, 2)}

FOCUS AREAS TO EVALUATE:
${JSON.stringify(focusAreas, null, 2)}

RECENT CONVERSATION CONTEXT:
${contextHistory}

Analyze this response intelligently for coverage of focus areas. Look for implicit evidence and progressive skill demonstration.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.2,
        maxTokens: 1200,
        timeout: 15000
      });

      return AIUtils.parseJSONResponse(response.content, 'analyzeCoverageIntelligently');
    } catch (error) {
      console.error('Error in intelligent coverage analysis:', error);
      throw error;
    }
  }

  async determineIfCoverageIsSufficient(areaName, currentCoverage, sessionHistory, targetRole) {
    try {
      const systemPrompt = `You are an expert interviewer determining if a competency area has been sufficiently covered.

EVALUATION CRITERIA:
- Coverage percentage and quality
- Depth of evidence provided
- Consistency across multiple responses
- Relevance to target role requirements
- Progressive demonstration of competency

RESPONSE FORMAT (JSON only):
{
  "isSufficient": boolean,
  "confidence": number,
  "reasoning": "detailed explanation",
  "evidenceStrength": "weak|moderate|strong|excellent",
  "recommendations": "what else might be needed",
  "stopExploring": boolean
}`;

      const areaData = currentCoverage.areas[areaName] || {};
      const areaHistory = sessionHistory.filter(entry =>
        entry.aiAnalysis?.topicsDiscussed?.includes(areaName) ||
        entry.content.toLowerCase().includes(areaName.toLowerCase())
      );

      const userPrompt = `COMPETENCY AREA: ${areaName}
TARGET ROLE: ${targetRole}

CURRENT COVERAGE DATA:
${JSON.stringify(areaData, null, 2)}

RELATED CONVERSATION HISTORY:
${areaHistory.map(entry => `${entry.type}: ${entry.content}`).join('\n')}

Determine if this competency area has been sufficiently explored for the target role.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1,
        maxTokens: 600,
        timeout: 12000
      });

      return AIUtils.parseJSONResponse(response.content, 'determineIfCoverageIsSufficient');
    } catch (error) {
      console.error('Error determining coverage sufficiency:', error);
      return { isSufficient: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }
}

/**
 * Question Generator AI - Creates intelligent, targeted questions
 */
class QuestionGeneratorAI {
  constructor(sessionManager) {
    this.sessionManager = sessionManager;
  }

  async generateIntelligentQuestion(session, coverageAnalysis, memoryAnalysis) {
    try {
      // ENFORCE INTERVIEW TYPE SPECIFIC QUESTION GUIDELINES
      let questionGuidelines = '';

      if (session.config.interviewType === 'TECHNICAL_SKILL') {
        const focusAreaNames = session.config.intelligenceContext?.focusAreas
          ?.map(a => a.skillName || a.area) || [];
        const roleContext = session.config.context.targetRole;

        questionGuidelines = `
⚠️ CRITICAL: This is a TECHNICAL SKILL interview for the role of "${roleContext}".
Ask questions that assess the practical, domain-specific expertise required for this role.

FOCUS AREAS FOR THIS ROLE:
${focusAreaNames.map(a => `- ${a}`).join('\n')}

RULES:
- Ask questions about the focus areas listed above — these define what "technical" means for THIS role
- Probe for real-world experience, implementation details, and best practices
- Match the technical domain to the role (marketing → analytics, campaigns, growth metrics; dev → code, architecture; design → UX process, tools)
- Do NOT ask about topics outside the listed focus areas
- Be natural and conversational
- Assess expertise at ${session.config.context.experienceLevel} level`;
      } else if (session.config.interviewType === 'HR_INTERVIEW') {
        questionGuidelines = `
This is an HR/BEHAVIORAL interview - focus on soft skills, teamwork, cultural fit, and behavioral patterns.`;
      } else if (session.config.interviewType === 'SOFT_SKILL') {
        questionGuidelines = `
This is a SOFT SKILLS interview - focus on communication, emotional intelligence, collaboration, and interpersonal abilities.`;
      }

      const systemPrompt = `You are an expert interviewer generating intelligent, targeted questions based on coverage gaps and conversation flow.

${questionGuidelines}

QUESTION GENERATION PRINCIPLES:
- Target specific coverage gaps identified
- Build naturally on previous conversation
- Match candidate's communication style
- Avoid repetitive or similar questions
- Progress logically through competency exploration
- Be natural and conversational, not robotic
- STRICTLY follow the interview type guidelines above

RESPONSE FORMAT (JSON only):
{
  "question": "the actual question to ask",
  "targetAreas": ["coverage areas this addresses"],
  "reasoning": "why this question was chosen",
  "expectedOutcomes": ["what we hope to learn"],
  "followUpStrategy": "potential follow-up approach"
}`;

      const recentContext = session.conversation.slice(-20).map(entry =>
        `${entry.type}: ${entry.content}`
      ).join('\n');

      // Include full JD context if cached in session
      const jdContext = session.jobDescription
        ? `\nJOB DESCRIPTION:\n${session.jobDescription.description || ''}\n\nREQUIREMENTS:\n${(session.jobDescription.requirements || []).join('\n')}\n\nRESPONSIBILITIES:\n${(session.jobDescription.responsibilities || []).join('\n')}`
        : '';

      const userPrompt = `INTERVIEW CONTEXT:
Role: ${session.config.context.targetRole}
Company: ${session.config.context.targetCompany}
Experience Level: ${session.config.context.experienceLevel}
${jdContext}

CURRENT COVERAGE ANALYSIS:
${JSON.stringify(coverageAnalysis, null, 2)}

MEMORY ANALYSIS:
Previous Questions: ${JSON.stringify(memoryAnalysis?.previousQuestions?.slice(-5) || [])}

RECENT CONVERSATION:
${recentContext}

COVERAGE GAPS TO ADDRESS:
${JSON.stringify(coverageAnalysis?.overallAssessment?.weakestAreas || [])}

Generate the next intelligent question that targets the most important coverage gap while maintaining natural conversation flow. Reference specific job requirements when relevant.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.7,
        maxTokens: 500,
        timeout: 10000
      });

      return AIUtils.parseJSONResponse(response.content, 'generateIntelligentQuestion');
    } catch (error) {
      console.error('Error generating intelligent question:', error);
      throw error;
    }
  }

  async generateTargetedQuestionForArea(areaName, areaData, candidateHistory, roleContext) {
    try {
      const systemPrompt = `Generate a specific, targeted question to explore a particular competency area in depth.

REQUIREMENTS:
- Focus specifically on the target competency area
- Consider candidate's previous responses about this area
- Ask for concrete examples and specific experiences
- Progress from general to specific based on what's already known
- Be engaging and allow candidate to showcase their expertise

CRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

RESPONSE FORMAT (JSON only):
{
  "question": "targeted question for the specific area",
  "focus": "specific aspect of the area being explored",
  "expectedEvidence": ["types of evidence this should reveal"],
  "probeLevel": "surface|moderate|deep",
  "followUpQuestions": ["potential follow-up questions"]
}`;

      const relevantHistory = candidateHistory.filter(entry =>
        entry.type === 'candidate' &&
        (entry.content.toLowerCase().includes(areaName.toLowerCase()) ||
         entry.aiAnalysis?.topicsDiscussed?.includes(areaName))
      );

      const userPrompt = `TARGET COMPETENCY AREA: ${areaName}

AREA COVERAGE DATA:
${JSON.stringify(areaData, null, 2)}

ROLE CONTEXT:
${JSON.stringify(roleContext, null, 2)}

CANDIDATE'S PREVIOUS RESPONSES ABOUT THIS AREA:
${relevantHistory.map(entry => entry.content).join('\n---\n')}

Generate a targeted question to explore this competency area more deeply. Respond with ONLY valid JSON.`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.6,
        maxTokens: 600,
        timeout: 12000
      });

      const responseContent = aiResponse.content;

      // Validate response is not suspiciously short or malformed
      if (responseContent.length < 10 || !responseContent.includes('{')) {
        console.error('❌ Malformed AI response for generateTargetedQuestionForArea:', responseContent);
        console.error('   Area:', areaName);
        console.error('   Response length:', responseContent.length);
        throw new Error(`AI returned malformed response: "${responseContent}"`);
      }

      const parsedResponse = AIUtils.parseJSONResponse(responseContent, 'generateTargetedQuestionForArea');

      // Validate the parsed response has required fields
      if (!parsedResponse.question || parsedResponse.question.length < 5) {
        console.error('❌ Parsed response missing valid question field:', parsedResponse);
        throw new Error('AI response missing valid question field');
      }

      return parsedResponse;
    } catch (error) {
      console.error('❌ Error generating targeted question for area:', areaName);
      console.error('   Error message:', error.message);
      console.error('   Error type:', error.constructor.name);
      throw error;
    }
  }
}

/**
 * Decision Engine AI - Makes intelligent interview flow decisions
 */
class DecisionEngineAI {
  constructor(sessionManager, serviceInstance) {
    this.sessionManager = sessionManager;
    this.service = serviceInstance; // Reference to parent IntelligentInterviewService
  }

  async makeIntelligentDecision(session, candidateResponse, allAnalyses) {
    try {
      // DYNAMIC QUESTION LIMITS based on response quality for time efficiency
      const QUALITY_THRESHOLDS = {
        EXCELLENT: 75,    // Skip after 2 questions - candidate clearly competent
        GOOD: 60,         // Skip after 3 questions - good evidence gathered
        MODERATE: 40,     // Ask up to 4 questions - need more evidence
        POOR: 30          // Skip after 2 questions - no point continuing on this topic
      };

      const QUESTIONS_PER_QUALITY = {
        EXCELLENT: 2,     // Quick validation, move on (save time)
        GOOD: 3,          // Standard exploration
        MODERATE: 4,      // Need more evidence
        POOR: 2           // Don't waste time on weak areas
      };

      // Check question counts per area to enforce dynamic limits
      const areaQuestionCounts = {};
      const MAX_QUESTIONS_PER_AREA = 5; // Absolute maximum fallback

      if (session.coverage && session.coverage.areas) {
        Object.keys(session.coverage.areas).forEach(areaName => {
          const area = session.coverage.areas[areaName];
          areaQuestionCounts[areaName] = area.questionsAsked || 0;
        });
      }

      // Determine current topic area from recent conversation
      const recentInterviewerMessages = session.conversation
        .filter(entry => entry.type === 'interviewer')
        .slice(-2);

      let currentArea = null;
      if (recentInterviewerMessages.length > 0) {
        const lastQuestion = recentInterviewerMessages[recentInterviewerMessages.length - 1];
        currentArea = lastQuestion.metadata?.targetAreas?.[0];
      }

      // TIME BUDGET CHECK: Force advance if area time budget exhausted
      if (currentArea && session.timeBudgetPerAreaMs) {
        const areaData = session.coverage?.areas?.[currentArea];
        if (areaData?.startTime) {
          const areaElapsed = Date.now() - areaData.startTime;
          if (areaElapsed >= session.timeBudgetPerAreaMs) {
            console.log(`⏰ [Time Budget] Exhausted for area "${currentArea}" (${Math.round(areaElapsed/1000)}s >= ${Math.round(session.timeBudgetPerAreaMs/1000)}s budget)`);
            const nextArea = this.service.findLeastAskedArea(session.coverage.areas, currentArea);
            return {
              decision: 'explore_new_area',
              targetArea: nextArea,
              reasoning: `Time budget for "${currentArea}" exhausted (${Math.round(areaElapsed/1000)}s). Moving to "${nextArea}".`,
              forceAdvance: true,
              confidence: 95
            };
          }
        }
      }

      // SMART DECISION: Calculate quality-based limit for current area
      let forcedDecision = null;
      let maxQuestionsForArea = MAX_QUESTIONS_PER_AREA;

      if (currentArea && areaQuestionCounts[currentArea] > 0) {
        // Calculate average quality for responses in this area
        const currentAreaQuality = this.service.calculateAreaQualityAverage(
          session.conversation,
          currentArea,
          areaQuestionCounts[currentArea]
        );

        // Determine dynamic limit based on quality
        if (currentAreaQuality >= QUALITY_THRESHOLDS.EXCELLENT) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.EXCELLENT;
          console.log(`⚡ [Smart Limit] Excellent responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else if (currentAreaQuality >= QUALITY_THRESHOLDS.GOOD) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.GOOD;
          console.log(`✅ [Smart Limit] Good responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else if (currentAreaQuality >= QUALITY_THRESHOLDS.MODERATE) {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.MODERATE;
          console.log(`📊 [Smart Limit] Moderate responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions`);
        } else {
          maxQuestionsForArea = QUESTIONS_PER_QUALITY.POOR;
          console.log(`⚠️  [Smart Limit] Poor responses (${currentAreaQuality.toFixed(1)}/100) in ${currentArea} - limit to ${maxQuestionsForArea} questions, moving on`);
        }

        // Force move to new area if dynamic limit reached
        if (areaQuestionCounts[currentArea] >= maxQuestionsForArea) {
          console.log(`🚫 [Smart Question Limit] Area "${currentArea}" has ${areaQuestionCounts[currentArea]} questions (dynamic max: ${maxQuestionsForArea} based on quality ${currentAreaQuality.toFixed(1)}/100)`);
          forcedDecision = {
            decision: "explore_new_area",
            reasoning: `Asked ${areaQuestionCounts[currentArea]} questions on ${currentArea} with ${currentAreaQuality.toFixed(1)}/100 average quality. ` +
                      (currentAreaQuality >= QUALITY_THRESHOLDS.GOOD
                        ? 'Good performance - moving on efficiently.'
                        : 'Limited value from additional questions - exploring other areas.'),
            targetArea: this.service.findLeastAskedArea(session.coverage.areas, currentArea),
            strategy: "Move to fresh topic for time efficiency",
            confidence: 95,
            expectedDuration: "2-3 minutes",
            forcedBySmartLimit: true,
            areaQuality: currentAreaQuality
          };
          console.log(`✅ [Forced Decision] Moving to area: ${forcedDecision.targetArea}`);
          return forcedDecision;
        }
      }

      const systemPrompt = `You are an expert interview decision engine. Make intelligent decisions about interview flow based on comprehensive analysis.

DECISION OPTIONS:
1. "continue_probing" - Ask follow-up on current topic
2. "explore_new_area" - Move to different competency area
3. "seek_examples" - Ask for specific examples/evidence
4. "wrap_up_area" - Complete current area exploration
5. "end_interview" - Interview objectives achieved

DECISION FACTORS:
- Coverage gaps and priorities
- Conversation flow and natural progression
- Time management and efficiency
- Candidate engagement and communication style
- Quality and depth of evidence gathered
- Question count per area (avoid asking too many on same topic)

IMPORTANT: Avoid asking more than 3-5 questions on the same topic to prevent repetition and maintain candidate engagement.

RESPONSE FORMAT (JSON only):
{
  "decision": "continue_probing|explore_new_area|seek_examples|wrap_up_area|end_interview",
  "reasoning": "detailed explanation of decision",
  "targetArea": "which area to focus on",
  "strategy": "approach for next interaction",
  "confidence": number,
  "expectedDuration": "estimated time for this decision path"
}`;

      const userPrompt = `SESSION DATA:
${JSON.stringify({
        coverage: session.coverage,
        recentConversation: session.conversation.slice(-5),
        config: {
          targetRole: session.config.context.targetRole,
          duration: session.config.sessionSettings.duration
        },
        questionCounts: areaQuestionCounts,
        currentArea: currentArea
      }, null, 2)}

LATEST RESPONSE: "${candidateResponse}"

ANALYSES:
${JSON.stringify(allAnalyses, null, 2)}

QUESTION COUNTS PER AREA (Max 5 recommended):
${JSON.stringify(areaQuestionCounts, null, 2)}

Current Topic Area: ${currentArea || 'N/A'}

Make the next intelligent decision for interview progression. Consider question counts to avoid over-asking on same topic.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 15000
      });

      return AIUtils.parseJSONResponse(response.content, 'makeIntelligentDecision');
    } catch (error) {
      console.error('Error in intelligent decision making:', error);
      throw error;
    }
  }

}

class IntelligentInterviewService {
  constructor() {
    this.sessionManager = redisSessionManager;

    // Initialize AI service components (no longer need Together AI client)
    this.memoryAI = new MemoryAI(this.sessionManager);
    this.coverageAI = new CoverageAnalysisAI(this.sessionManager);
    this.questionAI = new QuestionGeneratorAI(this.sessionManager);
    this.decisionAI = new DecisionEngineAI(this.sessionManager, this);
  }

  /**
   * Initialize service
   */
  async initialize() {
    try {
      // Initialize Redis connection with timeout to prevent blocking
      console.log('🔌 [Service] Attempting to connect to Redis...');
      const redisInitialized = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout after 5 seconds')), 5000)
        )
      ]).catch(err => {
        console.error('⚠️  [Service] Redis initialization failed:', err.message);
        console.warn('⚠️  [Service] Interview service will continue WITHOUT Redis (in-memory mode)');
        console.warn('⚠️  [Service] Sessions will not persist across server restarts');
        console.warn('💡 [Service] To fix: Run `redis-server` or `sudo service redis-server start` in WSL');
        return false;
      });

      if (redisInitialized) {
        console.log('✅ [Service] Intelligent Interview Service initialized with Redis');
        console.log('💾 [Service] Sessions will be stored in Redis with 2-hour TTL');

        // Test Redis connection with ping
        try {
          const pingTest = await this.sessionManager.client.ping();
          console.log('🏓 [Service] Redis connectivity test:', pingTest);
          console.log('📊 [Service] Redis status:', {
            isConnected: this.sessionManager.isConnected,
            isReady: this.sessionManager.isReady()
          });
        } catch (pingError) {
          console.error('❌ [Service] Redis ping test failed:', pingError.message);
          console.warn('⚠️  [Service] Redis may not be fully operational');
        }
      } else {
        console.log('⚠️  [Service] Intelligent Interview Service initialized WITHOUT Redis (degraded mode)');
        console.log('⚠️  [Service] Interview features may be limited');
      }

      return true;  // Always return true to not block server startup
    } catch (error) {
      console.error('❌ [Service] Failed to initialize Intelligent Interview Service:', error.message);
      console.warn('⚠️  [Service] Server will continue without interview service');
      return true;  // Don't block server startup
    }
  }

  /**
   * Calculate average response quality for a specific area
   * Used for smart question limit decisions
   * @param {Array} conversation - Full conversation history
   * @param {string} areaName - Area to analyze
   * @param {number} questionCount - Number of questions asked in this area
   * @returns {number} Average quality score (0-100)
   */
  calculateAreaQualityAverage(conversation, areaName, questionCount) {
    if (!areaName || questionCount === 0) return 50; // Default to moderate

    // Find all candidate responses related to this area
    const areaResponses = [];

    for (let i = 0; i < conversation.length; i++) {
      const entry = conversation[i];

      // Look for interviewer questions targeting this area
      if (entry.type === 'interviewer' &&
          entry.metadata?.targetAreas?.includes(areaName)) {

        // Get the candidate's response (next entry)
        if (i + 1 < conversation.length && conversation[i + 1].type === 'candidate') {
          const candidateResponse = conversation[i + 1];

          // Extract quality score if available
          if (candidateResponse.metadata?.qualityScore !== undefined) {
            areaResponses.push(candidateResponse.metadata.qualityScore);
          } else if (candidateResponse.aiAnalysis?.qualityScore !== undefined) {
            areaResponses.push(candidateResponse.aiAnalysis.qualityScore);
          }
        }
      }
    }

    // Calculate average
    if (areaResponses.length === 0) return 50; // Default

    const average = areaResponses.reduce((sum, score) => sum + score, 0) / areaResponses.length;

    console.log(`📊 [Quality Analysis] ${areaName}: ${areaResponses.length} responses, avg quality: ${average.toFixed(1)}/100`);

    return average;
  }

  /**
   * Update quality counters for consecutive bad/good answers
   * Used to determine early termination (8 bad or 8 good answers)
   */
  async updateQualityCounters(sessionId, qualityScore) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.qualityTracking) return;

      const tracking = session.qualityTracking;

      const BAD_THRESHOLD = 40;
      const GOOD_THRESHOLD = 75;

      if (qualityScore < BAD_THRESHOLD) {
        // Bad answer: increment bad counter, reset good counter
        tracking.consecutiveBadAnswers++;
        tracking.consecutiveGoodAnswers = 0;
        tracking.totalBadAnswers++;
        console.log(`❌ [Quality Counter] Bad answer ${tracking.consecutiveBadAnswers}/8 (score: ${qualityScore})`);
      } else if (qualityScore >= GOOD_THRESHOLD) {
        // Good answer: increment good counter, reset bad counter
        tracking.consecutiveGoodAnswers++;
        tracking.consecutiveBadAnswers = 0;
        tracking.totalGoodAnswers++;
        console.log(`✅ [Quality Counter] Good answer ${tracking.consecutiveGoodAnswers}/8 (score: ${qualityScore})`);
      } else {
        // Medium quality (40-74): reset both counters
        tracking.consecutiveBadAnswers = 0;
        tracking.consecutiveGoodAnswers = 0;
        console.log(`📊 [Quality Counter] Medium answer (score: ${qualityScore}) - counters reset`);
      }

      tracking.lastQualityScore = qualityScore;

      await this.sessionManager.updateSession(sessionId, { qualityTracking: tracking });
    } catch (error) {
      console.error('❌ Failed to update quality counters:', error.message);
    }
  }

  /**
   * Find area with least questions asked (excluding current area)
   */
  findLeastAskedArea(coverageAreas, excludeArea = null) {
    let minQuestions = Infinity;
    let selectedArea = null;

    Object.keys(coverageAreas).forEach(areaName => {
      if (areaName === excludeArea) return; // Skip current area

      const questionsAsked = coverageAreas[areaName].questionsAsked || 0;
      if (questionsAsked < minQuestions) {
        minQuestions = questionsAsked;
        selectedArea = areaName;
      }
    });

    // If all areas have same count, pick first one that's not excluded
    if (!selectedArea) {
      selectedArea = Object.keys(coverageAreas).find(name => name !== excludeArea);
    }

    return selectedArea || Object.keys(coverageAreas)[0];
  }

  async shouldEndInterview(session, totalDuration) {
    try {
      // 🕐 TIME LIMIT CHECK (20 minutes max by default)
      if (session.interviewStartTime) {
        const elapsedMinutes = (Date.now() - session.interviewStartTime) / 60000;
        const maxDuration = session.maxDurationMinutes || 20;

        if (elapsedMinutes >= maxDuration) {
          console.log(`⏰ [Time Limit] ${elapsedMinutes.toFixed(1)} minutes elapsed (max: ${maxDuration}) - ending interview`);
          return {
            shouldEnd: true,
            confidence: 100,
            reasoning: `Interview time limit of ${maxDuration} minutes has been reached.`,
            completedObjectives: ['Time-based completion'],
            remainingGaps: [],
            recommendedAction: 'End interview - time limit reached',
            terminationReason: 'time_limit_reached',
            message: 'Thank you for your time. We\'ve completed our scheduled time for today.',
            elapsedTime: elapsedMinutes,
            score: 'time_limit'
          };
        }
      }

      // 📊 QUALITY-BASED TERMINATION: Check consecutive answer quality
      if (session.qualityTracking) {
        const tracking = session.qualityTracking;

        // 8 CONSECUTIVE BAD ANSWERS → End with poor score
        if (tracking.consecutiveBadAnswers >= 8) {
          console.log(`🚫 [Poor Quality Termination] 8 consecutive bad answers - ending interview`);
          return {
            shouldEnd: true,
            confidence: 95,
            reasoning: `Candidate provided 8 consecutive low-quality responses (quality < 40), indicating consistent difficulty with technical questions.`,
            completedObjectives: ['Performance assessment completed - insufficient technical competency'],
            remainingGaps: [],
            recommendedAction: 'End interview - insufficient technical competency demonstrated',
            terminationReason: 'poor_quality',
            message: 'Thank you for your time. Let\'s conclude our interview here.',
            badAnswerCount: tracking.consecutiveBadAnswers,
            score: 'poor'
          };
        }

        // 8 CONSECUTIVE GOOD ANSWERS → End with excellent score
        if (tracking.consecutiveGoodAnswers >= 8) {
          console.log(`✅ [Excellent Quality Termination] 8 consecutive good answers - ending interview with good score`);
          return {
            shouldEnd: true,
            confidence: 95,
            reasoning: `Candidate demonstrated 8 consecutive high-quality responses (quality >= 75), showing strong technical competency.`,
            completedObjectives: ['Technical competency validated', 'Strong performance demonstrated', 'Sufficient evidence of expertise'],
            remainingGaps: [],
            recommendedAction: 'End interview - candidate clearly qualified',
            terminationReason: 'excellent_quality',
            message: 'Excellent! You\'ve demonstrated strong understanding. Thank you for your time.',
            goodAnswerCount: tracking.consecutiveGoodAnswers,
            score: 'excellent'
          };
        }
      }

      // EARLY TERMINATION: Calculate overall response quality across all areas
      const allQualityScores = session.conversation
        .filter(entry => entry.type === 'candidate')
        .map(entry => entry.metadata?.qualityScore || entry.aiAnalysis?.qualityScore)
        .filter(score => score !== undefined);

      const overallQualityAverage = allQualityScores.length > 0
        ? allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length
        : 50;

      const candidateResponseCount = Math.floor(session.conversation.length / 2);

      // EARLY TERMINATION: Consistently poor performance after 6+ responses (5-8 minutes)
      if (candidateResponseCount >= 6 && overallQualityAverage < 35) {
        console.log(`❌ [Early Termination - Poor Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses`);
        return {
          shouldEnd: true,
          confidence: 95,
          reasoning: `Candidate consistently provides insufficient technical responses (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Early termination to save time. Technical competency below threshold.`,
          completedObjectives: ['Performance assessment completed - insufficient technical depth'],
          remainingGaps: [],
          recommendedAction: 'End interview - insufficient technical competency demonstrated',
          earlyTermination: true,
          terminationReason: 'poor_performance',
          message: 'Thank you for your time. Let\'s conclude our interview here.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'poor'
        };
      }

      // EARLY SUCCESS: Consistently excellent performance after 8+ responses (10-12 minutes)
      if (candidateResponseCount >= 8 && overallQualityAverage >= 80) {
        console.log(`✅ [Early Success - Excellent Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses`);
        return {
          shouldEnd: true,
          confidence: 90,
          reasoning: `Candidate consistently demonstrates strong technical competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Sufficient evidence gathered across multiple focus areas. Further questioning provides diminishing returns.`,
          completedObjectives: ['Technical competency validated', 'Strong performance across technical focus areas', 'Sufficient evidence of expertise'],
          remainingGaps: [],
          recommendedAction: 'End interview - candidate clearly qualified',
          earlySuccess: true,
          terminationReason: 'excellent_performance',
          message: 'Excellent! You\'ve demonstrated strong understanding. Thank you for your time.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'excellent'
        };
      }

      // Continue with standard evaluation if no early termination
      const systemPrompt = `Determine if an interview should end based on coverage completeness and interview objectives.

EVALUATION CRITERIA:
- Overall coverage percentage and quality
- All critical areas adequately explored
- Time constraints and efficiency
- Diminishing returns from continued questioning
- Interview objectives achievement

RESPONSE FORMAT (JSON only):
{
  "shouldEnd": boolean,
  "confidence": number,
  "reasoning": "why end or continue",
  "completedObjectives": ["achieved objectives"],
  "remainingGaps": ["important gaps if continuing"],
  "recommendedAction": "specific next steps"
}`;

      const userPrompt = `INTERVIEW EVALUATION:
Total Duration: ${totalDuration} minutes
Target Duration: ${session.config.sessionSettings.duration} minutes

COVERAGE STATUS:
${JSON.stringify(session.coverage, null, 2)}

FOCUS AREAS:
${JSON.stringify(session.config.intelligenceContext.focusAreas, null, 2)}

CONVERSATION LENGTH: ${session.conversation.length} exchanges
Determine if interview objectives have been sufficiently met to end the session.`;


      const response = await bedrock.callLLM({
        systemPrompt,
        
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1,
        maxTokens: 500,
        timeout: 12000
      });

      return AIUtils.parseJSONResponse(response.content, 'shouldEndInterview');
    } catch (error) {
      console.error('Error determining interview end:', error);
      return { shouldEnd: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }

  /**
   * Start new interview session
   */
  async startInterview(sessionId, userConfig, candidateId) {
    try {
      console.log(`🚀 [Service] Starting interview session: ${sessionId} for candidate: ${candidateId}`);

      // Check Redis connection status before proceeding
      console.log('🔍 [Service] Checking Redis connection status...');
      console.log('📊 [Service] Redis state:', {
        isConnected: this.sessionManager.isConnected,
        isReady: this.sessionManager.isReady(),
        clientExists: !!this.sessionManager.client
      });

      if (!this.sessionManager.isConnected || !this.sessionManager.client) {
        console.error('❌ [Service] Redis is NOT connected - Cannot start interview');
        throw new Error('Redis connection not available. Please ensure Redis is running.');
      }

      // Create intelligent configuration
      const config = configManager.createIntelligentConfig(userConfig);
      configManager.validateConfig(config);
      console.log('✅ [Service] Config validated');

      // Create session in Redis with time tracking and quality counters
      console.log('💾 [Service] Calling createSession...');
      const session = await this.sessionManager.createSession(sessionId, config, candidateId);
      console.log('✅ [Service] Session created in Redis');

      // Fetch full job description from Post model and cache in session
      let jobDescription = null;
      try {
        const jobId = userConfig.context?.jobId || userConfig.jobId;
        if (jobId) {
          const post = await Post.findById(jobId).select('title companyName jobDetails');
          if (post?.jobDetails) {
            jobDescription = {
              title: post.title,
              companyName: post.companyName,
              description: post.jobDetails.description,
              requirements: post.jobDetails.requirements || [],
              responsibilities: post.jobDetails.responsibilities || []
            };
            console.log(`✅ [Service] Full JD loaded: ${jobDescription.title} (${jobDescription.requirements.length} requirements, ${jobDescription.responsibilities.length} responsibilities)`);

            // Index JD for RAG (runs once, skips if already indexed)
            ragService.indexJobDescription(jobId, jobDescription).catch(err =>
              console.warn('⚠️ [RAG] JD indexing failed (non-blocking):', err.message)
            );
          }
        }
      } catch (jdError) {
        console.warn('⚠️ [Service] Failed to load JD from DB:', jdError.message);
      }

      // Fallback: load JD from config context (sent by getJobInterviewConfig endpoint)
      if (!jobDescription && userConfig.context?.jobDescription) {
        jobDescription = {
          title: userConfig.context.targetRole || 'Position',
          companyName: userConfig.context.targetCompany || 'the company',
          description: userConfig.context.jobDescription,
          requirements: Array.isArray(userConfig.context.requirements)
            ? userConfig.context.requirements
            : [],
          responsibilities: Array.isArray(userConfig.context.responsibilities)
            ? userConfig.context.responsibilities
            : []
        };
        console.log(`✅ [Service] JD loaded from config context: ${jobDescription.title} at ${jobDescription.companyName}`);
      }

      // Initialize interview timing and quality tracking
      const coverageAreas = Object.keys(session.coverage?.areas || {});
      const totalMinutes = config.sessionSettings?.duration || 20;
      const timeBudgetPerAreaMs = coverageAreas.length > 0
        ? (totalMinutes * 60 * 1000) / coverageAreas.length
        : totalMinutes * 60 * 1000;

      await this.sessionManager.updateSession(sessionId, {
        interviewStartTime: Date.now(),
        maxDurationMinutes: totalMinutes,
        timeBudgetPerAreaMs,
        coverageAreaCount: coverageAreas.length,
        jobDescription,
        qualityTracking: {
          consecutiveBadAnswers: 0,
          consecutiveGoodAnswers: 0,
          totalBadAnswers: 0,
          totalGoodAnswers: 0,
          lastQualityScore: null
        }
      });
      console.log(`✅ [Service] Interview timing initialized: ${totalMinutes}min total, ${Math.round(timeBudgetPerAreaMs/1000)}s per area (${coverageAreas.length} areas)`);

      // Generate intelligent greeting with error handling
      let greeting;
      try {
        console.log('🤖 Generating AI greeting...');
        greeting = await this.generateIntelligentGreeting(config);
        console.log('✅ AI greeting generated');
      } catch (greetingError) {
        console.error('⚠️ AI greeting failed, using fallback:', greetingError.message);
        // Use fallback greeting immediately
        greeting = {
          content: `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`,
          metadata: { fallback: true, error: greetingError.message }
        };
      }

      // Add greeting to conversation
      console.log('💬 [Service] Adding greeting to conversation...');
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: greeting.content,
        model: config.models.fastModel,
        metadata: greeting.metadata
      });
      console.log('✅ [Service] Greeting added to conversation');

      // Save greeting as current question (simple complexity)
      await this.sessionManager.saveCurrentQuestion(sessionId, greeting.content, 'simple');
      console.log('💾 [Greeting] Saved as current question');

      // Update session status
      console.log('📊 [Service] Updating session status to active...');
      await this.sessionManager.updateSession(sessionId, { status: 'active' });
      console.log('✅ [Service] Session status updated to active');

      console.log('📤 [Service] Preparing to return result to controller...');
      console.log(`✅ [Service] Interview ${sessionId} started successfully - returning to controller`);

      const result = {
        success: true,
        sessionId,
        greeting: greeting.content,
        config: {
          interviewType: config.interviewType,
          duration: config.sessionSettings.duration,
          silenceTimeout: config.sessionSettings.silenceTimeout
        },
        jobDetails: jobDescription ? {
          title: jobDescription.title,
          companyName: jobDescription.companyName,
          description: jobDescription.description,
          requirements: jobDescription.requirements,
          responsibilities: jobDescription.responsibilities
        } : null,
        targetRole: config.context.targetRole,
        targetCompany: config.context.targetCompany
      };

      console.log('✅ [Service] Result prepared:', {
        success: result.success,
        sessionId: result.sessionId,
        greetingLength: result.greeting.length,
        configType: result.config.interviewType
      });

      return result;
    } catch (error) {
      console.error('❌ [Service] CRITICAL: Failed to start interview:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      console.error('❌ [Service] Full error object:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent greeting based on context
   */
  async generateIntelligentGreeting(config) {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        const prompt = this.buildGreetingPrompt(config);

        console.log(`🤖 [Greeting] Attempt ${attempt}/${maxRetries} - Generating greeting...`);

        const response = await bedrock.callLLM({
          systemPrompt: "You are a professional interviewer. Your task is to generate ONLY the greeting text - nothing else. Do not include labels, explanations, or formatting. Just write the natural greeting sentences.",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          maxTokens: 400,
          timeout: 10000
        });

        const processingTime = Date.now() - startTime;
        const greeting = response.content.trim();

        // Log the actual response for debugging
        console.log('✅ [Greeting] AI response received:', {
          length: greeting.length,
          preview: greeting.substring(0, 100) + (greeting.length > 100 ? '...' : ''),
          processingTime: `${processingTime}ms`
        });

        // Validate the greeting is not malformed
        if (greeting.length < 20) {
          console.error('❌ [Greeting] Response too short:', greeting);
          throw new Error(`Malformed greeting (too short): "${greeting}"`);
        }

        if (!greeting.match(/[.!?]$/)) {
          console.warn('⚠️  [Greeting] Response missing proper punctuation:', greeting);
          // Add punctuation if missing
          const fixedGreeting = greeting + '.';
          console.log('🔧 [Greeting] Fixed punctuation:', fixedGreeting);
        }

        // Check for common malformed patterns
        if (/^[a-z]\d+$/i.test(greeting) || greeting.length < 15 || !greeting.includes(' ')) {
          console.error('❌ [Greeting] Malformed response detected:', greeting);
          throw new Error(`Invalid greeting format: "${greeting}"`);
        }

        return {
          content: greeting,
          metadata: {
            model: config.models.fastModel,
            processingTime,
            prompt: "greeting_generation",
            interviewType: config.interviewType,
            attempt
          }
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ [Greeting] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type,
          model: config.models.fastModel
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`🔄 [Greeting] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('❌ [Greeting] All attempts failed, using fallback');
    console.error('❌ [Greeting] Last error:', lastError?.message);

    const fallbackGreeting = `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`;

    console.log('⚠️  [Greeting] Using fallback greeting:', fallbackGreeting);

    return {
      content: fallbackGreeting,
      metadata: {
        fallback: true,
        error: lastError?.message,
        errorCode: lastError?.code,
        attemptedModel: config.models.fastModel,
        attempts: maxRetries
      }
    };
  }

  /**
   * Process candidate response with full AI intelligence
   */
  async processCandidateResponse(sessionId, transcript, audioMetadata = {}) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      console.log('🧠 Processing candidate response with AI intelligence...');

      // Store conversation entry with AI analysis
      const candidateEntry = {
        type: 'candidate',
        content: transcript,
        timestamp: new Date().toISOString(),
        metadata: audioMetadata
      };

      await this.memoryAI.storeConversationWithIntelligence(sessionId, candidateEntry);

      // Get updated session with new conversation entry
      const updatedSession = await this.sessionManager.getSession(sessionId);

      // Check if candidate adequately answered the previous question
      const recentInterviewerMessages = updatedSession.conversation
        .filter(entry => entry.type === 'interviewer')
        .slice(-1);

      let responseQuality = null;
      if (recentInterviewerMessages.length > 0) {
        const lastQuestion = recentInterviewerMessages[0].content;
        const targetArea = recentInterviewerMessages[0].metadata?.targetAreas?.[0];

        responseQuality = await this.memoryAI.analyzeResponseQuality(
          lastQuestion,
          transcript,
          targetArea
        );

        console.log(`📊 [Response Quality] Answered: ${responseQuality.answeredQuestion}, Score: ${responseQuality.qualityScore}/100`);

        // STORE QUALITY SCORES: Add quality metadata to candidate entry for smart limit calculations
        candidateEntry.metadata = {
          ...candidateEntry.metadata,
          qualityScore: responseQuality.qualityScore,
          answeredQuestion: responseQuality.answeredQuestion,
          completeness: responseQuality.completeness,
          targetArea: targetArea  // Track which area this response relates to
        };

        console.log(`💾 [Quality Storage] Stored quality score ${responseQuality.qualityScore}/100 for area: ${targetArea}`);

        // 🚫 INTELLIGENT FILTER: Ignore off-topic/inappropriate responses
        // Don't build questions from low-quality or irrelevant content
        if (responseQuality.qualityScore < 30 || (responseQuality.completeness === 'avoided' && responseQuality.qualityScore < 50)) {
          console.log(`🚫 [Low Quality Filter] Ignoring response content (quality: ${responseQuality.qualityScore}, completeness: ${responseQuality.completeness})`);
          console.log(`   Response was off-topic, rude, or inappropriate - generating next question without using this content`);

          // Update quality counters (for 8 bad answers termination)
          await this.updateQualityCounters(sessionId, responseQuality.qualityScore);

          // Check if should end interview due to poor quality
          const endCheck = await this.shouldEndInterview(updatedSession);
          if (endCheck.shouldEnd) {
            return {
              action: 'end_interview',
              content: endCheck.message,
              reasoning: endCheck.reason,
              metadata: { terminationReason: endCheck.reason, score: endCheck.score }
            };
          }

          // DON'T use this response for question generation
          // Generate next question based on coverage gaps ONLY, not response content
          const coverageAnalysis = await AIUtils.withTimeout(
            this.coverageAI.analyzeCoverageIntelligently(
              "[LOW QUALITY - IGNORING CONTENT]",  // Don't pass actual response
              updatedSession.coverage,
              updatedSession.config.intelligenceContext.focusAreas,
              updatedSession.conversation.slice(0, -1)  // Exclude this bad response
            ),
            15000,
            'analyzeCoverageIntelligently (low quality path)'
          );

          // Update coverage (minimal impact for bad response)
          if (coverageAnalysis.coverageUpdates) {
            const updatedCoverage = await this.updateCoverageIntelligently(
              sessionId,
              updatedSession.coverage,
              coverageAnalysis
            );
            await this.sessionManager.updateCoverage(sessionId, updatedCoverage);
          }

          // Build session locally instead of re-fetching from Redis
          const refreshedSession = { ...updatedSession };

          // Generate new question ignoring the bad response
          const nextQuestion = await AIUtils.withTimeout(
            this.questionAI.generateIntelligentQuestion(
              refreshedSession,
              coverageAnalysis,
              { previousQuestions: refreshedSession.conversation.filter(e => e.type === 'interviewer') }
            ),
            10000,
            'generateIntelligentQuestion (low quality path)'
          );

          // Store the generated question
          await this.sessionManager.addConversationEntry(sessionId, {
            type: 'interviewer',
            content: nextQuestion.question,
            timestamp: new Date().toISOString(),
            metadata: {
              aiGenerated: true,
              targetAreas: nextQuestion.targetAreas,
              reasoning: 'Previous response was off-topic/inappropriate - moving forward',
              ignoredPreviousResponse: true
            }
          });

          // Set area start time if this is the first question targeting this area
          const lowQualityTargetArea = nextQuestion.targetAreas?.[0];
          if (lowQualityTargetArea) {
            await this.sessionManager.setAreaStartTime(sessionId, lowQualityTargetArea);
          }

          return {
            action: 'continue_probing',
            content: nextQuestion.question,
            reasoning: 'Response was off-topic/inappropriate - moving to next question without referencing it',
            targetAreas: nextQuestion.targetAreas,
            metadata: {
              ignoredResponse: true,
              originalQuality: responseQuality.qualityScore
            }
          };
        }

        // Update quality counters for valid responses too
        await this.updateQualityCounters(sessionId, responseQuality.qualityScore);

        // Check if should end interview (time or quality thresholds)
        const endCheck = await this.shouldEndInterview(updatedSession);
        if (endCheck.shouldEnd) {
          return {
            action: 'end_interview',
            content: endCheck.message,
            reasoning: endCheck.reason,
            metadata: { terminationReason: endCheck.reason, score: endCheck.score }
          };
        }
      }

      // Perform intelligent coverage analysis
      const coverageAnalysis = await AIUtils.withTimeout(
        this.coverageAI.analyzeCoverageIntelligently(
          transcript,
          updatedSession.coverage,
          updatedSession.config.intelligenceContext.focusAreas,
          updatedSession.conversation
        ),
        15000,
        'analyzeCoverageIntelligently'
      );

      // Update coverage based on AI analysis
      let finalCoverage = updatedSession.coverage;
      if (coverageAnalysis.coverageUpdates) {
        finalCoverage = await this.updateCoverageIntelligently(
          sessionId,
          updatedSession.coverage,
          coverageAnalysis
        );
        await this.sessionManager.updateCoverage(sessionId, finalCoverage);
      }

      // Build finalSession locally instead of re-fetching from Redis
      const finalSession = { ...updatedSession, coverage: finalCoverage };

      // Run decision analysis and question generation IN PARALLEL (both depend on coverageAnalysis but not each other)
      const [decisionAnalysis, proposedQuestion] = await Promise.all([
        AIUtils.withTimeout(
          this.decisionAI.makeIntelligentDecision(
            finalSession,
            transcript,
            {
              coverage: coverageAnalysis,
              memory: candidateEntry.aiAnalysis
            }
          ),
          15000,
          'makeIntelligentDecision'
        ),
        AIUtils.withTimeout(
          this.questionAI.generateIntelligentQuestion(
            finalSession,
            coverageAnalysis,
            { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer') }
          ),
          10000,
          'generateIntelligentQuestion'
        )
      ]);

      // SIMPLIFIED: Just generate next question (no clarification requests - be more patient)
      let nextAction;
      if (decisionAnalysis.decision === 'explore_new_area' || decisionAnalysis.decision === 'continue_probing') {
        // Normal flow - use the pre-generated question
        // Verify question isn't too similar to previous ones
        const similarityAnalysis = await AIUtils.withTimeout(
          this.memoryAI.analyzeQuestionSimilarity(
            proposedQuestion.question,
            finalSession.conversation,
            sessionId
          ),
          8000,
          'analyzeQuestionSimilarity'
        );

        if (similarityAnalysis.isSimilar && similarityAnalysis.confidence > 70) {
          // Generate alternative question for same target area
          console.log('🔄 Question similarity detected - generating alternative for area:', decisionAnalysis.targetArea);

          // Validate that we have the required data before calling AI
          const targetArea = decisionAnalysis.targetArea;
          const areaData = finalSession.coverage.areas[targetArea];

          if (!targetArea || !areaData) {
            console.warn('⚠️ Missing targetArea or areaData, using original question instead');
            console.warn('   targetArea:', targetArea);
            console.warn('   areaData exists:', !!areaData);

            // Fall back to using the original proposed question
            nextAction = {
              type: 'question',
              content: proposedQuestion.question,
              reasoning: proposedQuestion.reasoning + ' (similarity detected but fallback used)',
              targetAreas: proposedQuestion.targetAreas
            };
          } else {
            try {
              // Try to generate targeted question with validated data
              nextAction = await this.questionAI.generateTargetedQuestionForArea(
                targetArea,
                areaData,
                finalSession.conversation,
                finalSession.config.context
              );
              nextAction.type = 'question';
              nextAction.content = nextAction.question;

              console.log('✅ Successfully generated alternative question');
            } catch (targetedQuestionError) {
              console.error('❌ Failed to generate targeted question, falling back to original:', targetedQuestionError.message);

              // Fall back to the original proposed question
              nextAction = {
                type: 'question',
                content: proposedQuestion.question,
                reasoning: proposedQuestion.reasoning + ' (targeted generation failed)',
                targetAreas: proposedQuestion.targetAreas
              };
            }
          }
        } else {
          nextAction = {
            type: 'question',
            content: proposedQuestion.question,
            reasoning: proposedQuestion.reasoning,
            targetAreas: proposedQuestion.targetAreas
          };
        }

        // Store interviewer question in conversation
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'interviewer',
          content: nextAction.content,
          timestamp: new Date().toISOString(),
          metadata: {
            aiGenerated: true,
            targetAreas: nextAction.targetAreas || [decisionAnalysis.targetArea],
            reasoning: nextAction.reasoning
          }
        });

        // Detect complexity and save question for potential rephrasing
        const complexity = await this.detectQuestionComplexity(nextAction.content);
        await this.sessionManager.saveCurrentQuestion(sessionId, nextAction.content, complexity);
        console.log(`💾 [Question] Saved with complexity: ${complexity}`);

        // Track questions asked per coverage area (max 5 per area to avoid repetition)
        const targetArea = decisionAnalysis.targetArea;
        if (targetArea && finalSession.coverage.areas[targetArea]) {
          await this.incrementAreaQuestionCount(sessionId, targetArea);
          console.log(`📊 [Question Counter] Incremented for area: ${targetArea}`);
        }

        // Set area start time if this is the first question targeting this area
        const questionTargetArea = nextAction.targetAreas?.[0] || decisionAnalysis.targetArea;
        if (questionTargetArea) {
          await this.sessionManager.setAreaStartTime(sessionId, questionTargetArea);
        }

      } else if (decisionAnalysis.decision === 'end_interview') {
        nextAction = {
          type: 'end_interview',
          content: 'Thank you for your time. This concludes our interview.',
          reasoning: decisionAnalysis.reasoning
        };
      } else {
        // FALLBACK: For ANY other decision type (seek_examples, wrap_up_area, unexpected, etc.)
        // Always generate next question to keep interview moving forward
        console.log(`⚠️ Unhandled decision type: "${decisionAnalysis.decision}" - generating next question anyway`);

        const proposedQuestion = await this.questionAI.generateIntelligentQuestion(
          finalSession,
          coverageAnalysis,
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer') }
        );

        nextAction = {
          type: 'question',
          content: proposedQuestion.question,
          reasoning: `Fallback for "${decisionAnalysis.decision}": ${decisionAnalysis.reasoning}`,
          targetAreas: proposedQuestion.targetAreas
        };

        // Store interviewer question in conversation
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'interviewer',
          content: nextAction.content,
          timestamp: new Date().toISOString(),
          metadata: {
            aiGenerated: true,
            targetAreas: nextAction.targetAreas,
            reasoning: nextAction.reasoning,
            fallback: true
          }
        });

        // Set area start time if this is the first question targeting this area
        const fallbackTargetArea = nextAction.targetAreas?.[0];
        if (fallbackTargetArea) {
          await this.sessionManager.setAreaStartTime(sessionId, fallbackTargetArea);
        }

        console.log(`✅ [Fallback] Generated next question to keep interview moving`);
      }

      // Index the generated question in RAG for deduplication (fire-and-forget)
      if (nextAction?.content) {
        ragService.indexAskedQuestion(sessionId, nextAction.content).catch(err =>
          console.warn('⚠️ [RAG] Question indexing failed (non-blocking):', err.message)
        );
      }

      // Update real-time report with AI insights (FIRE-AND-FORGET — don't block question delivery)
      this.updateRealTimeReportIntelligently(finalSession, transcript, coverageAnalysis, decisionAnalysis)
        .then(reportUpdate => this.sessionManager.updateRealTimeReport(sessionId, reportUpdate))
        .catch(err => console.warn('⚠️ [Report] Background update failed (non-blocking):', err.message));

      console.log('✅ AI processing complete');

      return {
        action: decisionAnalysis.decision,
        content: nextAction?.content || 'Continue...',
        reasoning: decisionAnalysis.reasoning,
        targetArea: decisionAnalysis.targetArea,
        confidence: decisionAnalysis.confidence,
        coverageUpdate: coverageAnalysis.overallAssessment,
        metadata: {
          aiDecision: decisionAnalysis,
          coverageAnalysis: coverageAnalysis.overallAssessment,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('❌ Failed to process candidate response intelligently:', error);
      throw error;
    }
  }

  /**
   * Make intelligent decision for next interviewer action
   */
  async makeIntelligentDecision(session, candidateResponse) {
    try {
      const startTime = Date.now();
      const config = session.config;

      const prompt = this.buildDecisionPrompt(session, candidateResponse);

      const response = await bedrock.callLLM({
        systemPrompt: this.getDecisionSystemPrompt(config),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        maxTokens: 800,
        timeout: 15000
      });

      const processingTime = Date.now() - startTime;
      const decisionContent = response.content.trim();

      // Parse AI decision (expecting JSON format)
      let decision;
      try {
        decision = JSON.parse(decisionContent);
      } catch (parseError) {
        // Fallback if AI doesn't return valid JSON
        decision = {
          action: "question",
          content: decisionContent,
          reasoning: "AI provided unstructured response",
          nextFocus: "continue_current_area"
        };
      }

      // Add metadata
      decision.metadata = {
        model: config.models.thinkingModel,
        processingTime,
        timestamp: new Date().toISOString()
      };

      // Add decision to conversation if it's a question
      if (decision.action === "question") {
        await this.sessionManager.addConversationEntry(session.sessionId, {
          type: 'interviewer',
          content: decision.content,
          model: config.models.thinkingModel,
          metadata: decision.metadata
        });
      }

      return decision;
    } catch (error) {
      console.error('❌ Failed to make intelligent decision:', error.message);
      // Fallback decision
      return {
        action: "question",
        content: "That's interesting. Can you tell me more about that experience?",
        reasoning: "Fallback question due to AI processing error",
        nextFocus: "continue_current_area",
        metadata: { fallback: true }
      };
    }
  }

  /**
   * Analyze coverage intelligently
   */
  async analyzeCoverage(session, candidateResponse) {
    try {
      const config = session.config;
      const focusAreas = config.intelligenceContext.focusAreas;

      const prompt = `
        Analyze this candidate response for coverage of our focus areas:

        Focus Areas: ${JSON.stringify(focusAreas)}
        Current Coverage: ${JSON.stringify(session.coverage)}
        Latest Response: "${candidateResponse}"

        For each focus area, determine:
        1. Does this response provide evidence for any indicators?
        2. What percentage coverage increase should we assign?
        3. Quality of evidence (1-10 scale)
        4. Specific indicators that were addressed

        Return JSON format with coverage updates.
      `;

      const response = await bedrock.callLLM({
        systemPrompt: "You are an expert interview analyst. Analyze responses for evidence of competencies and skills. Return structured JSON data.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 12000
      });

      const analysisContent = response.content.trim();

      let coverageAnalysis;
      try {
        coverageAnalysis = JSON.parse(analysisContent);
      } catch (parseError) {
        // Fallback coverage analysis
        coverageAnalysis = this.generateFallbackCoverage(candidateResponse, focusAreas);
      }

      // Calculate overall coverage
      const areas = session.coverage.areas;
      const totalWeight = focusAreas.reduce((sum, area) => sum + area.weight, 0);
      let weightedCoverage = 0;

      Object.keys(areas).forEach(areaKey => {
        const area = areas[areaKey];
        if (coverageAnalysis[areaKey]) {
          area.percentage = Math.min(100, area.percentage + coverageAnalysis[areaKey].increase);
          area.lastEvidence = candidateResponse;
          area.lastUpdated = new Date().toISOString();
        }
        weightedCoverage += (area.percentage / 100) * area.weight;
      });

      const overallCoverage = Math.round((weightedCoverage / totalWeight) * 100);

      return {
        overall: overallCoverage,
        areas,
        lastUpdated: new Date().toISOString(),
        analysisMetadata: {
          model: config.models.thinkingModel,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Failed to analyze coverage:', error.message);
      return session.coverage; // Return existing coverage on error
    }
  }

  /**
   * Update candidate behavior analysis
   */
  async updateCandidateBehavior(sessionId, transcript, audioMetadata) {
    try {
      const responseLength = transcript.length;
      const timestamp = new Date().toISOString();

      const behaviorUpdate = {
        responseLength: responseLength,
        lastResponseTime: timestamp,
        communicationStyle: this.analyzeCommunicationStyle(transcript),
        engagement: this.analyzeEngagement(transcript, audioMetadata)
      };

      await this.sessionManager.updateCandidateBehavior(sessionId, {
        responseLength: [responseLength],
        lastAnalysis: behaviorUpdate,
        lastUpdated: timestamp
      });
    } catch (error) {
      console.error('❌ Failed to update candidate behavior:', error.message);
    }
  }

  /**
   * Update real-time report
   */
  async updateRealTimeReport(session, candidateResponse, decision) {
    try {
      const config = session.config;

      const prompt = `
        Update the real-time interview report based on this exchange:

        Current Report: ${JSON.stringify(session.realTimeReport)}
        Latest Response: "${candidateResponse}"
        Interview Decision: ${JSON.stringify(decision)}
        Coverage: ${JSON.stringify(session.coverage)}

        Provide:
        1. Updated strengths list
        2. Updated weaknesses list
        3. New recommendations
        4. Updated scores for each criteria
        5. Overall progress assessment

        Return JSON format.
      `;

      const response = await bedrock.callLLM({
        systemPrompt: "You are an expert interview evaluator. Provide constructive, actionable feedback in real-time. Be specific and evidence-based.",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        maxTokens: 800,
        timeout: 15000
      });

      const reportContent = response.content.trim();

      let reportUpdate;
      try {
        reportUpdate = JSON.parse(reportContent);
      } catch (parseError) {
        // Fallback report update
        reportUpdate = {
          strengths: session.realTimeReport.strengths || [],
          weaknesses: session.realTimeReport.weaknesses || [],
          recommendations: session.realTimeReport.recommendations || [],
          scores: session.realTimeReport.scores || {},
          overallProgress: session.coverage.overall || 0
        };
      }

      return {
        ...reportUpdate,
        lastUpdated: new Date().toISOString(),
        metadata: {
          model: config.models.analysisModel,
          updateTrigger: 'candidate_response'
        }
      };
    } catch (error) {
      console.error('❌ Failed to update real-time report:', error.message);
      return session.realTimeReport;
    }
  }

  /**
   * Handle silence detection - SIMPLIFIED VERSION
   * Only acts on extended silence (15s+) to move to next question
   * NO encouragement messages, NO patience prompts
   */
  async handleSilence(sessionId, silenceDuration) {
    try {
      console.log(`🔇 [Silence] Detected ${silenceDuration}s of silence`);

      // IGNORE short pauses - let candidate think naturally
      if (silenceDuration < 20) {
        console.log(`✓ [Silence] Ignoring short pause (< 20s)`);
        return {
          action: 'ignore',
          content: null,
          reasoning: 'Short pause - allowing natural thinking time'
        };
      }

      // Extended silence (20s+) - Move to next question automatically
      console.log(`⏭️  [Silence] Extended silence (${silenceDuration}s) - generating next question`);

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Get updated session for coverage analysis
      const updatedSession = await this.sessionManager.getSession(sessionId);

      // Perform coverage analysis to determine next question
      const coverageAnalysis = await this.coverageAI.analyzeCoverageIntelligently(
        "[SILENCE - NO RESPONSE]",
        updatedSession.coverage,
        updatedSession.config.intelligenceContext.focusAreas,
        updatedSession.conversation
      );

      // Make decision for next area
      const decisionAnalysis = await this.decisionAI.makeIntelligentDecision(
        updatedSession,
        "[EXTENDED SILENCE]",
        { coverage: coverageAnalysis }
      );

      // Generate next question
      const nextQuestion = await this.questionAI.generateIntelligentQuestion(
        updatedSession,
        coverageAnalysis,
        { previousQuestions: updatedSession.conversation.filter(e => e.type === 'interviewer') }
      );

      // Store the new question
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: nextQuestion.question,
        timestamp: new Date().toISOString(),
        metadata: {
          aiGenerated: true,
          targetAreas: nextQuestion.targetAreas,
          reasoning: 'Extended silence - moving forward',
          silenceDuration: silenceDuration
        }
      });

      console.log(`✅ [Silence] Moving to next question: "${nextQuestion.question.substring(0, 60)}..."`);

      return {
        action: 'next_question',
        content: nextQuestion.question,
        reasoning: `Extended silence (${silenceDuration}s) - automatically moving forward`,
        targetAreas: nextQuestion.targetAreas,
        silenceDuration
      };

    } catch (error) {
      console.error('❌ [Silence] Failed to handle silence:', error.message);

      // Fallback: just move forward with generic question
      return {
        action: 'next_question',
        content: "Let's move on to the next topic. Can you tell me about your experience with problem-solving?",
        reasoning: 'Silence handling failed - using fallback',
        error: error.message
      };
    }
  }

  /**
   * Generate intelligent silence prompt
   */
  async generateSilencePrompt(session, silenceData) {
    const maxRetries = 2;
    let lastError = null;

    // Extract recent context without large JSON
    const recentMessages = session.conversation.slice(-3).map(entry =>
      `${entry.type === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${entry.content?.substring(0, 100) || '[no content]'}`
    ).join('\n');

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const config = session.config;

        const prompt = `Generate a supportive, encouraging message for a candidate who has been silent for ${silenceData.silenceDuration} seconds during an interview.

CONTEXT:
- This is silence instance #${silenceData.silenceCount}
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Interview Type: ${config.interviewType}

RECENT CONVERSATION:
${recentMessages}

REQUIREMENTS:
- Write 1-2 natural, encouraging sentences
- Be warm and supportive, not pushy
- Help the candidate feel comfortable to continue
- DO NOT use labels, bullet points, or explanations
- ONLY output the encouraging text itself

Example: "Take your time - there's no rush. Would you like me to rephrase the question in a different way?"`;

        console.log(`🔇 [Silence] Attempt ${attempt}/${maxRetries} - Generating silence prompt...`);

        const response = await bedrock.callLLM({
          systemPrompt: "You are a supportive interviewer. Your task is to generate ONLY the encouraging text - nothing else. Be empathetic and natural.",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          maxTokens: 300,
          timeout: 8000
        });

        const silencePrompt = response.content.trim();

        // Log the response for debugging
        console.log('✅ [Silence] AI response received:', {
          length: silencePrompt.length,
          preview: silencePrompt.substring(0, 80) + (silencePrompt.length > 80 ? '...' : ''),
          silenceCount: silenceData.silenceCount
        });

        // Validate the silence prompt is not malformed
        if (silencePrompt.length < 15) {
          console.error('❌ [Silence] Response too short:', silencePrompt);
          throw new Error(`Malformed silence prompt (too short): "${silencePrompt}"`);
        }

        // Check for common malformed patterns (like "s1", "safe", etc.)
        if (/^[a-z]+\d*$/i.test(silencePrompt) || !silencePrompt.includes(' ')) {
          console.error('❌ [Silence] Malformed response detected:', silencePrompt);
          throw new Error(`Invalid silence prompt format: "${silencePrompt}"`);
        }

        return {
          content: silencePrompt,
          metadata: {
            model: config.models.fastModel,
            silenceCount: silenceData.silenceCount,
            silenceDuration: silenceData.silenceDuration,
            type: 'silence_prompt',
            attempt
          }
        };

      } catch (error) {
        lastError = error;
        console.error(`❌ [Silence] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          silenceCount: silenceData.silenceCount
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`🔄 [Silence] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('❌ [Silence] All attempts failed, using fallback');
    console.error('❌ [Silence] Last error:', lastError?.message);

    const fallbacks = [
      "Take your time to think about it. I'm here when you're ready to continue.",
      "No rush at all. Would you like me to rephrase the question?",
      "Feel free to take a moment to gather your thoughts. How would you like to approach this?"
    ];

    const fallbackMessage = fallbacks[silenceData.silenceCount % fallbacks.length];
    console.log('⚠️  [Silence] Using fallback:', fallbackMessage);

    return {
      content: fallbackMessage,
      metadata: {
        fallback: true,
        silenceCount: silenceData.silenceCount,
        error: lastError?.message,
        attempts: maxRetries
      }
    };
  }

  /**
   * Detect question complexity using AI
   */
  async detectQuestionComplexity(questionText) {
    try {
      const systemPrompt = `Analyze this interview question and determine its complexity level.

COMPLEXITY LEVELS:
- simple: Yes/no questions, basic factual questions, straightforward queries (1 sentence)
- medium: Standard behavioral/situational questions requiring examples (2-3 sentences)
- complex: Multi-part questions, technical deep-dives, requiring detailed analysis (3+ sentences)

RESPONSE FORMAT (JSON only):
{
  "complexity": "simple|medium|complex",
  "reasoning": "brief explanation",
  "estimatedThinkingTime": number (in seconds)
}`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Analyze this question: "${questionText}"` }],
        temperature: 0.2,
        maxTokens: 200,
        timeout: 8000
      });

      const parsed = AIUtils.parseJSONResponse(response.content, 'detectQuestionComplexity');

      console.log(`🔍 [Complexity] Detected:`, {
        complexity: parsed.complexity,
        estimatedThinkingTime: parsed.estimatedThinkingTime
      });

      return parsed.complexity || 'medium';
    } catch (error) {
      console.error('❌ Error detecting question complexity:', error.message);
      return 'medium'; // Default to medium if detection fails
    }
  }

  /**
   * REMOVED: No patience prompts for MVP - using manual "Next" button only
   */
  async generatePatiencePrompt(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion || 'the question';

      const systemPrompt = `Generate a brief, warm encouragement for a candidate who has been silent for ${silenceData.silenceDuration} seconds.

REQUIREMENTS:
- Write 1 short, natural sentence
- Be patient and supportive, NOT pushy
- Signal that thinking time is okay
- DO NOT offer to rephrase or help yet - just encouragement
- ONLY output the encouragement text itself

Examples:
- "Take your time to think through this."
- "No rush - I'm listening."
- "Whenever you're ready."`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Generate patience prompt for: "${currentQuestion.substring(0, 100)}..."` }],
        temperature: 0.7,
        maxTokens: 100,
        timeout: 8000
      });

      const patiencePrompt = response.content.trim();

      // Validation
      if (patiencePrompt.length < 10 || /^[a-z]+\d*$/i.test(patiencePrompt)) {
        throw new Error('Malformed patience prompt');
      }

      console.log(`✅ [Patience] Generated prompt:`, patiencePrompt);

      return {
        content: patiencePrompt,
        metadata: { silenceStage: 1, type: 'patience_prompt' }
      };
    } catch (error) {
      console.error('❌ Error generating patience prompt:', error.message);
      // AI-like fallback (varied responses)
      const fallbacks = [
        "Take your time - there's no rush to answer.",
        "I'm here when you're ready to share your thoughts.",
        "Feel free to take a moment to think about this."
      ];
      return {
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        metadata: { silenceStage: 1, type: 'patience_prompt', fallback: true }
      };
    }
  }

  /**
   * REMOVED: No help offers for MVP - using manual "Next" button only
   */
   async generateHelpOffer(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion || 'the question';

      const systemPrompt = `Generate a supportive offer to help a candidate who has been silent for ${silenceData.silenceDuration} seconds.

REQUIREMENTS:
- Write 1-2 natural sentences
- Offer to rephrase or clarify
- Be supportive and professional
- Suggest specific ways to help
- ONLY output the help offer text itself

Examples:
- "Would it help if I rephrased the question?"
- "Can I break this into smaller parts for you?"
- "Would you like me to provide a specific example?"`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: `Generate help offer for: "${currentQuestion.substring(0, 100)}..."` }],
        temperature: 0.7,
        maxTokens: 150,
        timeout: 8000
      });

      const helpOffer = response.content.trim();

      // Validation
      if (helpOffer.length < 15 || /^[a-z]+\d*$/i.test(helpOffer)) {
        throw new Error('Malformed help offer');
      }

      console.log(`✅ [HelpOffer] Generated:`, helpOffer);

      return {
        content: helpOffer,
        metadata: { silenceStage: 2, type: 'help_offer' }
      };
    } catch (error) {
      console.error('❌ Error generating help offer:', error.message);
      const fallbacks = [
        "Would you like me to rephrase the question in a different way?",
        "Can I break this down into smaller, more specific questions?",
        "Would it help if I provided an example of what I'm looking for?"
      ];
      return {
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        metadata: { silenceStage: 2, type: 'help_offer', fallback: true }
      };
    }
  }

  /**
   * REMOVED: No question rephrasing for MVP - using manual "Next" button only
   */
   async rephraseCurrentQuestion(session, silenceData) {
    try {
      const currentQuestion = session.currentQuestionContext?.originalQuestion;

      if (!currentQuestion) {
        throw new Error('No current question to rephrase');
      }

      const recentContext = session.conversation.slice(-3).map(entry =>
        `${entry.type}: ${entry.content?.substring(0, 100)}`
      ).join('\n');

      const systemPrompt = `Rephrase this interview question to make it clearer and easier to answer.

REQUIREMENTS:
- SAME intent and topic as original question
- Simpler, clearer wording
- Can break into 2-3 smaller sub-questions if helpful
- More concrete and specific
- Natural and conversational
- ONLY output the rephrased question(s) - no explanations

APPROACH OPTIONS:
1. Simpler wording of same question
2. Break into sequential sub-questions
3. Add scaffolding example then ask`;

      const userPrompt = `ORIGINAL QUESTION: "${currentQuestion}"

CONTEXT:
- Candidate has been silent for ${silenceData.silenceDuration} seconds
- This is silence #${silenceData.silenceCount}
- Interview Type: ${session.config.interviewType}
- Position: ${session.config.context.targetRole}

RECENT CONVERSATION:
${recentContext}

Rephrase this question to help the candidate answer it.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.6,
        maxTokens: 400,
        timeout: 10000
      });

      const rephrasedQuestion = response.content.trim();

      // Validation
      if (rephrasedQuestion.length < 20 || /^[a-z]+\d*$/i.test(rephrasedQuestion)) {
        throw new Error('Malformed rephrased question');
      }

      console.log(`✅ [Rephrase] Generated rephrased question`);

      // Save rephrase to history
      const rephraseHistory = session.currentQuestionContext.rephraseHistory || [];
      rephraseHistory.push({
        original: currentQuestion,
        rephrased: rephrasedQuestion,
        timestamp: Date.now()
      });

      await this.sessionManager.updateSession(session.sessionId, {
        'currentQuestionContext.hasBeenRephrased': true,
        'currentQuestionContext.rephraseHistory': rephraseHistory
      });

      return {
        content: rephrasedQuestion,
        metadata: {
          silenceStage: 3,
          type: 'rephrased_question',
          originalQuestion: currentQuestion
        }
      };
    } catch (error) {
      console.error('❌ Error rephrasing question:', error.message);
      // Generate simpler version if rephrasing fails
      return {
        content: "Let me ask this more simply: Can you share any relevant experience you have with this?",
        metadata: { silenceStage: 3, type: 'rephrased_question', fallback: true }
      };
    }
  }

  /**
   * End interview and generate final report
   */
  async endInterview(sessionId) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Generate comprehensive final report
      const finalReport = await this.generateFinalReport(session);

      // End session in Redis
      await this.sessionManager.endSession(sessionId, finalReport);

      return {
        success: true,
        finalReport,
        sessionAnalytics: await this.sessionManager.getSessionAnalytics(sessionId)
      };
    } catch (error) {
      console.error('❌ Failed to end interview:', error.message);
      throw error;
    }
  }

  /**
   * Helper method to build greeting prompt
   */
  buildGreetingPrompt(config) {
    // Extract only the essential information, avoid large JSON objects
    const interviewerStyle = config.interviewerPersona?.style || 'professional';
    const interviewerTone = config.interviewerPersona?.tone || 'friendly';
    const cultureTrait = config.companyProfile?.culture?.values?.[0] || 'innovation';

    // INTERVIEW TYPE SPECIFIC FOCUS
    let interviewFocus = '';
    let exampleGreeting = '';

    if (config.interviewType === 'TECHNICAL_SKILL') {
      const focusAreaNames = config.intelligenceContext?.focusAreas
        ?.map(a => a.skillName || a.area) || [];
      const focusDescription = focusAreaNames.length > 0
        ? focusAreaNames.join(', ')
        : 'domain-specific expertise';

      interviewFocus = `This is a SKILL ASSESSMENT interview for the role of "${config.context.targetRole}" at ${config.context.experienceLevel} level.

FOCUS:
- Assess practical expertise in: ${focusDescription}
- Probe for hands-on experience and real-world results
- Match the greeting to the role's domain (NOT generic software engineering unless the role IS a dev role)`;

      exampleGreeting = `"Hello! I'm excited to discuss your experience in ${focusDescription} as it relates to the ${config.context.targetRole} role. Today we'll be exploring your hands-on expertise, problem-solving approach, and practical experience at the ${config.context.experienceLevel} level. Let's dive in!"`;

    } else if (config.interviewType === 'HR_INTERVIEW') {
      interviewFocus = `This is a BEHAVIORAL and CULTURAL FIT interview focusing on soft skills, teamwork, and alignment with company values.`;
      exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's have a great conversation about your experience and how you can contribute to our team."`;

    } else if (config.interviewType === 'SOFT_SKILL') {
      interviewFocus = `This is a SOFT SKILLS and COMMUNICATION assessment focusing on interpersonal abilities, emotional intelligence, and collaboration.`;
      exampleGreeting = `"Hello! Today we'll be discussing your communication style and collaboration experiences. I'm looking forward to understanding how you work with others and handle various workplace scenarios."`;

    } else {
      // Default/generic
      interviewFocus = `Standard professional interview.`;
      exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position. Let's have a great conversation."`;
    }

    return `Generate a warm, professional greeting for this ${config.interviewType} interview:

INTERVIEW TYPE & FOCUS:
${interviewFocus}

INTERVIEW CONTEXT:
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Candidate Experience Level: ${config.context.experienceLevel}
- Interview Style: ${interviewerStyle}, ${interviewerTone}
- Company Values: ${cultureTrait}

REQUIREMENTS:
- Write 2-3 natural, conversational sentences
- Welcome the candidate warmly
- Briefly mention the position and set expectations for the interview type
- Set a comfortable, professional tone appropriate for ${config.interviewType}
- DO NOT use labels, bullet points, or structured format
- DO NOT include explanations or meta-text
- ONLY output the greeting text itself

Example format for ${config.interviewType}: ${exampleGreeting}`;
  }

  /**
   * Helper method to build decision prompt
   */
  buildDecisionPrompt(session, candidateResponse) {
    const recentConversation = session.conversation.slice(-5).map(msg =>
      `${msg.type}: ${msg.content}`
    ).join('\n');

    return `
      Interview Context: ${JSON.stringify(session.config.context)}
      Focus Areas: ${JSON.stringify(session.config.intelligenceContext.focusAreas)}
      Current Coverage: ${JSON.stringify(session.coverage)}
      Interviewer Style: ${JSON.stringify(session.config.interviewerPersona)}

      Recent Conversation:
      ${recentConversation}

      Latest Candidate Response: "${candidateResponse}"

      Based on this context, decide the next best action. Return JSON with:
      {
        "action": "question|probe_deeper|change_topic|wrap_up",
        "content": "the actual question or response",
        "reasoning": "why you chose this action",
        "nextFocus": "which area to focus on next",
        "adaptations": "any style adaptations needed"
      }

      Be intelligent and adaptive. Consider:
      - Coverage gaps that need attention
      - Candidate's communication style
      - Depth of current area exploration
      - Interview flow and time management
    `;
  }

  /**
   * Helper method to get decision system prompt
   */
  getDecisionSystemPrompt(config) {
    return `
      You are an intelligent ${config.interviewerPersona.experience} conducting a ${config.interviewType} interview.

      Your expertise: ${config.interviewerPersona.expertise.join(', ')}
      Your style: ${config.interviewerPersona.style}, ${config.interviewerPersona.tone}
      Your approach: ${config.interviewerPersona.approach}

      Company: ${config.context.targetCompany}
      Role: ${config.context.targetRole}

      You make intelligent decisions about:
      1. What questions to ask next
      2. When to probe deeper vs move on
      3. How to adapt to the candidate's style
      4. Which focus areas need more coverage

      Always respond with valid JSON. Be natural, not robotic.
    `;
  }

  /**
   * Helper methods for analysis
   */
  analyzeCommunicationStyle(transcript) {
    const words = transcript.split(' ').length;
    const sentences = transcript.split(/[.!?]+/).length;

    if (words > 100) return 'verbose';
    if (words < 20) return 'concise';
    if (sentences > words / 8) return 'structured';
    return 'balanced';
  }

  analyzeEngagement(transcript, audioMetadata) {
    // Simple engagement analysis
    const hasQuestions = transcript.includes('?');
    const hasExamples = transcript.includes('example') || transcript.includes('for instance');
    const isDetailed = transcript.length > 200;

    let engagement = 'medium';
    if ((hasQuestions || hasExamples) && isDetailed) engagement = 'high';
    if (transcript.length < 50) engagement = 'low';

    return engagement;
  }

  generateFallbackCoverage(response, focusAreas) {
    const fallback = {};
    focusAreas.forEach(area => {
      fallback[area.area] = {
        increase: Math.min(10, response.length / 50), // Simple fallback scoring
        evidence: [response.substring(0, 100)],
        quality: 5
      };
    });
    return fallback;
  }

  async generateFinalReport(session) {
    // This would be implemented with comprehensive analysis
    // For now, return basic structure
    return {
      summary: "Interview completed successfully",
      coverage: session.coverage,
      recommendations: session.realTimeReport.recommendations,
      scores: session.realTimeReport.scores,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Update coverage intelligently based on AI analysis
   */
  async updateCoverageIntelligently(sessionId, currentCoverage, coverageAnalysis) {
    try {
      const updatedCoverage = { ...currentCoverage };
      const session = await this.sessionManager.getSession(sessionId);

      if (coverageAnalysis.coverageUpdates) {
        Object.keys(coverageAnalysis.coverageUpdates).forEach(areaName => {
          const update = coverageAnalysis.coverageUpdates[areaName];

          if (updatedCoverage.areas[areaName]) {
            const area = updatedCoverage.areas[areaName];

            // Update percentage with AI-determined increase
            area.percentage = Math.min(100, area.percentage + update.percentageIncrease);

            // Add evidence from AI analysis
            if (update.evidence && update.evidence.length > 0) {
              area.indicators = area.indicators || [];
              update.evidence.forEach(evidence => {
                if (!area.indicators.some(ind => ind.evidence.includes(evidence))) {
                  area.indicators.push({
                    name: `AI-detected: ${update.indicators?.[0] || 'competency'}`,
                    covered: true,
                    evidence: [evidence],
                    quality: update.qualityScore || 5,
                    aiGenerated: true,
                    reasoning: update.reasoning
                  });
                }
              });
            }

            // SCORE BONUS: Reward candidates who cover an area before time budget expires
            if (session?.timeBudgetPerAreaMs && area.percentage >= 60 && !area.earlyCompletionBonus) {
              const areaStartTime = area.startTime;
              if (areaStartTime) {
                const elapsed = Date.now() - areaStartTime;
                const timeBudget = session.timeBudgetPerAreaMs;
                if (elapsed < timeBudget) {
                  const timeRemainingRatio = (timeBudget - elapsed) / timeBudget;
                  const bonus = Math.round(timeRemainingRatio * 15); // Up to 15 bonus points
                  area.percentage = Math.min(100, area.percentage + bonus);
                  area.earlyCompletionBonus = bonus;
                  console.log(`🎁 [Score Bonus] Early completion: +${bonus}% for "${areaName}" (${Math.round(timeRemainingRatio*100)}% time remaining)`);
                }
              }
            }

            area.lastUpdated = new Date().toISOString();
            area.aiAnalysis = {
              qualityScore: update.qualityScore,
              reasoning: update.reasoning,
              indicators: update.indicators
            };
          }
        });
      }

      // Update overall coverage from AI assessment
      if (coverageAnalysis.overallAssessment?.totalCoverage) {
        updatedCoverage.overall = coverageAnalysis.overallAssessment.totalCoverage;
      }

      updatedCoverage.lastUpdated = new Date().toISOString();
      updatedCoverage.aiAnalysis = coverageAnalysis.overallAssessment;

      return updatedCoverage;
    } catch (error) {
      console.error('Error updating coverage intelligently:', error);
      return currentCoverage;
    }
  }

  /**
   * Build a clarification message when candidate didn't fully answer the question
   */
  buildClarificationMessage(missingElements, suggestedFollowUp, targetArea) {
    const intro = "I notice you didn't fully address ";

    if (missingElements && missingElements.length > 0) {
      const elementsText = missingElements.length === 1
        ? missingElements[0]
        : missingElements.slice(0, -1).join(', ') + ' and ' + missingElements[missingElements.length - 1];

      const message = `${intro}${elementsText}. `;

      if (suggestedFollowUp) {
        return message + suggestedFollowUp;
      } else {
        return message + `Could you elaborate on that?`;
      }
    } else if (suggestedFollowUp) {
      return suggestedFollowUp;
    } else {
      return `I'd like to hear more about that. Could you provide more details or specific examples?`;
    }
  }

  /**
   * Increment question count for a coverage area (max 5 per area to avoid repetition)
   */
  async incrementAreaQuestionCount(sessionId, areaName) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.coverage.areas[areaName]) {
        return;
      }

      const area = session.coverage.areas[areaName];
      area.questionsAsked = (area.questionsAsked || 0) + 1;
      area.lastQuestionTime = new Date().toISOString();

      await this.sessionManager.updateCoverage(sessionId, session.coverage);

      console.log(`📊 Area "${areaName}" now has ${area.questionsAsked} questions asked`);
    } catch (error) {
      console.error('Error incrementing area question count:', error);
    }
  }

  /**
   * Get current number of questions asked for an area
   */
  async getAreaQuestionCount(sessionId, areaName) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session || !session.coverage.areas[areaName]) {
        return 0;
      }
      return session.coverage.areas[areaName].questionsAsked || 0;
    } catch (error) {
      console.error('Error getting area question count:', error);
      return 0;
    }
  }

  /**
   * Update real-time report with AI intelligence
   */
  async updateRealTimeReportIntelligently(session, candidateResponse, coverageAnalysis, decisionAnalysis) {
    try {
      const systemPrompt = `You are an expert interview evaluator providing real-time feedback with AI insights.

INTELLIGENCE INTEGRATION:
- Use coverage analysis insights to identify strengths/weaknesses
- Consider decision analysis for recommendations
- Build on previous report while adding new insights
- Be specific and evidence-based
- Provide actionable feedback

RESPONSE FORMAT (JSON only):
{
  "strengths": ["updated list of candidate strengths"],
  "weaknesses": ["areas needing improvement"],
  "recommendations": ["specific recommendations for improvement"],
  "scores": {"area": score},
  "overallProgress": number,
  "aiInsights": ["key insights from AI analysis"],
  "trends": ["observed trends in performance"]
}`;

      const userPrompt = `CURRENT REPORT:
${JSON.stringify(session.realTimeReport, null, 2)}

LATEST RESPONSE: "${candidateResponse}"

COVERAGE ANALYSIS:
${JSON.stringify(coverageAnalysis.overallAssessment, null, 2)}

DECISION ANALYSIS:
${JSON.stringify(decisionAnalysis, null, 2)}

Update the real-time report with new AI-powered insights.`;

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.4,
        maxTokens: 1000,
        timeout: 15000
      });

      const reportUpdate = AIUtils.parseJSONResponse(response.content, 'updateRealTimeReport');

      return {
        ...reportUpdate,
        lastUpdated: new Date().toISOString(),
        aiPowered: true,
        metadata: {
          basedOnCoverageAnalysis: true,
          basedOnDecisionAnalysis: true,
          updateTrigger: 'ai_intelligence_processing'
        }
      };

    } catch (error) {
      console.error('Error updating real-time report intelligently:', error);
      return session.realTimeReport;
    }
  }

  // REMOVED: shouldDoFullAnalysis — every response now gets full AI analysis

  // REMOVED: quickCoverageUpdate — every response now gets full AI coverage analysis

  /**
   * Process candidate response — always uses full AI analysis.
   * Legacy alias kept for backward compatibility with controller.
   */
  async processCandidateResponseIntelligently(sessionId, transcript, audioMetadata = {}) {
    return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
  }
}

module.exports = new IntelligentInterviewService();