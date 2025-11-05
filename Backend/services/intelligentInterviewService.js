/**
 * Intelligent Interview Service
 * Core AI engine for adaptive interview management
 */

const { Together } = require("together-ai");
const configManager = require("../utils/configManager");
const redisSessionManager = require("../utils/redisSessionManager");
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
}

/**
 * Memory AI - Manages conversation memory and semantic deduplication
 */
class MemoryAI {
  constructor(together, sessionManager) {
    this.together = together;
    this.sessionManager = sessionManager;
    this.model = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";
  }

  async analyzeQuestionSimilarity(newQuestion, sessionHistory, sessionId) {
    try {
      // Extract previous questions from session history
      const previousQuestions = sessionHistory
        .filter(entry => entry.type === 'interviewer' && entry.content.includes('?'))
        .map(entry => ({ question: entry.content, timestamp: entry.timestamp }));

      if (previousQuestions.length === 0) {
        return { isSimilar: false, confidence: 0, reasoning: "No previous questions to compare" };
      }

      const systemPrompt = `You are an AI that analyzes interview question similarity. Determine if questions have similar INTENT and PURPOSE, not just similar words.

CRITICAL ANALYSIS CRITERIA:
- Questions asking about the same skill/competency are SIMILAR
- Different phrasings of the same concept are SIMILAR
- Questions targeting different aspects of the same topic may be DIFFERENT
- Consider the interview flow and natural progression

RESPONSE FORMAT (JSON only):
{
  "isSimilar": boolean,
  "confidence": number,
  "reasoning": "detailed explanation",
  "similarQuestions": [{"index": number, "similarity": number}],
  "recommendations": "suggestions for question variation"
}`;

      const userPrompt = `NEW QUESTION: "${newQuestion}"

PREVIOUS QUESTIONS:
${previousQuestions.map((q, i) => `${i + 1}. "${q.question}" (${q.timestamp})`).join('\n')}

Analyze if the new question is semantically similar to any previous questions.`;

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 800
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'analyzeQuestionSimilarity');
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

      const aiResponse = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze: "${candidateResponse}"` }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const responseContent = aiResponse.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'analyzeResponseIntelligence');
    } catch (error) {
      console.error('Error analyzing response intelligence:', error);
      return { error: error.message };
    }
  }
}

/**
 * Coverage Analysis AI - Intelligent topic coverage evaluation
 */
class CoverageAnalysisAI {
  constructor(together, sessionManager) {
    this.together = together;
    this.sessionManager = sessionManager;
    this.model = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";
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

      const contextHistory = sessionHistory.slice(-5).map(entry =>
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

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 1200
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'analyzeCoverageIntelligently');
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

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 600
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'determineIfCoverageIsSufficient');
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
  constructor(together, sessionManager) {
    this.together = together;
    this.sessionManager = sessionManager;
    this.model = "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo"; // Faster model for question generation
  }

  async generateIntelligentQuestion(session, coverageAnalysis, memoryAnalysis) {
    try {
      const systemPrompt = `You are an expert interviewer generating intelligent, targeted questions based on coverage gaps and conversation flow.

QUESTION GENERATION PRINCIPLES:
- Target specific coverage gaps identified
- Build naturally on previous conversation
- Match candidate's communication style
- Avoid repetitive or similar questions
- Progress logically through competency exploration
- Be natural and conversational, not robotic

RESPONSE FORMAT (JSON only):
{
  "question": "the actual question to ask",
  "targetAreas": ["coverage areas this addresses"],
  "reasoning": "why this question was chosen",
  "expectedOutcomes": ["what we hope to learn"],
  "followUpStrategy": "potential follow-up approach"
}`;

      const recentContext = session.conversation.slice(-3).map(entry =>
        `${entry.type}: ${entry.content}`
      ).join('\n');

      const userPrompt = `INTERVIEW CONTEXT:
Role: ${session.config.context.targetRole}
Company: ${session.config.context.targetCompany}
Experience Level: ${session.config.context.experienceLevel}

CURRENT COVERAGE ANALYSIS:
${JSON.stringify(coverageAnalysis, null, 2)}

MEMORY ANALYSIS:
Previous Questions: ${JSON.stringify(memoryAnalysis?.previousQuestions?.slice(-3) || [])}

RECENT CONVERSATION:
${recentContext}

COVERAGE GAPS TO ADDRESS:
${JSON.stringify(coverageAnalysis?.overallAssessment?.weakestAreas || [])}

Generate the next intelligent question that targets the most important coverage gap while maintaining natural conversation flow.`;

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'generateIntelligentQuestion');
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

Generate a targeted question to explore this competency area more deeply.`;

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 400
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'generateTargetedQuestionForArea');
    } catch (error) {
      console.error('Error generating targeted question:', error);
      throw error;
    }
  }
}

/**
 * Decision Engine AI - Makes intelligent interview flow decisions
 */
class DecisionEngineAI {
  constructor(together, sessionManager) {
    this.together = together;
    this.sessionManager = sessionManager;
    this.model = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";
  }

  async makeIntelligentDecision(session, candidateResponse, allAnalyses) {
    try {
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
        }
      }, null, 2)}

LATEST RESPONSE: "${candidateResponse}"

ANALYSES:
${JSON.stringify(allAnalyses, null, 2)}

Make the next intelligent decision for interview progression.`;

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'makeIntelligentDecision');
    } catch (error) {
      console.error('Error in intelligent decision making:', error);
      throw error;
    }
  }

  async shouldEndInterview(session, totalDuration) {
    try {
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

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      });

      const responseContent = response.choices[0].message.content.trim();
      return AIUtils.parseJSONResponse(responseContent, 'shouldEndInterview');
    } catch (error) {
      console.error('Error determining interview end:', error);
      return { shouldEnd: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }
}

class IntelligentInterviewService {
  constructor() {
    this.together = new Together({ apiKey: process.env.TOGETHER_API_KEY });
    this.sessionManager = redisSessionManager;

    // Initialize AI service components
    this.memoryAI = new MemoryAI(this.together, this.sessionManager);
    this.coverageAI = new CoverageAnalysisAI(this.together, this.sessionManager);
    this.questionAI = new QuestionGeneratorAI(this.together, this.sessionManager);
    this.decisionAI = new DecisionEngineAI(this.together, this.sessionManager);
  }

  /**
   * Initialize service
   */
  async initialize() {
    try {
      // Initialize Redis connection
      await this.sessionManager.initialize();
      console.log('✅ Intelligent Interview Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Intelligent Interview Service:', error.message);
      return false;
    }
  }

  /**
   * Start new interview session
   */
  async startInterview(sessionId, userConfig, candidateId) {
    try {
      // Create intelligent configuration
      const config = configManager.createIntelligentConfig(userConfig);
      configManager.validateConfig(config);

      // Create session in Redis
      const session = await this.sessionManager.createSession(sessionId, config, candidateId);

      // Generate intelligent greeting
      const greeting = await this.generateIntelligentGreeting(config);

      // Add greeting to conversation
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: greeting.content,
        model: config.models.fastModel,
        metadata: greeting.metadata
      });

      // Update session status
      await this.sessionManager.updateSession(sessionId, { status: 'active' });

      return {
        success: true,
        sessionId,
        greeting: greeting.content,
        config: {
          interviewType: config.interviewType,
          duration: config.sessionSettings.duration,
          silenceTimeout: config.sessionSettings.silenceTimeout
        }
      };
    } catch (error) {
      console.error('❌ Failed to start interview:', error.message);
      throw error;
    }
  }

  /**
   * Generate intelligent greeting based on context
   */
  async generateIntelligentGreeting(config) {
    try {
      const startTime = Date.now();

      const prompt = this.buildGreetingPrompt(config);

      const response = await this.together.chat.completions.create({
        model: config.models.fastModel,
        messages: [
          {
            role: "system",
            content: "You are an intelligent interviewer. Generate a warm, professional greeting that sets the right tone for the interview. Be natural and contextual."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      });

      const processingTime = Date.now() - startTime;
      const greeting = response.choices[0].message.content.trim();

      return {
        content: greeting,
        metadata: {
          model: config.models.fastModel,
          processingTime,
          prompt: "greeting_generation",
          interviewType: config.interviewType
        }
      };
    } catch (error) {
      console.error('❌ Failed to generate greeting:', error.message);
      // Fallback greeting based on interview type
      let fallbackGreeting = '';
      
      fallbackGreeting = `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`;
      
      return {
        content: fallbackGreeting,
        metadata: { fallback: true }
      };
    }
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

      // Perform intelligent coverage analysis
      const coverageAnalysis = await this.coverageAI.analyzeCoverageIntelligently(
        transcript,
        updatedSession.coverage,
        updatedSession.config.intelligenceContext.focusAreas,
        updatedSession.conversation
      );

      // Update coverage based on AI analysis
      if (coverageAnalysis.coverageUpdates) {
        const updatedCoverage = await this.updateCoverageIntelligently(
          sessionId,
          updatedSession.coverage,
          coverageAnalysis
        );
        await this.sessionManager.updateCoverage(sessionId, updatedCoverage);
      }

      // Get final updated session
      const finalSession = await this.sessionManager.getSession(sessionId);

      // Make intelligent decision using all AI analyses
      const decisionAnalysis = await this.decisionAI.makeIntelligentDecision(
        finalSession,
        transcript,
        {
          coverage: coverageAnalysis,
          memory: candidateEntry.aiAnalysis
        }
      );

      // Generate next question or action based on decision
      let nextAction;
      if (decisionAnalysis.decision === 'explore_new_area' || decisionAnalysis.decision === 'continue_probing') {
        // Check for question similarity to prevent repetition
        const proposedQuestion = await this.questionAI.generateIntelligentQuestion(
          finalSession,
          coverageAnalysis,
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer') }
        );

        // Verify question isn't too similar to previous ones
        const similarityAnalysis = await this.memoryAI.analyzeQuestionSimilarity(
          proposedQuestion.question,
          finalSession.conversation,
          sessionId
        );

        if (similarityAnalysis.isSimilar && similarityAnalysis.confidence > 70) {
          // Generate alternative question for same target area
          nextAction = await this.questionAI.generateTargetedQuestionForArea(
            decisionAnalysis.targetArea,
            finalSession.coverage.areas[decisionAnalysis.targetArea],
            finalSession.conversation,
            finalSession.config.context
          );
          nextAction.type = 'question';
          nextAction.content = nextAction.question;
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

      } else if (decisionAnalysis.decision === 'end_interview') {
        nextAction = {
          type: 'end_interview',
          content: 'Thank you for your time. This concludes our interview.',
          reasoning: decisionAnalysis.reasoning
        };
      }

      // Update real-time report with AI insights
      const reportUpdate = await this.updateRealTimeReportIntelligently(
        finalSession,
        transcript,
        coverageAnalysis,
        decisionAnalysis
      );
      await this.sessionManager.updateRealTimeReport(sessionId, reportUpdate);

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

      const response = await this.together.chat.completions.create({
        model: config.models.thinkingModel,
        messages: [
          {
            role: "system",
            content: this.getDecisionSystemPrompt(config)
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 800
      });

      const processingTime = Date.now() - startTime;
      const decisionContent = response.choices[0].message.content.trim();

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

      const response = await this.together.chat.completions.create({
        model: config.models.thinkingModel,
        messages: [
          {
            role: "system",
            content: "You are an expert interview analyst. Analyze responses for evidence of competencies and skills. Return structured JSON data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      });

      const analysisContent = response.choices[0].message.content.trim();

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

      const response = await this.together.chat.completions.create({
        model: config.models.analysisModel,
        messages: [
          {
            role: "system",
            content: "You are an expert interview evaluator. Provide constructive, actionable feedback in real-time. Be specific and evidence-based."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      });

      const reportContent = response.choices[0].message.content.trim();

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
   * Handle silence detection
   */
  async handleSilence(sessionId, silenceDuration) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Track silence event
      const silenceData = await this.sessionManager.trackSilence(sessionId, silenceDuration);

      const config = session.config;
      const maxSilences = config.sessionSettings.maxSilencePrompts;

      if (silenceData.silenceCount <= maxSilences) {
        // Generate intelligent silence prompt
        const silencePrompt = await this.generateSilencePrompt(session, silenceData);

        // Add prompt to conversation
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'system',
          content: silencePrompt.content,
          metadata: silencePrompt.metadata
        });

        return {
          action: 'silence_prompt',
          content: silencePrompt.content,
          silenceCount: silenceData.silenceCount,
          maxSilences
        };
      } else {
        // Generate next question to move forward
        const nextQuestion = await this.makeIntelligentDecision(session, "[SILENCE DETECTED - MOVING FORWARD]");

        return {
          action: 'move_forward',
          content: nextQuestion.content,
          reasoning: 'Maximum silence prompts reached',
          silenceCount: silenceData.silenceCount
        };
      }
    } catch (error) {
      console.error('❌ Failed to handle silence:', error.message);
      throw error;
    }
  }

  /**
   * Generate intelligent silence prompt
   */
  async generateSilencePrompt(session, silenceData) {
    try {
      const config = session.config;

      const prompt = `
        The candidate has been silent for ${silenceData.silenceDuration} seconds.
        This is silence event #${silenceData.silenceCount}.

        Interview Context: ${JSON.stringify(config.context)}
        Recent Conversation: ${JSON.stringify(session.conversation.slice(-3))}

        Generate an encouraging, helpful prompt to re-engage the candidate.
        Consider their communication style and the interview context.
        Keep it natural and supportive.
      `;

      const response = await this.together.chat.completions.create({
        model: config.models.fastModel,
        messages: [
          {
            role: "system",
            content: "You are a supportive interviewer. Help candidates who need encouragement during silence. Be empathetic and professional."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 150
      });

      const silencePrompt = response.choices[0].message.content.trim();

      return {
        content: silencePrompt,
        metadata: {
          model: config.models.fastModel,
          silenceCount: silenceData.silenceCount,
          silenceDuration: silenceData.silenceDuration,
          type: 'silence_prompt'
        }
      };
    } catch (error) {
      console.error('❌ Failed to generate silence prompt:', error.message);
      // Fallback silence prompts
      const fallbacks = [
        "Take your time to think about it. I'm here when you're ready to continue.",
        "No rush at all. Would you like me to rephrase the question?",
        "Feel free to take a moment to gather your thoughts. How would you like to approach this?"
      ];

      return {
        content: fallbacks[Math.floor(Math.random() * fallbacks.length)],
        metadata: { fallback: true, silenceCount: silenceData.silenceCount }
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
    // Handle different interview types
    let contextInfo = '';
    
    contextInfo = `
      Interview Type: ${config.interviewType}
      Target Company: ${config.context.targetCompany}
      Target Role: ${config.context.targetRole}
      Experience Level: ${config.context.experienceLevel}
      Test Reason: ${config.testReason}
      `;

    return `
      Generate a personalized greeting for this interview:

      ${contextInfo}
      Interviewer Persona: ${JSON.stringify(config.interviewerPersona)}
      Company Culture: ${JSON.stringify(config.companyProfile.culture)}

      Create a warm, professional greeting that:
      1. Sets the right tone for the interview type
      2. Makes the candidate feel comfortable
      3. Briefly explains what to expect
      4. Reflects the company culture

      Keep it conversational and under 3 sentences.
    `;
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

      const response = await this.together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 1000
      });

      const reportUpdate = AIUtils.parseJSONResponse(response.choices[0].message.content, 'updateRealTimeReport');

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
}

module.exports = new IntelligentInterviewService();