/**
 * Intelligent Interview Service
 * Core AI engine for adaptive interview management
 */
'use strict';

const bedrock          = require('../../helpers/bedrock.helpers');
const ragService       = require('../rag.service');
const configManager    = require('../../utils/config-manager');
const { detectJobCategory, getEvaluationFramework } = require('../../utils/config-manager');
const redisSessionManager = require('../../utils/redis-session-manager');
const Post             = require('../../models/Post.model');

// AI sub-modules
const AIUtils            = require('./ai/AIUtils');
const MemoryAI           = require('./ai/MemoryAI');
const CoverageAnalysisAI = require('./ai/CoverageAnalysisAI');
const QuestionGeneratorAI = require('./ai/QuestionGeneratorAI');
const DecisionEngineAI   = require('./ai/DecisionEngineAI');

// Prompts
const {
  UNIVERSAL_STYLES,
  FRAMEWORK_STYLE_INSTRUCTIONS,
  SHOULD_END_INTERVIEW_SYSTEM,
  REAL_TIME_REPORT_SYSTEM,
  DETECT_COMPLEXITY_SYSTEM,
  buildAgentPersonaUser,
  buildCombinedAnalysisSystem,
  buildGreetingSystem,
  buildGreetingUser,
  buildSilenceUser,
  buildFinalReportUser,
} = require('./interviewPrompts');

require('dotenv').config();


class IntelligentInterviewService {
  constructor() {
    this.sessionManager = redisSessionManager;
    this.memoryAI    = new MemoryAI();
    this.coverageAI  = new CoverageAnalysisAI();
    this.questionAI  = new QuestionGeneratorAI();
    this.decisionAI  = new DecisionEngineAI();
  }

  // â”€â”€ Initialization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Build agent persona from job description â€” ONE LLM call at interview start.
   * Creates a job-aware AI profile with must-have skills, red flags, and evaluation framework.
   */
  async buildAgentPersona(jobData, interviewConfig) {
    const jobCategory = interviewConfig.jobCategory || detectJobCategory(jobData.title, jobData.description);
    const evaluationFramework = getEvaluationFramework(jobCategory, interviewConfig.interviewType);

    let parsed;
    try {
      const analysis = await bedrock.callLLM({
        systemPrompt: "You are an expert recruiter. Analyze this job and return ONLY a valid JSON object. No explanation, no reasoning, no text before or after the JSON.",
        messages: [{ role: "user", content: buildAgentPersonaUser({
          title: jobData.title,
          company: jobData.company || jobData.companyName || '',
          description: jobData.description || '',
          skills: jobData.skills || [],
          requirements: jobData.requirements || [],
          responsibilities: jobData.responsibilities || [],
          experienceLevel: jobData.experienceLevel || interviewConfig.context?.experienceLevel || 'mid',
          jobCategory,
          interviewType: interviewConfig.interviewType,
        }) }],
        temperature: 0.2,
        maxTokens: 800,
        timeout: 30000,
        useFastModel: true
      });

      parsed = AIUtils.parseJSONResponse(analysis.content, 'buildAgentPersona');
    } catch (error) {
      console.warn('âš ï¸ [Persona] LLM analysis failed, using defaults:', error.message);
      parsed = AIUtils.getFallbackResponse('buildAgentPersona', '');
    }

    // Use LLM-generated focus areas if valid, otherwise fall back to static framework
    const llmFocusAreas = parsed.focusAreas;
    const llmQuestionStyles = parsed.questionStyles;
    let finalEvaluationFramework;

    if (llmFocusAreas && typeof llmFocusAreas === 'object' && Object.keys(llmFocusAreas).length >= 3) {
      const totalWeight = Object.values(llmFocusAreas).reduce((sum, a) => sum + (a?.weight || 0), 0);
      if (totalWeight >= 80 && totalWeight <= 120) {
        // Normalize weights to sum to exactly 100
        const normFactor = 100 / totalWeight;
        for (const key of Object.keys(llmFocusAreas)) {
          llmFocusAreas[key].weight = Math.round(llmFocusAreas[key].weight * normFactor);
          // Ensure indicators is an array
          if (!Array.isArray(llmFocusAreas[key].indicators)) {
            llmFocusAreas[key].indicators = [];
          }
        }
        finalEvaluationFramework = {
          focusAreas: llmFocusAreas,
          questionStyles: Array.isArray(llmQuestionStyles) && llmQuestionStyles.length > 0
            ? llmQuestionStyles
            : evaluationFramework.questionStyles
        };
        console.log(`ðŸŽ¯ [Persona] LLM-generated focus areas: ${Object.keys(llmFocusAreas).join(', ')}`);
      } else {
        finalEvaluationFramework = evaluationFramework;
        console.log(`âš ï¸ [Persona] LLM focus areas invalid weights (${totalWeight}), using static framework`);
      }
    } else {
      finalEvaluationFramework = evaluationFramework;
      console.log(`âš ï¸ [Persona] No LLM focus areas returned, using static framework: ${Object.keys(evaluationFramework.focusAreas).join(', ')}`);
    }

    console.log(`ðŸŽ­ [Persona] Built for ${jobCategory}/${interviewConfig.interviewType}: ${parsed.mustHaveSkills?.length || 0} must-haves, ${parsed.redFlags?.length || 0} red flags, ${Object.keys(finalEvaluationFramework.focusAreas).length} focus areas`);

    return {
      job: {
        title: jobData.title,
        company: jobData.company || jobData.companyName,
        description: jobData.description,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        experienceLevel: jobData.experienceLevel || interviewConfig.context?.experienceLevel || "mid",
      },
      interviewType: interviewConfig.interviewType,
      jobCategory,
      idealCandidate: parsed,
      evaluationFramework: finalEvaluationFramework,
      agentBehavior: {
        tone: parsed.agentTone || "professional and conversational",
        domainTopics: parsed.domainSpecificTopics || [],
      },
    };
  }

  // â”€â”€ AI Analysis â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Combined Analysis â€” ONE LLM call replaces analyzeResponseIntelligence + analyzeResponseQuality
   * + analyzeCoverageIntelligently + shouldEndInterview (LLM part).
   */
  async combinedAnalysis(candidateResponse, session, lastQuestion, targetArea) {
    const systemPrompt = buildCombinedAnalysisSystem(session);

    const coverageSummary = Object.fromEntries(
      Object.entries(session.coverage?.areas || {}).map(([a, d]) => [a, d.percentage + "%"])
    );

    const userPrompt = `INTERVIEWER QUESTION: "${lastQuestion || "N/A"}"
TARGET AREA: ${targetArea || "General"}
CANDIDATE RESPONSE: "${candidateResponse}"
CURRENT COVERAGE: ${JSON.stringify(coverageSummary)}
CONVERSATION LENGTH: ${session.conversation?.length || 0} exchanges`;

    try {
      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.2,
        maxTokens: 2048,
        timeout: 25000,
        useFastModel: false // gpt-oss â€” strong model for critical analysis (needs high maxTokens for reasoning + JSON)
      });

      return AIUtils.parseJSONResponse(response.content, 'combinedAnalysis');
    } catch (error) {
      console.warn('âš ï¸ [Combined Analysis] Failed, using fallback:', error.message);
      return AIUtils.getFallbackResponse('combinedAnalysis', '');
    }
  }

  /**
   * Update candidate profile with analysis results. Pure logic â€” no LLM call.
   */
  updateCandidateProfile(profile, analysis, turnNumber) {
    if (!profile) {
      profile = {
        communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
        revealedExpertise: [], revealedGaps: [], mentionedProjects: [], anchors: [],
        currentDifficulty: "intermediate", responseQualities: [],
      };
    }

    if (analysis.style) {
      profile.communicationStyle.verbosity = analysis.style.verbosity;
      profile.communicationStyle.confidenceLevel = analysis.style.confidence;
      profile.communicationStyle.usesExamples = analysis.style.usesExamples;
    }

    if (analysis.skills?.demonstrated && (analysis.quality?.score || 0) >= 50) {
      for (const s of analysis.skills.demonstrated) {
        if (!profile.revealedExpertise.includes(s)) profile.revealedExpertise.push(s);
      }
    }
    if (analysis.skills?.gaps) {
      for (const s of analysis.skills.gaps) {
        if (!profile.revealedGaps.includes(s)) profile.revealedGaps.push(s);
      }
    }

    if (analysis.interestingTopics) {
      for (const topic of analysis.interestingTopics) {
        profile.anchors.push({
          turn: turnNumber,
          topic: topic.topic,
          unexplored: topic.unexplored || [],
          relevantArea: topic.relevantArea
        });
      }
      profile.anchors = profile.anchors.slice(-10);
    }

    profile.responseQualities.push(analysis.quality?.score ?? 0);
    const avg = profile.responseQualities.reduce((a, b) => a + b, 0) / profile.responseQualities.length;
    profile.currentDifficulty = avg >= 75 ? "advanced" : avg >= 50 ? "intermediate" : "foundational";

    return profile;
  }

  /**
   * Decide question strategy based on analysis + profile + coverage. Pure logic â€” no LLM call.
   * Returns one of 4 modes: bridge, probe, transition, validate.
   */
  decideQuestionStrategy(analysis, candidateProfile, coverage, session) {
    const areas = coverage.areas || {};
    const currentArea = session.currentFocusArea;
    const questionsInArea = areas[currentArea]?.questionsAsked || 0;

    // PASS/SKIP: If candidate just passed, immediately transition to different area
    const lastCandidateEntry = session.conversation?.filter(e => e.type === 'candidate').slice(-1)[0];
    const lastMeta = lastCandidateEntry?.metadata;
    if (lastMeta?.answeredQuestion === false || lastMeta?.completeness === 'avoided') {
      const weakest = Object.entries(areas)
        .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed)
        .sort((a, b) => a[1].percentage - b[1].percentage)[0];
      if (weakest) {
        return {
          mode: "transition",
          targetArea: weakest[0],
          context: `Candidate passed on ${currentArea} â€” moving to ${weakest[0]}`
        };
      }
    }

    // HARD CAP: After 2 questions in current area, always transition to weakest area
    if (questionsInArea >= 2 && currentArea) {
      const weakest = Object.entries(areas)
        .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed)
        .sort((a, b) => a[1].percentage - b[1].percentage)[0];
      if (weakest) {
        return {
          mode: "transition",
          targetArea: weakest[0],
          context: `Forced transition after ${questionsInArea} questions in ${currentArea}`
        };
      }
    }

    // Priority 1: BRIDGE â€” candidate mentioned something mapping to a gap
    for (const topic of (analysis.interestingTopics || [])) {
      if (topic.relevantArea && areas[topic.relevantArea] && areas[topic.relevantArea].percentage < 60) {
        return {
          mode: "bridge",
          targetArea: topic.relevantArea,
          context: `Candidate mentioned "${topic.topic}"`,
          unexploredAngles: topic.unexplored
        };
      }
    }

    // Priority 2: PROBE â€” only 1 follow-up before moving on
    if (currentArea && questionsInArea < 2 && areas[currentArea]?.percentage < 70 && analysis.quality?.depthLevel === "surface") {
      return {
        mode: "probe",
        targetArea: currentArea,
        context: "Answer was surface-level â€” ask for specific example"
      };
    }

    // Priority 3: TRANSITION â€” explore weakest uncovered area (threshold raised to < 70%)
    const weakest = Object.entries(areas)
      .filter(([_, d]) => d.percentage < 70 && !d.completed)
      .sort((a, b) => a[1].percentage - b[1].percentage)[0];

    if (weakest) {
      const anchor = candidateProfile?.anchors?.find(a => a.unexplored?.length > 0);
      return {
        mode: "transition",
        targetArea: weakest[0],
        context: anchor ? `Bridge from "${anchor.topic}" to ${weakest[0]}` : `Transition to ${weakest[0]}`
      };
    }

    // Priority 4: VALIDATE
    return {
      mode: "validate",
      targetArea: currentArea || Object.keys(areas)[0],
      context: "Ask a final validation question"
    };
  }

  /**
   * Select question style â€” pure logic, no LLM call (~0ms).
   * Picks from universal styles + framework-defined styles + direct, with rotation to avoid repeats.
   */
  selectQuestionStyle(session, analysis, questionStrategy) {
    const turnNumber = Math.floor((session.conversation?.length || 0) / 2);
    const styleHistory = session.questionStyleHistory || [];
    const lastStyle = styleHistory.length > 0 ? styleHistory[styleHistory.length - 1] : null;
    const lastTwoStyles = new Set(styleHistory.slice(-2));

    // Build available styles pool
    const frameworkStyles = session.agentPersona?.evaluationFramework?.questionStyles || [];
    const availableStyles = [];

    // Universal: situational (always eligible)
    availableStyles.push(UNIVERSAL_STYLES.situational);

    // Universal: problem-finding (after turn 2 â€” need context about candidate level)
    if (turnNumber >= 2) {
      availableStyles.push(UNIVERSAL_STYLES['problem-finding']);
    }

    // Universal: challenge (only when there's something worth challenging)
    const lastQuality = analysis?.quality?.score || 50;
    const lastDepth = analysis?.quality?.depthLevel;
    const lastConfidence = session.candidateProfile?.communicationStyle?.confidenceLevel;
    if (turnNumber >= 1 &&
        (lastQuality >= 55 || lastConfidence === 'confident') &&
        lastDepth !== 'surface' &&
        questionStrategy?.mode !== 'transition') {
      availableStyles.push(UNIVERSAL_STYLES.challenge);
    }

    // Framework styles (from config-manager, category-specific)
    for (const styleName of frameworkStyles) {
      if (styleName === 'situational') continue; // already in universal
      const instruction = FRAMEWORK_STYLE_INSTRUCTIONS[styleName];
      if (instruction) {
        availableStyles.push({ id: styleName, instruction, minTurn: 0, requiresContext: false });
      }
    }

    // Direct style (preserves current default behavior)
    availableStyles.push({ id: 'direct', instruction: null, minTurn: 0, requiresContext: false });

    // Hard filter: no consecutive repeats
    let eligible = availableStyles.filter(s => s.id !== lastStyle);

    // Soft filter: deprioritize styles used in last 2 turns
    const fresh = eligible.filter(s => !lastTwoStyles.has(s.id));
    const pool = fresh.length > 0 ? fresh : eligible;

    // Weighted random: universal=3, framework=2, direct=1
    const weighted = [];
    for (const style of pool) {
      const weight = UNIVERSAL_STYLES[style.id] ? 3 : (style.id === 'direct' ? 1 : 2);
      for (let i = 0; i < weight; i++) weighted.push(style);
    }

    return weighted[Math.floor(Math.random() * weighted.length)];
  }

  // â”€â”€ Service Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Initialize service
   */
  async initialize() {
    try {
      // Initialize Redis connection with timeout to prevent blocking
      console.log('ðŸ”Œ [Service] Attempting to connect to Redis...');
      const redisInitialized = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout after 5 seconds')), 5000)
        )
      ]).catch(err => {
        console.error('âš ï¸  [Service] Redis initialization failed:', err.message);
        console.warn('âš ï¸  [Service] Interview service will continue WITHOUT Redis (in-memory mode)');
        console.warn('âš ï¸  [Service] Sessions will not persist across server restarts');
        console.warn('ðŸ’¡ [Service] To fix: Run `redis-server` or `sudo service redis-server start` in WSL');
        return false;
      });

      if (redisInitialized) {
        console.log('âœ… [Service] Intelligent Interview Service initialized with Redis');
        console.log('ðŸ’¾ [Service] Sessions will be stored in Redis with 2-hour TTL');

        // Test Redis connection with ping
        try {
          const pingTest = await this.sessionManager.client.ping();
          console.log('ðŸ“ [Service] Redis connectivity test:', pingTest);
          console.log('ðŸ“Š [Service] Redis status:', {
            isConnected: this.sessionManager.isConnected,
            isReady: this.sessionManager.isReady()
          });
        } catch (pingError) {
          console.error('âŒ [Service] Redis ping test failed:', pingError.message);
          console.warn('âš ï¸  [Service] Redis may not be fully operational');
        }
      } else {
        console.log('âš ï¸  [Service] Intelligent Interview Service initialized WITHOUT Redis (degraded mode)');
        console.log('âš ï¸  [Service] Interview features may be limited');
      }

      return true;  // Always return true to not block server startup
    } catch (error) {
      console.error('âŒ [Service] Failed to initialize Intelligent Interview Service:', error.message);
      console.warn('âš ï¸  [Service] Server will continue without interview service');
      return true;  // Don't block server startup
    }
  }

  // â”€â”€ Scoring & State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        console.log(`âŒ [Quality Counter] Bad answer ${tracking.consecutiveBadAnswers}/8 (score: ${qualityScore})`);
      } else if (qualityScore >= GOOD_THRESHOLD) {
        // Good answer: increment good counter, reset bad counter
        tracking.consecutiveGoodAnswers++;
        tracking.consecutiveBadAnswers = 0;
        tracking.totalGoodAnswers++;
        console.log(`âœ… [Quality Counter] Good answer ${tracking.consecutiveGoodAnswers}/8 (score: ${qualityScore})`);
      } else {
        // Medium quality (40-74): reset both counters
        tracking.consecutiveBadAnswers = 0;
        tracking.consecutiveGoodAnswers = 0;
        console.log(`ðŸ“Š [Quality Counter] Medium answer (score: ${qualityScore}) - counters reset`);
      }

      tracking.lastQualityScore = qualityScore;

      await this.sessionManager.updateSession(sessionId, { qualityTracking: tracking });
    } catch (error) {
      console.error('âŒ Failed to update quality counters:', error.message);
    }
  }

  async shouldEndInterview(session, totalDuration) {
    try {
      // ðŸ• TIME LIMIT CHECK (hard cap = target Ã— 1.5, e.g., 45 min)
      if (session.interviewStartTime) {
        const elapsedMinutes = (Date.now() - session.interviewStartTime) / 60000;
        const maxDuration = session.maxDurationMinutes || 45;

        if (elapsedMinutes >= maxDuration) {
          console.log(`â° [Time Limit] ${elapsedMinutes.toFixed(1)} minutes elapsed (max: ${maxDuration}) - ending interview`);
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

      // ðŸ“Š QUALITY-BASED TERMINATION: Check consecutive answer quality
      if (session.qualityTracking) {
        const tracking = session.qualityTracking;

        // 8 CONSECUTIVE BAD ANSWERS â†’ End with poor score
        if (tracking.consecutiveBadAnswers >= 8) {
          console.log(`ðŸš« [Poor Quality Termination] 8 consecutive bad answers - ending interview`);
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

        // 8 CONSECUTIVE GOOD ANSWERS â†’ End only if coverage is also adequate
        const overallCoverage = session.coverage?.overall || 0;
        if (tracking.consecutiveGoodAnswers >= 8 && overallCoverage >= 60) {
          console.log(`âœ… [Excellent Quality Termination] 8 consecutive good answers + ${overallCoverage}% coverage - ending interview`);
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
        console.log(`âŒ [Early Termination - Poor Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses`);
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

      // EARLY EXCELLENCE: Consistently outstanding performance after 6+ responses (symmetric with poor exit)
      if (candidateResponseCount >= 6 && overallQualityAverage >= 85) {
        console.log(`ðŸŒŸ [Early Excellence] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses â€” ending early`);
        return {
          shouldEnd: true,
          confidence: 95,
          reasoning: `Candidate consistently demonstrates excellent competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Clear signal of strong capability â€” further questioning provides diminishing returns.`,
          completedObjectives: ['Technical competency validated', 'Consistently excellent responses'],
          remainingGaps: [],
          recommendedAction: 'End interview - candidate clearly qualified',
          earlySuccess: true,
          terminationReason: 'early_excellence',
          message: 'Excellent! You\'ve demonstrated outstanding understanding across all topics. Thank you for your time.',
          qualityScore: overallQualityAverage,
          responseCount: candidateResponseCount,
          score: 'excellent'
        };
      }

      // EARLY SUCCESS: Consistently excellent performance after 8+ responses â€” only if coverage adequate
      const overallCov = session.coverage?.overall || 0;
      if (candidateResponseCount >= 8 && overallQualityAverage >= 80 && overallCov >= 60) {
        console.log(`âœ… [Early Success - Excellent Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality, ${overallCov}% coverage over ${candidateResponseCount} responses`);
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

      // Coverage-based guard: skip LLM if insufficient evidence to assess the candidate
      const currentOverallCoverage = session.coverage?.overall || 0;
      const areasExplored = Object.values(session.coverage?.areas || {})
        .filter(a => a.percentage > 0).length;
      const totalAreas = Object.keys(session.coverage?.areas || {}).length;

      if (currentOverallCoverage < 40 || areasExplored < Math.min(2, totalAreas)) {
        console.log(`â³ [shouldEndInterview] Coverage ${currentOverallCoverage}%, ${areasExplored}/${totalAreas} areas explored â€” insufficient data, continuing`);
        return {
          shouldEnd: false,
          confidence: 0,
          reasoning: `Coverage at ${currentOverallCoverage}% with ${areasExplored}/${totalAreas} areas explored â€” insufficient data to assess candidate`
        };
      }

      // Continue with LLM evaluation now that we have enough evidence
      const userPrompt = `INTERVIEW EVALUATION:
Elapsed: ${totalDuration} minutes
Target Duration: ${session.targetDurationMinutes || session.config.sessionSettings.duration} minutes
Maximum Duration: ${session.maxDurationMinutes || 45} minutes

COVERAGE STATUS:
${JSON.stringify(session.coverage, null, 2)}

FOCUS AREAS:
${JSON.stringify(session.config.intelligenceContext.focusAreas, null, 2)}

CONVERSATION LENGTH: ${session.conversation.length} exchanges
Determine if interview objectives have been sufficiently met to end the session.`;

      const response = await bedrock.callLLM({
        systemPrompt: SHOULD_END_INTERVIEW_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.1,
        maxTokens: 500,
        timeout: 30000,
        useFastModel: true
      });

      return AIUtils.parseJSONResponse(response.content, 'shouldEndInterview');
    } catch (error) {
      console.error('Error determining interview end:', error);
      return { shouldEnd: false, confidence: 0, reasoning: "Analysis failed" };
    }
  }

  // â”€â”€ Interview Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Start new interview session
   */
  async startInterview(sessionId, userConfig, candidateId, onGreetingChunk = null) {
    try {
      console.log(`ðŸš€ [Service] Starting interview session: ${sessionId} for candidate: ${candidateId}`);

      // Check Redis connection status before proceeding
      console.log('ðŸ” [Service] Checking Redis connection status...');
      console.log('ðŸ“Š [Service] Redis state:', {
        isConnected: this.sessionManager.isConnected,
        isReady: this.sessionManager.isReady(),
        clientExists: !!this.sessionManager.client
      });

      if (!this.sessionManager.isConnected || !this.sessionManager.client) {
        console.error('âŒ [Service] Redis is NOT connected - Cannot start interview');
        throw new Error('Redis connection not available. Please ensure Redis is running.');
      }

      // Create intelligent configuration
      const config = configManager.createIntelligentConfig(userConfig);
      configManager.validateConfig(config);
      console.log('âœ… [Service] Config validated');

      // Create session in Redis with time tracking and quality counters
      console.log('ðŸ’¾ [Service] Calling createSession...');
      const session = await this.sessionManager.createSession(sessionId, config, candidateId);
      console.log('âœ… [Service] Session created in Redis');

      // Fetch full job description from Post model and cache in session
      let jobDescription = null;
      try {
        const jobId = userConfig.context?.jobId || userConfig.jobId;
        if (jobId) {
          const post = await Post.findById(jobId)
            .populate({ path: 'user', populate: { path: 'profile', select: 'companyDetails' } });
          if (post?.jobDetails) {
            const companyName = post.user?.profile?.companyDetails?.name || config.context.targetCompany || 'the company';
            jobDescription = {
              title: post.jobDetails?.title || config.context.targetRole,
              companyName: companyName,
              description: post.jobDetails.description,
              requirements: post.jobDetails.requirements || [],
              responsibilities: post.jobDetails.responsibilities || [],
              skills: (post.skillAnalysis?.requiredSkills || []).map(s => s.name).filter(Boolean)
            };
            // Propagate real company name to all downstream uses (greeting, prompts, result)
            config.context.targetCompany = companyName;
            console.log(`âœ… [Service] Full JD loaded: ${jobDescription.title} at ${companyName} (${jobDescription.requirements.length} requirements, ${jobDescription.responsibilities.length} responsibilities)`);

            // Index JD for RAG (runs once, skips if already indexed)
            ragService.indexJobDescription(jobId, jobDescription).catch(err =>
              console.warn('âš ï¸ [RAG] JD indexing failed (non-blocking):', err.message)
            );
          }
        }
      } catch (jdError) {
        console.warn('âš ï¸ [Service] Failed to load JD from DB:', jdError.message);
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
        console.log(`âœ… [Service] JD loaded from config context: ${jobDescription.title} at ${jobDescription.companyName}`);
      }

      // Build agent persona from JD (ONE LLM call â€” sets evaluation framework + ideal candidate)
      let agentPersona = null;
      if (jobDescription) {
        try {
          agentPersona = await this.buildAgentPersona(jobDescription, config);
          await this.sessionManager.updateSession(sessionId, { agentPersona });

          // Override coverage areas with evaluation framework from persona
          const frameworkAreas = {};
          for (const [area, areaConfig] of Object.entries(agentPersona.evaluationFramework.focusAreas)) {
            frameworkAreas[area] = {
              percentage: 0,
              weight: areaConfig.weight,
              questionsAsked: 0,
              completed: false,
              indicators: [],
              description: areaConfig.description,
            };
          }
          await this.sessionManager.updateCoverage(sessionId, {
            overall: 0,
            areas: frameworkAreas,
            completedAreas: [],
            lastUpdated: new Date().toISOString()
          });
          console.log(`âœ… [Service] Persona-driven coverage initialized: ${Object.keys(frameworkAreas).length} areas from ${agentPersona.jobCategory} framework`);

          // Sync intelligenceContext.focusAreas with persona-driven areas (so analysis prompts use JD-specific areas)
          const syncedFocusAreas = Object.entries(agentPersona.evaluationFramework.focusAreas).map(
            ([area, cfg]) => ({
              area,
              weight: (cfg.weight || 25) / 100,
              indicators: cfg.indicators || [],
              depth: cfg.description || ""
            })
          );
          config.intelligenceContext.focusAreas = syncedFocusAreas;
          await this.sessionManager.updateSession(sessionId, { config });
          console.log(`ðŸ”„ [Service] intelligenceContext.focusAreas synced: ${syncedFocusAreas.map(a => a.area).join(', ')}`);

          // Build JD skills checklist for tracking question coverage
          const jdSkillsChecklist = [
            ...(agentPersona.idealCandidate?.mustHaveSkills || []),
            ...(agentPersona.idealCandidate?.niceToHaveSkills || [])
          ].map(skill => ({ skill, asked: false, covered: false }));
          await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist });
          console.log(`ðŸ“‹ [Service] JD skills checklist initialized: ${jdSkillsChecklist.length} skills to track`);

        } catch (personaError) {
          console.warn('âš ï¸ [Service] Persona building failed (non-blocking):', personaError.message);
        }
      }

      // Initialize candidate profile for adaptive behavior
      await this.sessionManager.updateSession(sessionId, {
        candidateProfile: {
          communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
          revealedExpertise: [],
          revealedGaps: [],
          mentionedProjects: [],
          anchors: [],
          currentDifficulty: "intermediate",
          responseQualities: [],
        }
      });

      // Initialize interview timing and quality tracking
      // Re-fetch session to get updated coverage (may have been overridden by persona)
      const updatedSessionForTiming = await this.sessionManager.getSession(sessionId);
      const coverageAreas = Object.keys(updatedSessionForTiming.coverage?.areas || {});
      const totalMinutes = config.sessionSettings?.duration || 30;
      const maxDurationMinutes = Math.ceil(totalMinutes * 1.5); // 30 â†’ 45
      const timeBudgetPerAreaMs = coverageAreas.length > 0
        ? (totalMinutes * 60 * 1000) / coverageAreas.length
        : totalMinutes * 60 * 1000;

      await this.sessionManager.updateSession(sessionId, {
        interviewStartTime: Date.now(),
        targetDurationMinutes: totalMinutes,     // target duration (e.g., 30 min)
        maxDurationMinutes: maxDurationMinutes,   // hard cap (e.g., 45 min)
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
      console.log(`âœ… [Service] Interview timing: target ${totalMinutes}min, max ${maxDurationMinutes}min, ${Math.round(timeBudgetPerAreaMs/1000)}s per area (${coverageAreas.length} areas)`);

      // Generate intelligent greeting with error handling
      let greeting;
      try {
        console.log('ðŸ¤– Generating AI greeting...');
        greeting = await this.generateIntelligentGreeting(config, onGreetingChunk, agentPersona);
        console.log('âœ… AI greeting generated');
      } catch (greetingError) {
        console.error('âš ï¸ AI greeting failed, using fallback:', greetingError.message);
        // Use fallback greeting immediately
        greeting = {
          content: `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`,
          metadata: { fallback: true, error: greetingError.message }
        };
      }

      // Add greeting to conversation
      console.log('ðŸ’¬ [Service] Adding greeting to conversation...');
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: greeting.content,
        model: config.models.fastModel,
        metadata: greeting.metadata
      });
      console.log('âœ… [Service] Greeting added to conversation');

      // Save greeting as current question (simple complexity)
      await this.sessionManager.saveCurrentQuestion(sessionId, greeting.content, 'simple');
      console.log('ðŸ’¾ [Greeting] Saved as current question');

      // Update session status
      console.log('ðŸ“Š [Service] Updating session status to active...');
      await this.sessionManager.updateSession(sessionId, { status: 'active' });
      console.log('âœ… [Service] Session status updated to active');

      console.log('ðŸ“¤ [Service] Preparing to return result to controller...');
      console.log(`âœ… [Service] Interview ${sessionId} started successfully - returning to controller`);

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

      console.log('âœ… [Service] Result prepared:', {
        success: result.success,
        sessionId: result.sessionId,
        greetingLength: result.greeting.length,
        configType: result.config.interviewType
      });

      return result;
    } catch (error) {
      console.error('âŒ [Service] CRITICAL: Failed to start interview:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      console.error('âŒ [Service] Full error object:', error);
      throw error;
    }
  }

  /**
   * Generate intelligent greeting based on context
   */
  async generateIntelligentGreeting(config, onChunk = null, persona = null) {
    const maxRetries = 2;
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const startTime = Date.now();

        console.log(`ðŸ¤– [Greeting] Attempt ${attempt}/${maxRetries} - Generating greeting...`);

        const llmOptions = {
          systemPrompt: buildGreetingSystem(config),
          messages: [{ role: "user", content: buildGreetingUser(config, persona) }],
          temperature: 0.6,
          maxTokens: 400,
          timeout: 30000
        };

        // Use streaming if onChunk callback is provided
        const response = onChunk
          ? await bedrock.callLLMStreaming({ ...llmOptions, onChunk })
          : await bedrock.callLLM(llmOptions);

        const processingTime = Date.now() - startTime;
        const greeting = response.content.trim();

        // Log the actual response for debugging
        console.log('âœ… [Greeting] AI response received:', {
          length: greeting.length,
          preview: greeting.substring(0, 100) + (greeting.length > 100 ? '...' : ''),
          processingTime: `${processingTime}ms`
        });

        // Validate the greeting is not malformed
        if (greeting.length < 20) {
          console.error('âŒ [Greeting] Response too short:', greeting);
          throw new Error(`Malformed greeting (too short): "${greeting}"`);
        }

        if (!greeting.match(/[.!?]$/)) {
          console.warn('âš ï¸  [Greeting] Response missing proper punctuation:', greeting);
          // Add punctuation if missing
          const fixedGreeting = greeting + '.';
          console.log('ðŸ”§ [Greeting] Fixed punctuation:', fixedGreeting);
        }

        // Check for common malformed patterns
        if (/^[a-z]\d+$/i.test(greeting) || greeting.length < 15 || !greeting.includes(' ')) {
          console.error('âŒ [Greeting] Malformed response detected:', greeting);
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
        console.error(`âŒ [Greeting] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          status: error.status,
          code: error.code,
          type: error.type,
          model: config.models.fastModel
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`ðŸ”„ [Greeting] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('âŒ [Greeting] All attempts failed, using fallback');
    console.error('âŒ [Greeting] Last error:', lastError?.message);

    const fallbackGreeting = `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`;

    console.log('âš ï¸  [Greeting] Using fallback greeting:', fallbackGreeting);

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

  // â”€â”€ Response Pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Process candidate response â€” NEW PIPELINE (target: <5s per turn)
   *
   * Step 1: combinedAnalysis()              â€” Nova Lite (~2-3s)
   * Step 2: updateCandidateProfile()        â€” Pure logic (0ms)
   * Step 3: Apply coverage updates          â€” Pure logic (0ms)
   * Step 4: Quality filter + termination    â€” Pure logic (0ms)
   * Step 5: decideQuestionStrategy()        â€” Pure logic (0ms)
   * Step 5.5: selectQuestionStyle()         â€” Pure logic (0ms)
   * Step 6: generateIntelligentQuestion()   â€” Nova Lite (~2-3s)
   * Step 7: Quick dedup (RAG vector)        â€” ~50ms
   * Step 8: Emit + background updates       â€” Immediate
   */
  async processCandidateResponse(sessionId, transcript, audioMetadata = {}) {
    try {
      const pipelineStart = Date.now();
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      console.log('ðŸ§  [Pipeline] Processing candidate response...');

      // Get last interviewer question context
      const recentInterviewerMessages = session.conversation
        .filter(entry => entry.type === 'interviewer')
        .slice(-1);
      const lastQuestion = recentInterviewerMessages[0]?.content || null;
      const targetArea = recentInterviewerMessages[0]?.metadata?.targetAreas?.[0] || null;

      // â”€â”€ STEP 1: Combined Analysis (ONE Nova Lite call, ~2-3s) â”€â”€
      const step1Start = Date.now();
      const isSkipped = transcript === '[SKIPPED]' || audioMetadata?.skipped === true;
      const analysis = isSkipped
        ? { quality: { answeredQuestion: false, completeness: 'avoided', score: 0, depthLevel: 'none' }, topics: [], areasImpacted: [], candidateBehavior: { interactionStyle: 'minimal' } }
        : await this.combinedAnalysis(transcript, session, lastQuestion, targetArea);
      if (!isSkipped) console.log(`âš¡ [Step 1] Combined analysis: ${Date.now() - step1Start}ms â€” quality: ${analysis.quality?.score}/100, depth: ${analysis.quality?.depthLevel}`);

      // â”€â”€ STEP 2: Update Candidate Profile (pure logic, ~0ms) â”€â”€
      const turnNumber = Math.floor((session.conversation?.length || 0) / 2);
      const updatedProfile = this.updateCandidateProfile(
        session.candidateProfile || null,
        analysis,
        turnNumber
      );
      await this.sessionManager.updateSession(sessionId, { candidateProfile: updatedProfile });

      // Store candidate turn with quality evaluation included in metadata
      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'candidate',
        content: transcript,
        timestamp: new Date().toISOString(),
        metadata: {
          ...audioMetadata,
          qualityScore:      analysis.quality?.score            ?? null,
          answeredQuestion:  analysis.quality?.answeredQuestion ?? null,
          completeness:      analysis.quality?.completeness     ?? null,
          depthLevel:        analysis.quality?.depthLevel       ?? null,
          targetArea,
        },
      });

      // â”€â”€ STEP 3: Apply coverage updates from analysis (pure logic, ~0ms) â”€â”€
      let finalCoverage = { ...session.coverage };
      if (analysis.coverage?.areasImpacted?.length > 0) {
        console.log(`ðŸ“Š [Coverage] LLM areasImpacted: ${analysis.coverage.areasImpacted.map(a => `${a.area}(+${a.increase})`).join(', ')} | Session areas: ${Object.keys(finalCoverage.areas).join(', ')} | Quality: ${analysis.quality?.score}`);
        for (const impact of analysis.coverage.areasImpacted) {
          let matchedAreaKey = impact.area;
          if (!finalCoverage.areas[matchedAreaKey]) {
            // Fuzzy match: find closest session area key
            const impactLower = matchedAreaKey.toLowerCase().replace(/[_\s-]/g, '');
            matchedAreaKey = Object.keys(finalCoverage.areas).find(key => {
              const keyLower = key.toLowerCase().replace(/[_\s-]/g, '');
              return keyLower.includes(impactLower) || impactLower.includes(keyLower) ||
                keyLower.split('_').some(w => w.length > 2 && impactLower.includes(w));
            }) || null;
            if (matchedAreaKey) {
              console.log(`ðŸ”„ [Coverage] Fuzzy matched "${impact.area}" â†’ "${matchedAreaKey}"`);
            }
          }
          if (matchedAreaKey && finalCoverage.areas[matchedAreaKey]) {
            const area = finalCoverage.areas[matchedAreaKey];
            let increase = impact.increase || 0;

            // PASS/SKIP HANDLING: Candidate can't answer = gap recorded, NO coverage credit
            const isPassSkip = analysis.quality?.answeredQuestion === false ||
              analysis.quality?.completeness === 'avoided';
            if (isPassSkip && increase === 0) {
              // increase stays 0 â€” no coverage credit for not answering
              console.log(`â­ï¸ [Coverage] Pass/skip detected for "${impact.area}" â€” gap recorded, no coverage credit`);
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `Gap: candidate passed on ${impact.area}`,
                covered: true,
                evidence: ['Candidate could not answer / requested to skip'],
                quality: 0,
                aiGenerated: true,
                reasoning: 'Candidate explicitly passed or could not answer'
              });
            }

            // CODE-LEVEL BOOST: LLM returns conservative values, amplify based on answer quality
            const qualityScore = analysis.quality?.score || 0;
            const depth = analysis.quality?.depthLevel || 'surface';
            if (increase > 0 && !isPassSkip) {
              if (depth === 'deep' && qualityScore >= 70) {
                increase = Math.max(increase, 25);
              } else if (depth === 'moderate' && qualityScore >= 50) {
                increase = Math.max(increase, 18);
              } else if (qualityScore >= 50) {
                increase = Math.max(increase, 12);
              } else if (qualityScore >= 30) {
                increase = Math.max(increase, 8);
              } else if (qualityScore >= 15) {
                increase = Math.max(increase, 3); // minimal credit for weak but on-topic answers
              } else {
                increase = 0; // quality < 15 = no coverage credit (truly garbage / off-topic)
              }
            }

            area.percentage = Math.min(100, (area.percentage || 0) + increase);
            area.lastUpdated = new Date().toISOString();
            if (impact.evidence) {
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `AI-detected: ${impact.area}`,
                covered: true,
                evidence: [impact.evidence],
                quality: Math.min(10, Math.round((analysis.quality?.score || 0) / 10)),
                aiGenerated: true
              });
            }

            // Mark area completed when coverage is sufficient
            if (area.percentage >= 80 && !area.completed) {
              area.completed = true;
              console.log(`âœ… [Coverage] Area "${impact.area}" marked completed at ${area.percentage}%`);
            }

            // Track explored sub-topics to prevent theme repetition
            const topicsFromResponse = (analysis.skills?.demonstrated || [])
              .concat(analysis.interestingTopics?.map(t => t.topic) || []);
            if (topicsFromResponse.length > 0) {
              area.topicsExplored = area.topicsExplored || [];
              for (const topic of topicsFromResponse) {
                if (!area.topicsExplored.includes(topic)) {
                  area.topicsExplored.push(topic);
                }
              }
            }

            // Update JD skills checklist â€” mark covered skills based on demonstrated
            const checklist = session.jdSkillsChecklist || [];
            const demonstratedSkills = analysis.skills?.demonstrated || [];
            for (const item of checklist) {
              if (!item.covered && demonstratedSkills.some(d => {
                const dLower = d.toLowerCase();
                const sLower = item.skill.toLowerCase();
                return dLower.includes(sLower) || sLower.includes(dLower) ||
                  sLower.split(/[\s,/]+/).some(w => w.length > 2 && dLower.includes(w)) ||
                  dLower.split(/[\s,/]+/).some(w => w.length > 2 && sLower.includes(w));
              })) {
                item.covered = true;
              }
            }

            // SCORE BONUS: Reward candidates who cover an area before time budget expires
            if (session.timeBudgetPerAreaMs && area.percentage >= 60 && !area.earlyCompletionBonus) {
              const areaStartTime = area.startTime;
              if (areaStartTime) {
                const elapsed = Date.now() - areaStartTime;
                const timeBudget = session.timeBudgetPerAreaMs;
                if (elapsed < timeBudget) {
                  const timeRemainingRatio = (timeBudget - elapsed) / timeBudget;
                  const bonus = Math.round(timeRemainingRatio * 15);
                  area.percentage = Math.min(100, area.percentage + bonus);
                  area.earlyCompletionBonus = bonus;
                  console.log(`ðŸŽ [Score Bonus] +${bonus}% for "${impact.area}"`);
                }
              }
            }
          } else {
            console.warn(`âš ï¸ [Coverage] Area mismatch (no fuzzy match found): LLM returned "${impact.area}" but session only has [${Object.keys(finalCoverage.areas).join(', ')}]`);
          }
        }

        // Recalculate overall coverage
        const areaEntries = Object.values(finalCoverage.areas);
        const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
        finalCoverage.overall = totalWeight > 0
          ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
          : 0;
        finalCoverage.lastUpdated = new Date().toISOString();

        await this.sessionManager.updateCoverage(sessionId, finalCoverage);
      } else {
        // No areasImpacted from LLM â€” but if it's a pass/skip, still record the gap
        const isPassSkipNoAreas = analysis.quality?.answeredQuestion === false ||
          analysis.quality?.completeness === 'avoided';
        if (isPassSkipNoAreas && targetArea && finalCoverage.areas[targetArea]) {
          const area = finalCoverage.areas[targetArea];
          // No coverage credit for not answering â€” gap recorded only
          area.lastUpdated = new Date().toISOString();
          area.indicators = area.indicators || [];
          area.indicators.push({
            name: `Gap: candidate passed on ${targetArea}`,
            covered: true,
            evidence: ['Candidate could not answer / requested to skip'],
            quality: 0,
            aiGenerated: true,
            reasoning: 'Candidate explicitly passed or could not answer'
          });
          console.log(`â­ï¸ [Coverage] Pass/skip (no areas from LLM) for "${targetArea}" â€” gap recorded, no coverage credit`);

          // Recalculate overall
          const areaEntries = Object.values(finalCoverage.areas);
          const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
          finalCoverage.overall = totalWeight > 0
            ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
            : 0;
          finalCoverage.lastUpdated = new Date().toISOString();
          await this.sessionManager.updateCoverage(sessionId, finalCoverage);
        }
      }

      // Save updated JD skills checklist
      if (session.jdSkillsChecklist?.length > 0) {
        await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: session.jdSkillsChecklist });
      }

      // â”€â”€ STEP 3.5: Compute running score (pure logic, ~0ms) â”€â”€
      const runningScoreData = this.computeRunningScore(session, updatedProfile, finalCoverage, analysis);
      await this.sessionManager.updateSession(sessionId, { runningScoreData });

      // â”€â”€ STEP 4: Quality filter + termination check (pure logic, ~0ms) â”€â”€
      const qualityScore = analysis.quality?.score || 0;
      await this.updateQualityCounters(sessionId, qualityScore);

      // LOW QUALITY FILTER: If off-topic/garbage, generate from gaps only
      const isLowQuality = qualityScore < 30 || (analysis.quality?.completeness === 'avoided' && qualityScore < 50);

      // Check rule-based termination (time, consecutive bad/good, avg quality)
      const updatedSessionForEnd = { ...session, coverage: finalCoverage, qualityTracking: session.qualityTracking };
      const endCheck = await this.shouldEndInterview(updatedSessionForEnd);
      if (endCheck.shouldEnd) {
        console.log(`ðŸ›‘ [Pipeline] Ending interview: ${endCheck.terminationReason}`);
        return {
          action: 'end_interview',
          content: endCheck.message || 'Thank you for your time. This concludes our interview.',
          reasoning: endCheck.reason || endCheck.reasoning,
          metadata: { terminationReason: endCheck.terminationReason, score: endCheck.score }
        };
      }

      // AI-suggested termination from combined analysis (only trusted after 6+ turns)
      const turnCount = Math.floor((session.conversation?.length || 0) / 2);
      if (analysis.shouldEnd?.shouldEnd && turnCount >= 6) {
        console.log(`ðŸ›‘ [Pipeline] AI suggests ending at turn ${turnCount}: ${analysis.shouldEnd.reason}`);
        return {
          action: 'end_interview',
          content: 'Thank you for your time. This concludes our interview.',
          reasoning: analysis.shouldEnd.reason,
          metadata: { terminationReason: 'ai_determined', score: 'ai' }
        };
      } else if (analysis.shouldEnd?.shouldEnd && turnCount < 6) {
        console.log(`âš ï¸ [Pipeline] LLM suggested ending at turn ${turnCount} â€” IGNORED (min 6 turns required)`);
      }

      if (isLowQuality) {
        console.log(`ðŸš« [Pipeline] Low quality (${qualityScore}) â€” generating from gaps only`);
      }

      // â”€â”€ STEP 5: Decide question strategy (pure logic, ~0ms) â”€â”€
      const finalSession = { ...session, coverage: finalCoverage, candidateProfile: updatedProfile, currentFocusArea: targetArea };
      const strategy = this.decideQuestionStrategy(analysis, updatedProfile, finalCoverage, finalSession);
      console.log(`ðŸŽ¯ [Step 5] Strategy: ${strategy.mode} â†’ ${strategy.targetArea} (${strategy.context})`);

      // â”€â”€ STEP 5.5: Select question style (pure logic, ~0ms) â”€â”€
      const questionStyle = this.selectQuestionStyle(finalSession, analysis, strategy);
      console.log(`ðŸŽ¨ [Step 5.5] Style: ${questionStyle.id} | Strategy: ${strategy.mode} â†’ ${strategy.targetArea}`);

      // â”€â”€ STEP 5.7: Retrieve RAG context from JD (async, ~100ms) â”€â”€
      let ragContext = '';
      try {
        const jobId = session.jobDescription?._id || session.config?.jobId;
        if (jobId) {
          const rag = await ragService.retrieveContext(jobId, sessionId, transcript);
          ragContext = rag.jdContext || '';
          if (ragContext) {
            console.log(`ðŸ“š [Step 5.7] RAG context retrieved: ${ragContext.length} chars`);
          }
        }
      } catch (ragErr) {
        console.warn('âš ï¸ [Step 5.7] RAG context retrieval failed (non-blocking):', ragErr.message);
      }
      finalSession.ragContext = ragContext;

      // â”€â”€ STEP 6: Generate question with strategy + style context (Nova Lite, ~2-3s) â”€â”€
      const step6Start = Date.now();

      // Build a lightweight coverage analysis object for question generator
      const coverageForQGen = {
        overallAssessment: {
          weakestAreas: Object.entries(finalCoverage.areas)
            .filter(([_, d]) => d.percentage < 50)
            .sort((a, b) => a[1].percentage - b[1].percentage)
            .map(([a]) => a),
          strongestAreas: Object.entries(finalCoverage.areas)
            .filter(([_, d]) => d.percentage >= 60)
            .map(([a]) => a)
        }
      };

      const proposedQuestion = await AIUtils.withTimeout(
        this.questionAI.generateIntelligentQuestion(
          finalSession,
          coverageForQGen,
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer').slice(-5) },
          strategy,       // Pass strategy for adaptive prompting
          questionStyle   // Pass style for diverse question phrasing
        ),
        15000,
        'generateIntelligentQuestion'
      ).catch(err => {
        console.warn('âš ï¸ Question generation failed, using fallback:', err.message);
        const areaLabel = strategy.targetArea?.replace(/_/g, ' ') || 'your background';
        const fallbackQuestions = {
          bridge: `Can you tell me more about how your experience relates to ${areaLabel}?`,
          probe: `Could you walk me through a specific example related to ${areaLabel}?`,
          transition: `Let's shift gears â€” can you share your experience with ${areaLabel}?`,
          validate: `How would you rate your confidence in ${areaLabel}?`
        };
        return {
          question: fallbackQuestions[strategy.mode] || 'Can you tell me about a challenging project you worked on recently?',
          targetAreas: [strategy.targetArea || 'General'],
          reasoning: 'Fallback question due to AI timeout',
          fallback: true
        };
      });

      console.log(`âš¡ [Step 6] Question generated: ${Date.now() - step6Start}ms`);

      // â”€â”€ STEP 7: Quick dedup via RAG vector search (~50ms) â”€â”€
      let finalQuestion = proposedQuestion;
      try {
        const similarityCheck = await AIUtils.withTimeout(
          this.memoryAI.analyzeQuestionSimilarity(proposedQuestion.question, finalSession.conversation, sessionId),
          8000,
          'analyzeQuestionSimilarity'
        );

        if (similarityCheck.isSimilar && similarityCheck.confidence > 70) {
          console.log('ðŸ”„ [Step 7] Similar question detected â€” regenerating once');
          try {
            const altQuestion = await this.questionAI.generateTargetedQuestionForArea(
              strategy.targetArea,
              finalCoverage.areas[strategy.targetArea] || {},
              finalSession.conversation,
              finalSession.config.context,
              finalSession.config.sessionSettings?.language || 'en'
            );
            finalQuestion = { ...altQuestion, targetAreas: [strategy.targetArea] };
          } catch (altErr) {
            console.warn('âš ï¸ Alt question failed, using original:', altErr.message);
          }
        }
      } catch (simError) {
        console.warn('âš ï¸ Dedup check failed, proceeding:', simError.message);
      }

      // â”€â”€ STEP 8: Store question + background updates â”€â”€
      const questionContent = finalQuestion.question || finalQuestion.content;
      const questionTargetAreas = finalQuestion.targetAreas || [strategy.targetArea];

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: questionContent,
        timestamp: new Date().toISOString(),
        metadata: {
          aiGenerated: true,
          targetAreas: questionTargetAreas,
          reasoning: finalQuestion.reasoning,
          strategy: strategy.mode,
          questionStyle: questionStyle.id,
          ignoredPreviousResponse: isLowQuality
        }
      });

      // Track question style history for rotation (capped at 10)
      const currentStyleHistory = finalSession.questionStyleHistory || [];
      currentStyleHistory.push(questionStyle.id);
      await this.sessionManager.updateSession(sessionId, {
        questionStyleHistory: currentStyleHistory.slice(-10)
      });

      // Track area and question count
      if (strategy.targetArea && finalCoverage.areas[strategy.targetArea]) {
        await this.incrementAreaQuestionCount(sessionId, strategy.targetArea);
        await this.sessionManager.setAreaStartTime(sessionId, strategy.targetArea);
        await this.sessionManager.updateSession(sessionId, { currentFocusArea: strategy.targetArea });
      }

      // Mark JD skills as "asked" based on question content
      const skillChecklist = finalSession.jdSkillsChecklist || [];
      if (skillChecklist.length > 0) {
        const questionLower = questionContent.toLowerCase();
        for (const item of skillChecklist) {
          if (!item.asked) {
            const sLower = item.skill.toLowerCase();
            if (questionLower.includes(sLower) ||
              sLower.split(/[\s,/]+/).some(w => w.length > 2 && questionLower.includes(w))) {
              item.asked = true;
            }
          }
        }
        await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: skillChecklist });
      }

      // Detect complexity for silence handling
      const complexity = await this.detectQuestionComplexity(questionContent);
      await this.sessionManager.saveCurrentQuestion(sessionId, questionContent, complexity);

      // Fire-and-forget: index question in RAG + update report
      ragService.indexAskedQuestion(sessionId, questionContent).catch(err =>
        console.warn('âš ï¸ [RAG] Question indexing failed (non-blocking):', err.message)
      );

      const coverageAnalysisForReport = {
        overallAssessment: coverageForQGen.overallAssessment,
        coverageUpdates: analysis.coverage?.areasImpacted || []
      };
      this.updateRealTimeReportIntelligently(finalSession, transcript, coverageAnalysisForReport, { decision: strategy.mode, targetArea: strategy.targetArea })
        .then(reportUpdate => this.sessionManager.updateRealTimeReport(sessionId, reportUpdate))
        .catch(err => console.warn('âš ï¸ [Report] Background update failed:', err.message));

      const totalTime = Date.now() - pipelineStart;
      console.log(`âœ… [Pipeline] Complete in ${totalTime}ms (target: <5000ms) â€” strategy: ${strategy.mode}, quality: ${qualityScore}/100`);

      return {
        action: strategy.mode === 'validate' ? 'wrap_up_area' : 'continue_probing',
        content: questionContent,
        reasoning: finalQuestion.reasoning,
        targetArea: strategy.targetArea,
        confidence: analysis.quality?.score || 50,
        coverageUpdate: coverageForQGen.overallAssessment,
        metadata: {
          strategy: strategy.mode,
          questionStyle: questionStyle.id,
          pipelineTimeMs: totalTime,
          qualityScore,
          coverageAnalysis: coverageForQGen.overallAssessment,
          timestamp: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('âŒ Failed to process candidate response:', error);
      throw error;
    }
  }

  // â”€â”€ Event Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Handle silence detection - SIMPLIFIED VERSION
   * Only acts on extended silence (15s+) to move to next question
   * NO encouragement messages, NO patience prompts
   */
  async handleSilence(sessionId, silenceDuration) {
    try {
      console.log(`ðŸ”‡ [Silence] Detected ${silenceDuration}s of silence`);

      // IGNORE short pauses - let candidate think naturally
      if (silenceDuration < 20) {
        console.log(`âœ“ [Silence] Ignoring short pause (< 20s)`);
        return {
          action: 'ignore',
          content: null,
          reasoning: 'Short pause - allowing natural thinking time'
        };
      }

      // Extended silence (20s+) - Move to next question automatically
      console.log(`â­ï¸  [Silence] Extended silence (${silenceDuration}s) - generating next question`);

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) {
        throw new Error(`Session ${sessionId} not found`);
      }

      // Perform coverage analysis to determine next question
      const coverageAnalysis = await this.coverageAI.analyzeCoverageIntelligently(
        "[SILENCE - NO RESPONSE]",
        session.coverage,
        session.config.intelligenceContext.focusAreas,
        session.conversation
      );

      // Make decision for next area
      const decisionAnalysis = await this.decisionAI.makeIntelligentDecision(
        session,
        "[EXTENDED SILENCE]",
        { coverage: coverageAnalysis }
      );

      // Generate next question
      const nextQuestion = await this.questionAI.generateIntelligentQuestion(
        session,
        coverageAnalysis,
        { previousQuestions: session.conversation.filter(e => e.type === 'interviewer') }
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

      console.log(`âœ… [Silence] Moving to next question: "${nextQuestion.question.substring(0, 60)}..."`);

      return {
        action: 'next_question',
        content: nextQuestion.question,
        reasoning: `Extended silence (${silenceDuration}s) - automatically moving forward`,
        targetAreas: nextQuestion.targetAreas,
        silenceDuration
      };

    } catch (error) {
      console.error('âŒ [Silence] Failed to handle silence:', error.message);

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

        console.log(`ðŸ”‡ [Silence] Attempt ${attempt}/${maxRetries} - Generating silence prompt...`);

        const response = await bedrock.callLLM({
          systemPrompt: "You are a supportive interviewer. Your task is to generate ONLY the encouraging text - nothing else. Be empathetic and natural.",
          messages: [{ role: "user", content: buildSilenceUser({ config, recentMessages, silenceData }) }],
          temperature: 0.7,
          maxTokens: 300,
          timeout: 30000,
          useFastModel: true
        });

        const silencePrompt = response.content.trim();

        // Log the response for debugging
        console.log('âœ… [Silence] AI response received:', {
          length: silencePrompt.length,
          preview: silencePrompt.substring(0, 80) + (silencePrompt.length > 80 ? '...' : ''),
          silenceCount: silenceData.silenceCount
        });

        // Validate the silence prompt is not malformed
        if (silencePrompt.length < 15) {
          console.error('âŒ [Silence] Response too short:', silencePrompt);
          throw new Error(`Malformed silence prompt (too short): "${silencePrompt}"`);
        }

        // Check for common malformed patterns (like "s1", "safe", etc.)
        if (/^[a-z]+\d*$/i.test(silencePrompt) || !silencePrompt.includes(' ')) {
          console.error('âŒ [Silence] Malformed response detected:', silencePrompt);
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
        console.error(`âŒ [Silence] Attempt ${attempt}/${maxRetries} failed:`, {
          message: error.message,
          silenceCount: silenceData.silenceCount
        });

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          console.log(`ðŸ”„ [Silence] Retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    }

    // All attempts failed - use fallback
    console.error('âŒ [Silence] All attempts failed, using fallback');
    console.error('âŒ [Silence] Last error:', lastError?.message);

    const fallbacks = [
      "Take your time to think about it. I'm here when you're ready to continue.",
      "No rush at all. Would you like me to rephrase the question?",
      "Feel free to take a moment to gather your thoughts. How would you like to approach this?"
    ];

    const fallbackMessage = fallbacks[silenceData.silenceCount % fallbacks.length];
    console.log('âš ï¸  [Silence] Using fallback:', fallbackMessage);

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
      const response = await bedrock.callLLM({
        systemPrompt: DETECT_COMPLEXITY_SYSTEM,
        messages: [{ role: "user", content: `Analyze this question: "${questionText}"` }],
        temperature: 0.2,
        maxTokens: 200,
        timeout: 30000,
        useFastModel: true
      });

      const parsed = AIUtils.parseJSONResponse(response.content, 'detectQuestionComplexity');

      console.log(`ðŸ” [Complexity] Detected:`, {
        complexity: parsed.complexity,
        estimatedThinkingTime: parsed.estimatedThinkingTime
      });

      return parsed.complexity || 'medium';
    } catch (error) {
      console.error('âŒ Error detecting question complexity:', error.message);
      return 'medium'; // Default to medium if detection fails
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

      // Extract Q&A pairs — only AI-generated questions (skips greeting and closing statement)
      const qaConversation = [];
      const conv = session.conversation || [];
      for (let i = 0; i < conv.length; i++) {
        const entry = conv[i];
        if (entry.type === 'interviewer' && entry.content) {
          const next = conv[i + 1];
          if (next?.type === 'candidate') {
            qaConversation.push({
              question:   entry.content,
              response:   next.content,
              targetArea: entry.metadata?.targetAreas?.[0] || null,
              timestamp:  entry.timestamp,
              evaluation: {
                qualityScore:     next.metadata?.qualityScore     ?? null,
                answeredQuestion: next.metadata?.answeredQuestion ?? null,
                completeness:     next.metadata?.completeness     ?? null,
                depthLevel:       next.metadata?.depthLevel       ?? null,
              },
            });
          }
        }
      }

      // End session in Redis
      await this.sessionManager.endSession(sessionId, finalReport);

      return {
        success: true,
        finalReport,
        sessionAnalytics: await this.sessionManager.getSessionAnalytics(sessionId),
        conversation: qaConversation,
      };
    } catch (error) {
      console.error('âŒ Failed to end interview:', error.message);
      throw error;
    }
  }

  async generateFinalReport(session) {
    const persona = session.agentPersona || {};
    const candidateProfile = session.candidateProfile || {};
    const coverage = session.coverage || { overall: 0, areas: {} };
    const conversation = session.conversation || [];
    const runningData = session.runningScoreData;

    const mustHaves = persona.idealCandidate?.mustHaveSkills || [];
    const demonstrated = candidateProfile.revealedExpertise || [];
    const gaps = candidateProfile.revealedGaps || [];
    const commStyle = candidateProfile.communicationStyle || {};

    // ── Required skills audit (deterministic — no LLM) ─────────────────────────
    const mustHavesCovered = mustHaves.filter(s => {
      const sl = s.toLowerCase();
      return demonstrated.some(d => {
        const dl = d.toLowerCase();
        return dl.includes(sl) || sl.includes(dl) ||
          sl.split(/[\s,/]+/).some(w => w.length > 2 && dl.includes(w)) ||
          dl.split(/[\s,/]+/).some(w => w.length > 2 && sl.includes(w));
      });
    });
    const mustHavesMissed = mustHaves.filter(s => !mustHavesCovered.includes(s));

    // ── Session metrics (deterministic) ────────────────────────────────────────
    const totalResponses = conversation.filter(e => e.type === 'candidate').length;
    const questionsPerArea = Object.fromEntries(
      Object.entries(coverage.areas || {}).map(([k, a]) => [k, a.questionsAsked || 0])
    );

    // â”€â”€ 1. Use pre-computed running score (source of truth) â”€â”€
    let finalScore, qualityScore, coverageScore, effectiveSkillsScore, effectiveDepthScore, effectiveCommunicationScore;

    if (runningData?.scores) {
      finalScore = runningData.scores.overall;
      qualityScore = runningData.scores.quality;
      coverageScore = runningData.scores.coverage;
      effectiveSkillsScore = runningData.scores.skills;
      effectiveDepthScore = runningData.scores.depth;
      effectiveCommunicationScore = runningData.scores.communication;
      console.log(`ðŸ“Š [FinalReport] Using running score: overall=${finalScore} (q=${qualityScore} c=${coverageScore} s=${effectiveSkillsScore} d=${effectiveDepthScore} comm=${effectiveCommunicationScore})`);
    } else {
      // Fallback: compute from scratch if no running score exists
      console.warn('âš ï¸ [FinalReport] No running score found, computing from scratch');
      const responseQualities = candidateProfile.responseQualities || [];
      qualityScore = responseQualities.length > 0
        ? Math.round(responseQualities.reduce((a, b) => a + b, 0) / responseQualities.length)
        : 0;
      coverageScore = coverage.overall || 0;
      let skillsScore;
      if (mustHaves.length > 0) {
        const mustHavesCovered = mustHaves.filter(s => {
          const skillLower = s.toLowerCase();
          return demonstrated.some(d => {
            const dLower = d.toLowerCase();
            return dLower.includes(skillLower) || skillLower.includes(dLower) ||
              skillLower.split(/[\s,/]+/).some(word => word.length > 2 && dLower.includes(word)) ||
              dLower.split(/[\s,/]+/).some(word => word.length > 2 && skillLower.includes(word));
          });
        });
        skillsScore = Math.round((mustHavesCovered.length / mustHaves.length) * 100);
      } else {
        skillsScore = 50;
      }
      const depths = conversation
        .filter(e => e.type === 'candidate' && e.metadata?.depthLevel)
        .map(e => e.metadata.depthLevel);
      const depthValues = { deep: 100, moderate: 80, surface: 40 };
      const depthScore = depths.length > 0
        ? Math.round(depths.reduce((sum, d) => sum + (depthValues[d] || 30), 0) / depths.length)
        : 20;
      let communicationScore = 30;
      if (commStyle.confidenceLevel === 'confident') communicationScore += 20;
      else if (commStyle.confidenceLevel === 'moderate') communicationScore += 10;
      if (commStyle.usesExamples) communicationScore += 15;
      if (commStyle.verbosity === 'detailed') communicationScore += 10;
      else if (commStyle.verbosity === 'concise') communicationScore += 5;
      communicationScore = Math.min(100, communicationScore);

      const isNonAnsweringFallback = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;
      effectiveSkillsScore = isNonAnsweringFallback ? 0 : skillsScore;
      effectiveDepthScore = isNonAnsweringFallback ? 0 : depthScore;
      effectiveCommunicationScore = isNonAnsweringFallback ? 0 : communicationScore;
      finalScore = isNonAnsweringFallback
        ? Math.max(0, Math.round((qualityScore * 0.40) + (coverageScore * 0.10)))
        : Math.round((qualityScore * 0.40) + (coverageScore * 0.10) + (skillsScore * 0.25) + (depthScore * 0.15) + (communicationScore * 0.10));
    }

    // â”€â”€ 2. Non-answering detection â”€â”€
    const isNonAnswering = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;

    // â”€â”€ 3. Strengths/weaknesses from running score data (deterministic, not LLM) â”€â”€
    let finalStrengths = runningData?.strengths || [];
    let finalWeaknesses = runningData?.weaknesses || [];

    if (isNonAnswering) {
      finalStrengths = [];
      finalWeaknesses = mustHaves.length > 0
        ? mustHaves.map(s => `Failed to demonstrate knowledge of ${s}`)
        : ['Candidate did not provide substantive answers to interview questions'];
    }

    // â”€â”€ 4. LLM summary only â€” no evaluation, just summarize what happened â”€â”€
    let aiSummary = { summary: '', recommendation: 'maybe', reasoning: '' };
    try {
      const responseQualities = candidateProfile.responseQualities || [];
      const areaScores = Object.entries(coverage.areas || {}).map(([a, d]) =>
        `${a.replace(/_/g, ' ')}: ${d.percentage}% (weight ${d.weight || 0}%, ${d.questionsAsked || 0} questions, ${d.completed ? 'complete' : 'incomplete'})`
      ).join('\n');

      const conversationSummary = conversation
        .slice(-20)
        .map(e => `${e.type === 'interviewer' ? 'Q' : 'A'}: ${e.content.substring(0, 200)}`)
        .join('\n');

      const summaryResponse = await bedrock.callLLM({
        systemPrompt: `You are an expert recruiter writing a structured hiring report for a decision-maker. Summarize the interview and generate the required JSON fields. The scores are already pre-computed — do NOT re-evaluate them. Return ONLY valid JSON with all required fields.`,
        messages: [{ role: "user", content: buildFinalReportUser({
          persona,
          finalScore,
          qualityScore,
          responseQualities,
          coverageScore,
          demonstrated,
          gaps,
          areaScores,
          conversationSummary,
          mustHaveSkills: mustHaves,
          mustHavesCovered,
          mustHavesMissed,
          totalResponses,
        }) }],
        temperature: 0.3,
        maxTokens: 2000,
        timeout: 25000,
        useFastModel: false
      });

      aiSummary = AIUtils.parseJSONResponse(summaryResponse.content, 'generateFinalReport');
    } catch (err) {
      console.warn('âš ï¸ [FinalReport] LLM summary failed:', err.message);
      aiSummary.summary = `Candidate scored ${finalScore}/100 overall. Quality: ${qualityScore}/100, Coverage: ${coverageScore}%.`;
      aiSummary.recommendation = finalScore >= 75 ? 'hire' : finalScore >= 55 ? 'maybe' : 'no_hire';
      aiSummary.reasoning = `Based on composite score of ${finalScore}/100.`;
    }

    if (isNonAnswering) {
      aiSummary.recommendation = 'no_hire';
    }

    return {
      // ── Executive summary & verdict ─────────────────────────────────────────
      summary:           aiSummary.summary,
      recommendation:    aiSummary.recommendation,
      reasoning:         aiSummary.reasoning,

      // ── LLM-generated decision support (distinct from strengths/weaknesses) ─
      keyDecisionFactors: Array.isArray(aiSummary.keyDecisionFactors) ? aiSummary.keyDecisionFactors : [],
      hiringRisks:        Array.isArray(aiSummary.hiringRisks)        ? aiSummary.hiringRisks        : [],
      developmentAreas:   Array.isArray(aiSummary.developmentAreas)   ? aiSummary.developmentAreas   : [],

      // ── Component scores ────────────────────────────────────────────────────
      scores: {
        overall:       finalScore,
        quality:       qualityScore,
        coverage:      coverageScore,
        skills:        effectiveSkillsScore,
        depth:         effectiveDepthScore,
        communication: effectiveCommunicationScore,
      },

      // ── Deterministic strengths/weaknesses (from running score accumulation) ─
      strengths:  finalStrengths,
      weaknesses: finalWeaknesses,

      // ── Required skills audit ───────────────────────────────────────────────
      requiredSkills: {
        all:         mustHaves,
        demonstrated: mustHavesCovered,
        missed:      mustHavesMissed,
      },

      // ── Coverage breakdown ──────────────────────────────────────────────────
      coverage,

      // ── Candidate behavioural profile ───────────────────────────────────────
      candidateProfile: {
        communicationStyle: commStyle,
        revealedExpertise:  demonstrated,
        revealedGaps:       gaps,
        difficultyLevel:    candidateProfile.currentDifficulty || 'intermediate',
      },

      // ── Session metrics ─────────────────────────────────────────────────────
      sessionMetrics: {
        totalResponses,
        questionsPerArea,
      },

      timestamp: new Date().toISOString(),
    };
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

      console.log(`ðŸ“Š Area "${areaName}" now has ${area.questionsAsked} questions asked`);
    } catch (error) {
      console.error('Error incrementing area question count:', error);
    }
  }

  /**
   * Update real-time report with AI intelligence
   */
  async updateRealTimeReportIntelligently(session, candidateResponse, coverageAnalysis, decisionAnalysis) {
    try {
      // Trim inputs to prevent token overflow â†’ truncated JSON output
      const trimmedReport = {
        strengths: (session.realTimeReport?.strengths || []).slice(-5),
        weaknesses: (session.realTimeReport?.weaknesses || []).slice(-5),
        overallProgress: session.realTimeReport?.overallProgress || 0
      };
      const trimmedDecision = {
        decision: decisionAnalysis?.decision,
        reasoning: decisionAnalysis?.reasoning,
        targetArea: decisionAnalysis?.targetArea
      };

      const userPrompt = `CURRENT REPORT:
${JSON.stringify(trimmedReport)}

LATEST RESPONSE: "${candidateResponse.substring(0, 500)}"

COVERAGE ANALYSIS:
${JSON.stringify(coverageAnalysis?.overallAssessment || {})}

DECISION ANALYSIS:
${JSON.stringify(trimmedDecision)}

Update the real-time report with new AI-powered insights.`;

      const response = await bedrock.callLLM({
        systemPrompt: REAL_TIME_REPORT_SYSTEM,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.4,
        maxTokens: 1500,
        timeout: 30000,
        useFastModel: false // gpt-oss â€” strong model for report insights
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

  /**
   * Compute running score deterministically after each candidate response.
   * Pure logic â€” no LLM call (~0ms). Same formula as generateFinalReport().
   */
  computeRunningScore(session, updatedProfile, finalCoverage, analysis) {
    const persona = session.agentPersona || {};
    const conversation = session.conversation || [];
    const existing = session.runningScoreData || { strengths: [], weaknesses: [] };

    // 1. Quality score: average of per-response quality scores
    const responseQualities = updatedProfile.responseQualities || [];
    const qualityScore = responseQualities.length > 0
      ? Math.round(responseQualities.reduce((a, b) => a + b, 0) / responseQualities.length)
      : 0;

    // 2. Coverage score
    const coverageScore = finalCoverage.overall || 0;

    // 3. Skills score: fuzzy match demonstrated vs must-haves
    const mustHaves = persona.idealCandidate?.mustHaveSkills || [];
    const demonstrated = updatedProfile.revealedExpertise || [];
    let skillsScore;
    if (mustHaves.length > 0) {
      const mustHavesCovered = mustHaves.filter(s => {
        const skillLower = s.toLowerCase();
        return demonstrated.some(d => {
          const dLower = d.toLowerCase();
          return dLower.includes(skillLower) || skillLower.includes(dLower) ||
            skillLower.split(/[\s,/]+/).some(word => word.length > 2 && dLower.includes(word)) ||
            dLower.split(/[\s,/]+/).some(word => word.length > 2 && skillLower.includes(word));
        });
      });
      skillsScore = Math.round((mustHavesCovered.length / mustHaves.length) * 100);
    } else {
      skillsScore = 50;
    }

    // 4. Depth score
    const depths = conversation
      .filter(e => e.type === 'candidate' && e.metadata?.depthLevel)
      .map(e => e.metadata.depthLevel);
    const depthValues = { deep: 100, moderate: 80, surface: 40 };
    const depthScore = depths.length > 0
      ? Math.round(depths.reduce((sum, d) => sum + (depthValues[d] || 30), 0) / depths.length)
      : 20;

    // 5. Communication score
    const commStyle = updatedProfile.communicationStyle || {};
    let communicationScore = 30;
    if (commStyle.confidenceLevel === 'confident') communicationScore += 20;
    else if (commStyle.confidenceLevel === 'moderate') communicationScore += 10;
    if (commStyle.usesExamples) communicationScore += 15;
    if (commStyle.verbosity === 'detailed') communicationScore += 10;
    else if (commStyle.verbosity === 'concise') communicationScore += 5;
    communicationScore = Math.min(100, communicationScore);

    // Non-answering detection
    const isNonAnswering = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;
    const effectiveSkills = isNonAnswering ? 0 : skillsScore;
    const effectiveDepth = isNonAnswering ? 0 : depthScore;
    const effectiveComm = isNonAnswering ? 0 : communicationScore;

    // Composite score
    const overall = isNonAnswering
      ? Math.max(0, Math.round((qualityScore * 0.40) + (coverageScore * 0.10)))
      : Math.round(
          (qualityScore * 0.40) +
          (coverageScore * 0.10) +
          (skillsScore * 0.25) +
          (depthScore * 0.15) +
          (communicationScore * 0.10)
        );

    // Accumulate strengths deterministically â€” only when quality backs it up
    const strengths = [...(existing.strengths || [])];
    if ((analysis.quality?.score || 0) >= 60) {
      for (const skill of (analysis.skills?.demonstrated || [])) {
        const entry = `Demonstrated knowledge of ${skill}`;
        if (!strengths.some(s => s.toLowerCase().includes(skill.toLowerCase()))) {
          strengths.push(entry);
        }
      }
    }
    if ((analysis.quality?.score || 0) >= 70 && analysis.quality?.depthLevel === 'deep') {
      const areaName = (analysis.coverage?.areasImpacted?.[0]?.area || '').replace(/_/g, ' ');
      if (areaName && !strengths.some(s => s.toLowerCase().includes(areaName.toLowerCase()))) {
        strengths.push(`Strong depth of knowledge in ${areaName}`);
      }
    }

    // Accumulate weaknesses deterministically
    const weaknesses = [...(existing.weaknesses || [])];
    for (const gap of (analysis.skills?.gaps || [])) {
      const entry = `Gap identified in ${gap}`;
      if (!weaknesses.some(w => w.toLowerCase().includes(gap.toLowerCase()))) {
        weaknesses.push(entry);
      }
    }
    if ((analysis.quality?.score || 0) < 40 || analysis.quality?.completeness === 'avoided') {
      const areaName = (analysis.coverage?.areasImpacted?.[0]?.area || '').replace(/_/g, ' ');
      if (areaName && !weaknesses.some(w => w.toLowerCase().includes(areaName.toLowerCase()))) {
        weaknesses.push(`Needs improvement in ${areaName}`);
      }
    }

    const result = {
      scores: { overall, quality: qualityScore, coverage: coverageScore, skills: effectiveSkills, depth: effectiveDepth, communication: effectiveComm },
      strengths: strengths.slice(0, 10),
      weaknesses: weaknesses.slice(0, 10),
      lastUpdated: new Date().toISOString()
    };

    console.log(`ðŸ“Š [RunningScore] overall=${overall} (q=${qualityScore} c=${coverageScore} s=${effectiveSkills} d=${effectiveDepth} comm=${effectiveComm})${isNonAnswering ? ' NON-ANSWERING' : ''}`);
    return result;
  }

  // REMOVED: shouldDoFullAnalysis â€” every response now gets full AI analysis

  // REMOVED: quickCoverageUpdate â€” every response now gets full AI coverage analysis

  /**
   * Process candidate response â€” always uses full AI analysis.
   * Legacy alias kept for backward compatibility with controller.
   */
  async processCandidateResponseIntelligently(sessionId, transcript, audioMetadata = {}) {
    return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
  }

  /**
   * Handles a candidate speaking too long: analyses coverage, generates next question,
   * stores it in conversation history, and returns it to the controller for emitting.
   */
  async handleLongSpeaking(sessionId) {
    const session = await this.sessionManager.getSession(sessionId);

    const coverageAnalysis = await this.coverageAI.analyzeCoverageIntelligently(
      '[LONG RESPONSE - TIME LIMIT]',
      session.coverage,
      session.config.intelligenceContext.focusAreas,
      session.conversation,
    );

    const nextQuestion = await this.questionAI.generateIntelligentQuestion(
      session,
      coverageAnalysis,
      { previousQuestions: session.conversation.filter(e => e.type === 'interviewer') },
    );

    await this.sessionManager.addConversationEntry(sessionId, {
      type: 'interviewer',
      content: nextQuestion.question,
      timestamp: new Date().toISOString(),
      metadata: { aiGenerated: true, targetAreas: nextQuestion.targetAreas, reasoning: 'Time limit reached' },
    });

    return { question: nextQuestion.question, targetAreas: nextQuestion.targetAreas };
  }

  /** Returns a unified status snapshot for the controller's get_session_status event. */
  async getSessionStatus(sessionId) {
    const [analytics, session] = await Promise.all([
      this.sessionManager.getSessionAnalytics(sessionId),
      this.sessionManager.getSession(sessionId),
    ]);
    return {
      status: session?.status || 'unknown',
      analytics,
      coverage: session?.coverage,
      realTimeReport: session?.realTimeReport,
    };
  }

  /**
   * Handles cleanup when a socket disconnects.
   * Returns { wasActive, result } â€” result is only present when wasActive is true.
   * Throws if the auto-end call fails (caller decides how to handle it).
   */
  async handleDisconnect(sessionId, reason) {
    const session = await this.sessionManager.getSession(sessionId);
    if (session?.status !== 'active') return { wasActive: false };

    try {
      const result = await this.endInterview(sessionId);
      return { wasActive: true, result };
    } catch (endErr) {
      await this.sessionManager.updateSession(sessionId, {
        status: 'interrupted',
        disconnectReason: reason,
        disconnectTime: new Date().toISOString(),
      }).catch(() => {});
      throw endErr;
    }
  }
}

module.exports = new IntelligentInterviewService();
