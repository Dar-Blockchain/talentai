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

      const response = await this.together.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 600
      });

      const responseContent = response.choices[0].message.content.trim();

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

      // Create session in Redis
      console.log('💾 [Service] Calling createSession...');
      const session = await this.sessionManager.createSession(sessionId, config, candidateId);
      console.log('✅ [Service] Session created in Redis');

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
        }
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

        const response = await this.together.chat.completions.create({
          model: config.models.fastModel,
          messages: [
            {
              role: "system",
              content: "You are a professional interviewer. Your task is to generate ONLY the greeting text - nothing else. Do not include labels, explanations, or formatting. Just write the natural greeting sentences."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.6,
          max_tokens: 400
        });

        const processingTime = Date.now() - startTime;
        const greeting = response.choices[0].message.content.trim();

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

      // Track silence and get current stage
      const silenceData = await this.sessionManager.trackSilence(sessionId, silenceDuration);

      console.log(`🔇 [HandleSilence] Stage ${silenceData.silenceStage}, Duration: ${silenceDuration}s`);

      let response;

      // Route to appropriate AI method based on stage
      switch (silenceData.silenceStage) {
        case 1: // First silence (30s) - Gentle patience
          response = await this.generatePatiencePrompt(session, silenceData);
          break;

        case 2: // Second silence (60s) - Help offer
          response = await this.generateHelpOffer(session, silenceData);
          break;

        case 3: // Third silence (90s) - Rephrase question
          response = await this.rephraseCurrentQuestion(session, silenceData);
          break;

        default: // 4+ silences - move forward
          const nextQuestion = await this.makeIntelligentDecision(session, "[EXTENDED SILENCE - MOVING FORWARD]");
          return {
            action: 'move_forward',
            content: nextQuestion.content,
            reasoning: 'Extended silence - moving to next topic',
            silenceStage: silenceData.silenceStage
          };
      }

      // Add prompt to conversation
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'system',
        content: response.content,
        metadata: response.metadata
      });

      return {
        action: 'silence_prompt',
        content: response.content,
        silenceStage: silenceData.silenceStage,
        metadata: response.metadata
      };
    } catch (error) {
      console.error('❌ Failed to handle silence:', error.message);
      throw error;
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

        const response = await this.together.chat.completions.create({
          model: config.models.fastModel,
          messages: [
            {
              role: "system",
              content: "You are a supportive interviewer. Your task is to generate ONLY the encouraging text - nothing else. Be empathetic and natural."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        });

        const silencePrompt = response.choices[0].message.content.trim();

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

      const response = await this.together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this question: "${questionText}"` }
        ],
        temperature: 0.2,
        max_tokens: 200
      });

      const responseContent = response.choices[0].message.content.trim();
      const parsed = AIUtils.parseJSONResponse(responseContent, 'detectQuestionComplexity');

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
   * Generate patience prompt (Stage 2 - First Silence)
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

      const response = await this.together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate patience prompt for: "${currentQuestion.substring(0, 100)}..."` }
        ],
        temperature: 0.7,
        max_tokens: 100
      });

      const patiencePrompt = response.choices[0].message.content.trim();

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
   * Generate help offer (Stage 3 - Second Silence)
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

      const response = await this.together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate help offer for: "${currentQuestion.substring(0, 100)}..."` }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      const helpOffer = response.choices[0].message.content.trim();

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
   * Rephrase current question (Stage 4 - Third Silence)
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

      const response = await this.together.chat.completions.create({
        model: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo", // Use better model for rephrasing
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.6,
        max_tokens: 400
      });

      const rephrasedQuestion = response.choices[0].message.content.trim();

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

    return `Generate a warm, professional greeting for this ${config.interviewType} interview:

INTERVIEW CONTEXT:
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Candidate Experience Level: ${config.context.experienceLevel}
- Interview Style: ${interviewerStyle}, ${interviewerTone}
- Company Values: ${cultureTrait}

REQUIREMENTS:
- Write 2-3 natural, conversational sentences
- Welcome the candidate warmly
- Briefly mention the position and company
- Set a comfortable, professional tone
- DO NOT use labels, bullet points, or structured format
- DO NOT include explanations or meta-text
- ONLY output the greeting text itself

Example format: "Hello! I'm excited to speak with you today about the [role] position at [company]. Let's have a great conversation about your experience and how you can contribute to our team."`;
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

  /**
   * INTELLIGENT RESPONSE SYSTEM - NEW METHODS
   * Selective AI analysis to reduce costs by 60%
   */

  /**
   * Determine if response needs full AI analysis or can use lightweight heuristics
   */
  shouldDoFullAnalysis(responseAnalysis, session) {
    // SKIP AI for obviously good responses (save $$$ - 30% of responses)
    if (responseAnalysis.quality >= 75) {
      console.log('⚡ [Optimization] Skipping AI - response quality excellent:', responseAnalysis.quality);
      return false;
    }

    // SKIP AI for obviously insufficient responses (save $$$ - 10% of responses)
    if (responseAnalysis.wordCount < 10) {
      console.log('⚡ [Optimization] Skipping AI - response too short:', responseAnalysis.wordCount);
      return false;
    }

    // SKIP AI for generic acknowledgments (save $$$ - 5% of responses)
    const genericPatterns = /^(yes|no|okay|ok|sure|i see|right|understood|got it)\.?$/i;
    if (genericPatterns.test(session.lastTranscript?.trim())) {
      console.log('⚡ [Optimization] Skipping AI - generic acknowledgment');
      return false;
    }

    // USE AI every 3rd response minimum to maintain coverage tracking (15% of remaining)
    const conversationLength = session.conversation?.length || 0;
    const responseCount = Math.floor(conversationLength / 2); // Rough estimate of candidate responses
    if (responseCount > 0 && responseCount % 3 !== 0) {
      // Check if quality is consistently good
      if (responseAnalysis.quality >= 60 && !responseAnalysis.needsSupport) {
        console.log('⚡ [Optimization] Skipping AI - consistent quality, not 3rd response');
        return false;
      }
    }

    // USE AI for medium-quality responses needing interpretation (40% of responses)
    if (responseAnalysis.quality >= 50 && responseAnalysis.quality < 75) {
      console.log('🧠 [AI Required] Medium quality - needs interpretation:', responseAnalysis.quality);
      return true;
    }

    // USE AI for struggling/off-topic/rambling responses (need better understanding)
    if (['struggling', 'off_topic', 'rambling'].includes(responseAnalysis.type)) {
      console.log('🧠 [AI Required] Problematic response type:', responseAnalysis.type);
      return true;
    }

    // USE AI for longer responses needing interpretation
    if (responseAnalysis.wordCount > 80) {
      console.log('🧠 [AI Required] Long response needs analysis:', responseAnalysis.wordCount);
      return true;
    }

    // Default: skip AI
    console.log('⚡ [Optimization] Skipping AI - default case');
    return false;
  }

  /**
   * Quick coverage update without full AI analysis
   * Update based on heuristic analysis only
   */
  async quickCoverageUpdate(sessionId, responseAnalysis) {
    try {
      const session = await this.sessionManager.getSession(sessionId);

      // Extract likely areas from keywords in response
      const keywords = responseAnalysis.signals.responseKeywords || [];
      const updatedCoverage = { ...session.coverage };

      // Simple keyword-to-area mapping
      const areaKeywords = {
        'technical_skills': ['code', 'programming', 'develop', 'build', 'system', 'database', 'api'],
        'problem_solving': ['solve', 'problem', 'challenge', 'solution', 'approach', 'debug'],
        'leadership': ['lead', 'manage', 'team', 'mentor', 'guide', 'coordinate'],
        'communication': ['explain', 'present', 'discuss', 'communicate', 'collaborate'],
        'experience': ['project', 'work', 'experience', 'role', 'position', 'company']
      };

      // Quick scoring based on keyword matches
      for (const [area, areaWords] of Object.entries(areaKeywords)) {
        const matches = keywords.filter(kw => areaWords.some(aw => kw.includes(aw) || aw.includes(kw)));

        if (matches.length > 0 && updatedCoverage.areas[area]) {
          // Increment score based on quality
          const increment = Math.round(responseAnalysis.quality / 20); // 0-5 points
          updatedCoverage.areas[area].score = Math.min(100, updatedCoverage.areas[area].score + increment);
          updatedCoverage.areas[area].questionsAsked += 1;

          console.log(`📊 [Quick Update] ${area}: +${increment} points (${matches.length} keywords matched)`);
        }
      }

      await this.sessionManager.updateCoverage(sessionId, updatedCoverage);

      return {
        updated: true,
        method: 'heuristic',
        areasUpdated: Object.keys(areaKeywords).filter(area =>
          keywords.some(kw => areaKeywords[area].some(aw => kw.includes(aw) || aw.includes(kw)))
        )
      };

    } catch (error) {
      console.error('❌ Error in quick coverage update:', error);
      return { updated: false, error: error.message };
    }
  }

  /**
   * Process candidate response with intelligent decision:
   * - Use lightweight analysis first
   * - Selectively call expensive AI (60% cost reduction)
   */
  async processCandidateResponseIntelligently(sessionId, transcript, audioMetadata = {}) {
    try {
      const ResponseQualityAnalyzer = require('../utils/responseQualityAnalyzer');
      const CandidateBehaviorTracker = require('../utils/candidateBehaviorTracker');
      const ContextualInterventions = require('../utils/contextualInterventions');

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // STEP 1: Lightweight heuristic analysis (< 1ms, $0)
      const currentQuestion = session.currentQuestionContext?.originalQuestion || session.conversation[session.conversation.length - 1]?.content;
      const responseAnalysis = ResponseQualityAnalyzer.analyzeResponseQuality(transcript, currentQuestion);

      console.log('📊 [Response Analysis]', {
        quality: responseAnalysis.quality,
        type: responseAnalysis.type,
        wordCount: responseAnalysis.wordCount,
        needsSupport: responseAnalysis.needsSupport,
        supportType: responseAnalysis.supportType
      });

      // STEP 2: Update behavior tracker
      let behaviorTracker = CandidateBehaviorTracker.fromJSON(session.behaviorTrackerData);
      behaviorTracker.addResponse(responseAnalysis);
      await this.sessionManager.updateSession(sessionId, {
        behaviorTrackerData: behaviorTracker.toJSON()
      });

      // STEP 3: Check for IMMEDIATE intervention (< 1s response time)
      const immediateIntervention = behaviorTracker.needsImmediateIntervention(responseAnalysis);

      if (immediateIntervention.needed) {
        console.log('🚨 [Immediate Intervention]', immediateIntervention);

        // Generate intervention message
        const intervention = await ContextualInterventions.generate(immediateIntervention.suggestedAction, {
          currentQuestion,
          lastResponse: responseAnalysis,
          behaviorProfile: behaviorTracker.getCommunicationStyle()
        });

        // Store candidate response
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'candidate',
          content: transcript,
          timestamp: new Date().toISOString(),
          metadata: { ...audioMetadata, quickAnalysis: responseAnalysis }
        });

        // Return intervention immediately
        return {
          action: 'immediate_intervention',
          content: intervention.content,
          reasoning: `Immediate help needed: ${immediateIntervention.reason}`,
          interventionType: immediateIntervention.suggestedAction,
          urgency: immediateIntervention.urgency,
          metadata: {
            lightweight: true,
            timestamp: new Date().toISOString()
          }
        };
      }

      // STEP 4: Decide if full AI analysis is needed
      const needsAI = this.shouldDoFullAnalysis(responseAnalysis, session);

      if (needsAI) {
        // USE EXPENSIVE AI ANALYSIS (40% of responses)
        console.log('🧠 [Full AI Analysis] Response needs deep interpretation');

        // Call original processCandidateResponse for full AI processing
        return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
      } else {
        // SKIP EXPENSIVE AI (60% of responses - COST SAVINGS!)
        console.log('⚡ [Optimized Path] Using lightweight processing');

        // Store candidate response with lightweight analysis
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'candidate',
          content: transcript,
          timestamp: new Date().toISOString(),
          metadata: { ...audioMetadata, quickAnalysis: responseAnalysis }
        });

        // Quick coverage update without AI
        const coverageUpdate = await this.quickCoverageUpdate(sessionId, responseAnalysis);

        // Check if delayed intervention is recommended
        const delayedIntervention = behaviorTracker.needsDelayedIntervention(responseAnalysis);

        // Generate next question using AI (still needed for quality questions)
        const finalSession = await this.sessionManager.getSession(sessionId);
        const decisionAnalysis = {
          decision: 'continue_probing',
          targetArea: 'General',
          reasoning: 'Continue conversation based on lightweight analysis'
        };

        const proposedQuestion = await this.questionAI.generateIntelligentQuestion(
          finalSession,
          { overallAssessment: { recommendedFocus: ['General'] } },
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer') }
        );

        // Store interviewer question
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'interviewer',
          content: proposedQuestion.question,
          timestamp: new Date().toISOString(),
          metadata: {
            aiGenerated: true,
            lightweightProcessing: true,
            targetAreas: proposedQuestion.targetAreas
          }
        });

        // Save question for potential rephrasing
        const complexity = await this.detectQuestionComplexity(proposedQuestion.question);
        await this.sessionManager.saveCurrentQuestion(sessionId, proposedQuestion.question, complexity);

        return {
          action: 'continue_probing',
          content: proposedQuestion.question,
          reasoning: proposedQuestion.reasoning,
          delayedIntervention: delayedIntervention.needed ? delayedIntervention : null,
          metadata: {
            lightweight: true,
            costOptimized: true,
            responseQuality: responseAnalysis.quality,
            timestamp: new Date().toISOString()
          }
        };
      }

    } catch (error) {
      console.error('❌ Failed to process candidate response intelligently:', error);

      // Fallback to full AI processing on error
      console.log('⚠️ Falling back to full AI processing due to error');
      return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
    }
  }
}

module.exports = new IntelligentInterviewService();