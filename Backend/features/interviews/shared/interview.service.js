/**
 * Intelligent Interview Service
 * Thin orchestrator â€” delegates to focused sub-modules:
 *   interviewAnalysis.js     â€” pure analysis helpers (no LLM for pure fns, LLM for analysis)
 *   interviewTermination.js  â€” termination logic
 *   interviewSetup.js        â€” persona, greeting, report generation
 */
'use strict';

const ragService       = require('./rag.service');
const configManager    = require('./config-manager');
const redisSessionManager = require('./redis-session-manager');
const Post             = require('../../posts/post.model');

// AI sub-modules
const AIUtils            = require('./ai/ai.utils');
const MemoryAI           = require('./ai/memory.ai');
const CoverageAnalysisAI = require('./ai/coverage-analysis.ai');
const QuestionGeneratorAI = require('./ai/question-generator.ai');
const DecisionEngineAI   = require('./ai/decision-engine.ai');

// Focused sub-modules
const {
  combinedAnalysis,
  updateCandidateProfile,
  decideQuestionStrategy,
  selectQuestionStyle,
  computeRunningScore,
  detectQuestionComplexity,
  updateRealTimeReportIntelligently,
} = require('./interview.analysis');

const { updateQualityCounters, shouldEndInterview } = require('./interview.termination');

const { cleanupTranscript } = require('./helpers/transcript-cleanup');

const {
  buildAgentPersona,
  generateIntelligentGreeting,
  generateSilencePrompt,
  generateFinalReport,
  incrementAreaQuestionCount,
} = require('./interview.setup');

require('dotenv').config();


class IntelligentInterviewService {
  constructor() {
    this.sessionManager = redisSessionManager;
    this.memoryAI    = new MemoryAI();
    this.coverageAI  = new CoverageAnalysisAI();
    this.questionAI  = new QuestionGeneratorAI();
    this.decisionAI  = new DecisionEngineAI();
  }

  // â”€â”€ Service Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async initialize() {
    try {

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
        try {
          const pingTest = await this.sessionManager.client.ping();
        } catch (pingError) {
          console.error('âŒ [Service] Redis ping test failed:', pingError.message);
        }
      } 

      return true;
    } catch (error) {
      console.error('âŒ [Service] Failed to initialize Intelligent Interview Service:', error.message);
      return true; // Don't block server startup
    }
  }

  // â”€â”€ Interview Lifecycle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async startInterview(sessionId, userConfig, candidateId, onGreetingChunk = null) {
    try {


      if (!this.sessionManager.isConnected || !this.sessionManager.client) {
        throw new Error('Redis connection not available. Please ensure Redis is running.');
      }

      const config = configManager.createIntelligentConfig(userConfig);
      configManager.validateConfig(config);

      const session = await this.sessionManager.createSession(sessionId, config, candidateId);

      // Fetch full job description from Post model
      let jobDescription = null;
      try {
        const jobId = userConfig.context?.jobId || userConfig.jobId;
        if (jobId) {
          const post = await Post.findById(jobId)
            .populate({ path: 'user', populate: { path: 'profile', select: 'companyDetails' } });
          if (post?.jobDetails) {
            const companyName = post.user?.profile?.companyDetails?.name || config.context.targetCompany || 'the company';
            jobDescription = {
              title:            post.jobDetails?.title || config.context.targetRole,
              companyName,
              description:      post.jobDetails.description,
              requirements:     post.jobDetails.requirements || [],
              responsibilities: post.jobDetails.responsibilities || [],
              skills:           (post.skillAnalysis?.requiredSkills || []).map(s => s.name).filter(Boolean),
            };
            config.context.targetCompany = companyName;
            ragService.indexJobDescription(jobId, jobDescription).catch(err =>
              console.warn('âš ï¸ [RAG] JD indexing failed (non-blocking):', err.message)
            );
          }
        }
      } catch (jdError) {
        console.warn('âš ï¸ [Service] Failed to load JD from DB:', jdError.message);
      }

      if (!jobDescription && userConfig.context?.jobDescription) {
        jobDescription = {
          title:            userConfig.context.targetRole || 'Position',
          companyName:      userConfig.context.targetCompany || 'the company',
          description:      userConfig.context.jobDescription,
          requirements:     Array.isArray(userConfig.context.requirements)     ? userConfig.context.requirements     : [],
          responsibilities: Array.isArray(userConfig.context.responsibilities) ? userConfig.context.responsibilities : [],
        };
      }

      // Build agent persona (ONE LLM call â€” sets evaluation framework + ideal candidate)
      let agentPersona = null;
      if (jobDescription) {
        try {
          agentPersona = await buildAgentPersona(jobDescription, config);
          await this.sessionManager.updateSession(sessionId, { agentPersona });

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
            lastUpdated: new Date().toISOString(),
          });

          const syncedFocusAreas = Object.entries(agentPersona.evaluationFramework.focusAreas).map(
            ([area, cfg]) => ({ area, weight: (cfg.weight || 25) / 100, indicators: cfg.indicators || [], depth: cfg.description || '' })
          );
          config.intelligenceContext.focusAreas = syncedFocusAreas;
          await this.sessionManager.updateSession(sessionId, { config });

          const jdSkillsChecklist = [
            ...(agentPersona.idealCandidate?.mustHaveSkills  || []),
            ...(agentPersona.idealCandidate?.niceToHaveSkills || []),
          ].map(skill => ({ skill, asked: false, covered: false }));
          await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist });
        } catch (personaError) {
          console.warn('âš ï¸ [Service] Persona building failed (non-blocking):', personaError.message);
        }
      } else if (config.intelligenceContext?.focusAreas?.length > 0) {
        // Skill interviews have no job description, so no persona is built above
        // -- but config-manager already derived real, skill-specific focus areas
        // (with concrete indicators) from the pipeline config in
        // buildPipelineIntelligenceContext. Without this, session.coverage.areas
        // stayed empty for every skill interview and the question generator had
        // nothing but the bare skill name to work from, producing generic questions.
        const frameworkAreas = {};
        for (const fa of config.intelligenceContext.focusAreas) {
          frameworkAreas[fa.area] = {
            percentage: 0,
            weight: Math.round((fa.weight || 0) * 100),
            questionsAsked: 0,
            completed: false,
            indicators: fa.indicators || [],
            description: fa.depth || '',
          };
        }
        await this.sessionManager.updateCoverage(sessionId, {
          overall: 0,
          areas: frameworkAreas,
          completedAreas: [],
          lastUpdated: new Date().toISOString(),
        });
      }

      await this.sessionManager.updateSession(sessionId, {
        candidateProfile: {
          communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
          revealedExpertise: [], revealedGaps: [], mentionedProjects: [], anchors: [],
          currentDifficulty: 'intermediate', responseQualities: [],
        },
      });

      const updatedSessionForTiming = await this.sessionManager.getSession(sessionId);
      const coverageAreas           = Object.keys(updatedSessionForTiming.coverage?.areas || {});
      const totalMinutes            = config.sessionSettings?.duration || 30;
      const maxDurationMinutes      = Math.ceil(totalMinutes * 1.5);
      const timeBudgetPerAreaMs     = coverageAreas.length > 0
        ? (totalMinutes * 60 * 1000) / coverageAreas.length
        : totalMinutes * 60 * 1000;

      await this.sessionManager.updateSession(sessionId, {
        interviewStartTime: Date.now(),
        targetDurationMinutes: totalMinutes,
        maxDurationMinutes,
        timeBudgetPerAreaMs,
        coverageAreaCount: coverageAreas.length,
        jobDescription,
        qualityTracking: {
          consecutiveBadAnswers: 0, consecutiveGoodAnswers: 0,
          totalBadAnswers: 0, totalGoodAnswers: 0, lastQualityScore: null,
        },
      });

      let greeting;
      try {
        greeting = await generateIntelligentGreeting(config, onGreetingChunk, agentPersona);
      } catch (greetingError) {
        console.error('âš ï¸ AI greeting failed, using fallback:', greetingError.message);
        greeting = {
          content: `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`,
          metadata: { fallback: true, error: greetingError.message },
        };
      }

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: greeting.content,
        model: config.models.fastModel,
        metadata: greeting.metadata,
      });
      await this.sessionManager.saveCurrentQuestion(sessionId, greeting.content, 'simple');
      await this.sessionManager.updateSession(sessionId, { status: 'active' });


      return {
        success: true,
        sessionId,
        greeting: greeting.content,
        config: {
          interviewType: config.interviewType,
          duration: config.sessionSettings.duration,
          silenceTimeout: config.sessionSettings.silenceTimeout,
        },
        jobDetails: jobDescription ? {
          title: jobDescription.title,
          companyName: jobDescription.companyName,
          description: jobDescription.description,
          requirements: jobDescription.requirements,
          responsibilities: jobDescription.responsibilities,
        } : null,
        targetRole:    config.context.targetRole,
        targetCompany: config.context.targetCompany,
      };
    } catch (error) {
      console.error('âŒ [Service] CRITICAL: Failed to start interview:', error.message);
      throw error;
    }
  }

  // â”€â”€ Response Pipeline â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Process candidate response â€” NEW PIPELINE (target: <5s per turn)
   *
   * Step 1: combinedAnalysis()            â€” Nova Lite (~2-3s)
   * Step 2: updateCandidateProfile()      â€” Pure logic (0ms)
   * Step 3: Apply coverage updates        â€” Pure logic (0ms)
   * Step 4: Quality filter + termination  â€” Pure logic (0ms)
   * Step 5: decideQuestionStrategy()      â€” Pure logic (0ms)
   * Step 5.5: selectQuestionStyle()       â€” Pure logic (0ms)
   * Step 6: generateIntelligentQuestion() â€” Nova Lite (~2-3s)
   * Step 7: Quick dedup (RAG vector)      â€” ~50ms
   * Step 8: Emit + background updates     â€” Immediate
   */
  async processCandidateResponse(sessionId, transcript, audioMetadata = {}) {
    try {
      const pipelineStart = Date.now();
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);


      const recentInterviewerMessages = session.conversation.filter(entry => entry.type === 'interviewer').slice(-1);
      const lastQuestion = recentInterviewerMessages[0]?.content || null;
      const targetArea   = recentInterviewerMessages[0]?.metadata?.targetAreas?.[0] || null;

      // Cleanup transcript for accent-driven STT errors before analysis.
      // Non-blocking: falls back to raw transcript on timeout / paraphrase / error.
      const isSkippedMarker = transcript === '[SKIPPED]' || audioMetadata?.skipped === true;
      transcript = isSkippedMarker
        ? transcript
        : await cleanupTranscript(transcript, { session, lastQuestion });

      // â”€â”€ GREETING RESPONSE SHORTCUT â”€â”€
      // If the candidate has no previous responses this is a reply to the greeting.
      // Skip analysis and coverage updates â€” go straight to first real question.
      const previousCandidateResponses = session.conversation.filter(e => e.type === 'candidate').length;
      const isGreetingResponse = previousCandidateResponses === 0;

      if (isGreetingResponse) {
        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'candidate',
          content: transcript,
          timestamp: new Date().toISOString(),
          metadata: { ...audioMetadata, isGreetingResponse: true },
        });

        const coverageForQGen = {
          overallAssessment: {
            weakestAreas:   Object.keys(session.coverage?.areas || {}),
            strongestAreas: [],
          },
        };

        const firstQuestion = await AIUtils.withTimeout(
          this.questionAI.generateIntelligentQuestion(
            session,
            coverageForQGen,
            { previousQuestions: [] },
            null,
            null
          ),
          15000,
          'generateIntelligentQuestion-greeting'
        ).catch(() => ({
          question: `Tell me about your experience with ${session.config.context?.targetRole || 'this role'}.`,
          targetAreas: [Object.keys(session.coverage?.areas || {})[0] || 'General'],
          reasoning: 'Fallback first question',
        }));

        const questionContent     = firstQuestion.question || firstQuestion.content;
        const questionTargetAreas = firstQuestion.targetAreas || [];

        await this.sessionManager.addConversationEntry(sessionId, {
          type: 'interviewer',
          content: questionContent,
          timestamp: new Date().toISOString(),
          metadata: { aiGenerated: true, targetAreas: questionTargetAreas, reasoning: firstQuestion.reasoning, strategy: 'transition', questionStyle: 'direct' },
        });

        if (questionTargetAreas[0] && session.coverage?.areas?.[questionTargetAreas[0]]) {
          await incrementAreaQuestionCount(this.sessionManager, sessionId, questionTargetAreas[0]);
          await this.sessionManager.setAreaStartTime(sessionId, questionTargetAreas[0]);
          await this.sessionManager.updateSession(sessionId, { currentFocusArea: questionTargetAreas[0] });
        }

        const complexity = await detectQuestionComplexity(questionContent);
        await this.sessionManager.saveCurrentQuestion(sessionId, questionContent, complexity);

        return {
          action:    'continue_probing',
          content:   questionContent,
          reasoning: firstQuestion.reasoning,
          targetArea: questionTargetAreas[0],
          confidence: 50,
          metadata: { strategy: 'transition', questionStyle: 'direct', pipelineTimeMs: Date.now() - pipelineStart },
        };
      }

      // â”€â”€ STEP 1: Combined Analysis â”€â”€
      const step1Start = Date.now();
      const isSkipped  = transcript === '[SKIPPED]' || audioMetadata?.skipped === true;
      const analysis   = isSkipped
        ? { quality: { answeredQuestion: false, completeness: 'avoided', score: 0, depthLevel: 'none' }, topics: [], areasImpacted: [], candidateBehavior: { interactionStyle: 'minimal' } }
        : await combinedAnalysis(transcript, session, lastQuestion, targetArea);

      // â”€â”€ STEP 2: Update Candidate Profile â”€â”€
      const turnNumber    = Math.floor((session.conversation?.length || 0) / 2);
      const updatedProfile = updateCandidateProfile(session.candidateProfile || null, analysis, turnNumber);
      await this.sessionManager.updateSession(sessionId, { candidateProfile: updatedProfile });

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'candidate',
        content: transcript,
        timestamp: new Date().toISOString(),
        metadata: {
          ...audioMetadata,
          qualityScore:     analysis.quality?.score            ?? null,
          answeredQuestion: analysis.quality?.answeredQuestion ?? null,
          completeness:     analysis.quality?.completeness     ?? null,
          depthLevel:       analysis.quality?.depthLevel       ?? null,
          targetArea,
        },
      });

      // â”€â”€ STEP 3: Apply coverage updates â”€â”€
      let finalCoverage = { ...session.coverage };
      if (analysis.coverage?.areasImpacted?.length > 0) {
        for (const impact of analysis.coverage.areasImpacted) {
          let matchedAreaKey = impact.area;
          if (!finalCoverage.areas[matchedAreaKey]) {
            const impactLower = matchedAreaKey.toLowerCase().replace(/[_\s-]/g, '');
            matchedAreaKey = Object.keys(finalCoverage.areas).find(key => {
              const keyLower = key.toLowerCase().replace(/[_\s-]/g, '');
              return keyLower.includes(impactLower) || impactLower.includes(keyLower) ||
                keyLower.split('_').some(w => w.length > 2 && impactLower.includes(w));
            }) || null;
          }

          if (matchedAreaKey && finalCoverage.areas[matchedAreaKey]) {
            const area = finalCoverage.areas[matchedAreaKey];
            let increase = impact.increase || 0;

            const isPassSkip = analysis.quality?.answeredQuestion === false || analysis.quality?.completeness === 'avoided';
            if (isPassSkip && increase === 0) {
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `Gap: candidate passed on ${impact.area}`,
                covered: true,
                evidence: ['Candidate could not answer / requested to skip'],
                quality: 0, aiGenerated: true,
                reasoning: 'Candidate explicitly passed or could not answer',
              });
              const lastInterviewerQ = session.conversation.filter(e => e.type === 'interviewer').slice(-1)[0]?.content || null;
              if (lastInterviewerQ) {
                area.skippedQuestions = area.skippedQuestions || [];
                area.skippedQuestions.push(lastInterviewerQ);
                area.skipCount = (area.skipCount || 0) + 1;
              }
            }

            // CODE-LEVEL BOOST
            const qualityScore = analysis.quality?.score || 0;
            const depth        = analysis.quality?.depthLevel || 'surface';
            if (increase > 0 && !isPassSkip) {
              if (depth === 'deep' && qualityScore >= 70)          increase = Math.max(increase, 25);
              else if (depth === 'moderate' && qualityScore >= 50) increase = Math.max(increase, 18);
              else if (qualityScore >= 50)                         increase = Math.max(increase, 12);
              else if (qualityScore >= 30)                         increase = Math.max(increase, 8);
              else if (qualityScore >= 15)                         increase = Math.max(increase, 3);
              else                                                 increase = 0;
            }

            area.percentage  = Math.min(100, (area.percentage || 0) + increase);
            area.lastUpdated = new Date().toISOString();
            if (impact.evidence) {
              area.indicators = area.indicators || [];
              area.indicators.push({
                name: `AI-detected: ${impact.area}`,
                covered: true,
                evidence: [impact.evidence],
                quality: Math.min(10, Math.round((analysis.quality?.score || 0) / 10)),
                aiGenerated: true,
              });
            }

            if (area.percentage >= 80 && !area.completed) {
              area.completed = true;
            }

            const topicsFromResponse = (analysis.skills?.demonstrated || [])
              .concat(analysis.interestingTopics?.map(t => t.topic) || []);
            if (topicsFromResponse.length > 0) {
              area.topicsExplored = area.topicsExplored || [];
              for (const topic of topicsFromResponse) {
                if (!area.topicsExplored.includes(topic)) area.topicsExplored.push(topic);
              }
            }

            // Update JD skills checklist
            const checklist        = session.jdSkillsChecklist || [];
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

            // Early completion score bonus
            if (session.timeBudgetPerAreaMs && area.percentage >= 60 && !area.earlyCompletionBonus) {
              const areaStartTime = area.startTime;
              if (areaStartTime) {
                const elapsed   = Date.now() - areaStartTime;
                const timeBudget = session.timeBudgetPerAreaMs;
                if (elapsed < timeBudget) {
                  const bonus = Math.round(((timeBudget - elapsed) / timeBudget) * 15);
                  area.percentage = Math.min(100, area.percentage + bonus);
                  area.earlyCompletionBonus = bonus;
                }
              }
            }
          } else {
            console.warn(`âš ï¸ [Coverage] Area mismatch: LLM returned "${impact.area}" but session has [${Object.keys(finalCoverage.areas).join(', ')}]`);
          }
        }

        const areaEntries = Object.values(finalCoverage.areas);
        const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
        finalCoverage.overall = totalWeight > 0
          ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
          : 0;
        finalCoverage.lastUpdated = new Date().toISOString();
        await this.sessionManager.updateCoverage(sessionId, finalCoverage);
      } else {
        // No areasImpacted â€” still record pass/skip gap
        const isPassSkipNoAreas = analysis.quality?.answeredQuestion === false || analysis.quality?.completeness === 'avoided';
        if (isPassSkipNoAreas && targetArea && finalCoverage.areas[targetArea]) {
          const area = finalCoverage.areas[targetArea];
          area.lastUpdated = new Date().toISOString();
          area.indicators  = area.indicators || [];
          area.indicators.push({
            name: `Gap: candidate passed on ${targetArea}`,
            covered: true,
            evidence: ['Candidate could not answer / requested to skip'],
            quality: 0, aiGenerated: true,
            reasoning: 'Candidate explicitly passed or could not answer',
          });
          const lastInterviewerQ = session.conversation.filter(e => e.type === 'interviewer').slice(-1)[0]?.content || null;
          if (lastInterviewerQ) {
            finalCoverage.areas[targetArea].skippedQuestions = finalCoverage.areas[targetArea].skippedQuestions || [];
            finalCoverage.areas[targetArea].skippedQuestions.push(lastInterviewerQ);
            finalCoverage.areas[targetArea].skipCount = (finalCoverage.areas[targetArea].skipCount || 0) + 1;
          }

          const areaEntries = Object.values(finalCoverage.areas);
          const totalWeight = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
          finalCoverage.overall = totalWeight > 0
            ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
            : 0;
          finalCoverage.lastUpdated = new Date().toISOString();
          await this.sessionManager.updateCoverage(sessionId, finalCoverage);
        }
      }

      if (session.jdSkillsChecklist?.length > 0) {
        await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: session.jdSkillsChecklist });
      }

      // â”€â”€ STEP 3.5: Knowledge gap disqualification â”€â”€
      // Permanently marks an area or sub-topic as off-limits when the candidate
      // explicitly states zero knowledge ("I don't know X" / "I never worked with X").
      const knowledgeGap = analysis.knowledgeGap;
      if (knowledgeGap?.type && knowledgeGap.type !== 'none') {
        if (knowledgeGap.type === 'full_area' && knowledgeGap.areaName) {
          let disqualifiedKey = knowledgeGap.areaName;
          if (!finalCoverage.areas[disqualifiedKey]) {
            const gapNorm = disqualifiedKey.toLowerCase().replace(/[_\s-]/g, '');
            disqualifiedKey = Object.keys(finalCoverage.areas).find(key => {
              const keyNorm = key.toLowerCase().replace(/[_\s-]/g, '');
              return keyNorm.includes(gapNorm) || gapNorm.includes(keyNorm) ||
                keyNorm.split('_').some(w => w.length > 2 && gapNorm.includes(w));
            }) || null;
          }
          if (disqualifiedKey && !finalCoverage.areas[disqualifiedKey]?.disqualified) {
            const area                      = finalCoverage.areas[disqualifiedKey];
            area.disqualified               = true;
            area.percentage                 = 0;
            area.disqualificationReason     = knowledgeGap.triggerPhrase || 'Candidate stated no experience';
            area.lastUpdated                = new Date().toISOString();
            const areaEntries               = Object.values(finalCoverage.areas);
            const totalWeight               = areaEntries.reduce((sum, a) => sum + (a.weight || 25), 0);
            finalCoverage.overall           = totalWeight > 0
              ? Math.round(areaEntries.reduce((sum, a) => sum + ((a.percentage / 100) * (a.weight || 25)), 0) / totalWeight * 100)
              : 0;
            await this.sessionManager.updateCoverage(sessionId, finalCoverage);
            // Mark all checklist skills that match this area as asked so they
            // are removed from "JD SKILLS NOT YET ASKED ABOUT" in the prompt.
            const keyNorm = disqualifiedKey.toLowerCase().replace(/[_\s-]/g, '');
            const checklist = session.jdSkillsChecklist || [];
            for (const item of checklist) {
              const skillNorm = item.skill.toLowerCase().replace(/[_\s-]/g, '');
              if (skillNorm.includes(keyNorm) || keyNorm.includes(skillNorm)) {
                item.asked = true;
              }
            }
            if (checklist.length > 0) await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: checklist });
          }
        } else if (knowledgeGap.type === 'subtopic' && knowledgeGap.subtopicName) {
          let areaKey = knowledgeGap.areaName;
          if (!areaKey || !finalCoverage.areas[areaKey]) {
            const gapNorm = (areaKey || '').toLowerCase().replace(/[_\s-]/g, '');
            areaKey = gapNorm
              ? Object.keys(finalCoverage.areas).find(k => {
                  const kNorm = k.toLowerCase().replace(/[_\s-]/g, '');
                  return kNorm.includes(gapNorm) || gapNorm.includes(kNorm);
                })
              : null;
            areaKey = areaKey || targetArea;
          }
          if (areaKey && finalCoverage.areas[areaKey]) {
            const area                      = finalCoverage.areas[areaKey];
            area.disqualifiedSubtopics      = area.disqualifiedSubtopics || [];
            if (!area.disqualifiedSubtopics.includes(knowledgeGap.subtopicName)) {
              area.disqualifiedSubtopics.push(knowledgeGap.subtopicName);
              await this.sessionManager.updateCoverage(sessionId, finalCoverage);
              // Mark the specific skill in the checklist as asked so the question
              // generator stops prioritising it as an uncovered JD skill.
              const stNorm    = knowledgeGap.subtopicName.toLowerCase().replace(/[_\s-]/g, '');
              const checklist = session.jdSkillsChecklist || [];
              for (const item of checklist) {
                const skillNorm = item.skill.toLowerCase().replace(/[_\s-]/g, '');
                if (skillNorm.includes(stNorm) || stNorm.includes(skillNorm)) {
                  item.asked = true;
                }
              }
              if (checklist.length > 0) await this.sessionManager.updateSession(sessionId, { jdSkillsChecklist: checklist });
            }
          }
        }
      }

      // â”€â”€ STEP 3.6: Compute running score â”€â”€
      const runningScoreData = computeRunningScore(session, updatedProfile, finalCoverage, analysis);
      await this.sessionManager.updateSession(sessionId, { runningScoreData });

      // â”€â”€ STEP 4: Quality filter + termination check â”€â”€
      const qualityScore = analysis.quality?.score || 0;
      await updateQualityCounters(this.sessionManager, sessionId, qualityScore);

      const isLowQuality      = qualityScore < 30 || (analysis.quality?.completeness === 'avoided' && qualityScore < 50);
      const updatedSessionForEnd = { ...session, coverage: finalCoverage, qualityTracking: session.qualityTracking };
      const endCheck             = await shouldEndInterview(updatedSessionForEnd);
      if (endCheck.shouldEnd) {
        return {
          action:   'end_interview',
          content:  endCheck.message || 'Thank you for your time. This concludes our interview.',
          reasoning: endCheck.reason || endCheck.reasoning,
          metadata: { terminationReason: endCheck.terminationReason, score: endCheck.score },
        };
      }

      const turnCount = Math.floor((session.conversation?.length || 0) / 2);
      if (analysis.shouldEnd?.shouldEnd && turnCount >= 6) {
        return {
          action:   'end_interview',
          content:  'Thank you for your time. This concludes our interview.',
          reasoning: analysis.shouldEnd.reason,
          metadata: { terminationReason: 'ai_determined', score: 'ai' },
        };
      } 


      // â”€â”€ STEP 5: Decide question strategy â”€â”€
      const finalSession = { ...session, coverage: finalCoverage, candidateProfile: updatedProfile, currentFocusArea: targetArea };
      const strategy     = decideQuestionStrategy(analysis, updatedProfile, finalCoverage, finalSession);

      // â”€â”€ STEP 5.5: Select question style â”€â”€
      const questionStyle = selectQuestionStyle(finalSession, analysis, strategy);

      // â”€â”€ STEP 5.7: Retrieve RAG context (~100ms) â”€â”€
      let ragContext = '';
      try {
        const jobId = session.jobDescription?._id || session.config?.jobId;
        if (jobId) {
          const rag = await ragService.retrieveContext(jobId, sessionId, transcript);
          ragContext = rag.jdContext || '';
        }
      } catch (ragErr) {
        console.warn('âš ï¸ [Step 5.7] RAG context retrieval failed (non-blocking):', ragErr.message);
      }
      finalSession.ragContext = ragContext;

      // â”€â”€ STEP 6: Generate question â”€â”€
      const step6Start = Date.now();
      const coverageForQGen = {
        overallAssessment: {
          weakestAreas:   Object.entries(finalCoverage.areas).filter(([_, d]) => d.percentage < 50).sort((a, b) => a[1].percentage - b[1].percentage).map(([a]) => a),
          strongestAreas: Object.entries(finalCoverage.areas).filter(([_, d]) => d.percentage >= 60).map(([a]) => a),
        },
      };

      const proposedQuestion = await AIUtils.withTimeout(
        this.questionAI.generateIntelligentQuestion(
          finalSession,
          coverageForQGen,
          { previousQuestions: finalSession.conversation.filter(e => e.type === 'interviewer').slice(-5) },
          strategy,
          questionStyle
        ),
        15000,
        'generateIntelligentQuestion'
      ).catch(err => {
        console.warn('âš ï¸ Question generation failed, using fallback:', err.message);
        const areaLabel = strategy.targetArea?.replace(/_/g, ' ') || 'your background';
        const fallbackQuestions = {
          bridge:     `Can you tell me more about how your experience relates to ${areaLabel}?`,
          probe:      `Could you walk me through a specific example related to ${areaLabel}?`,
          transition: `Let's shift gears â€” can you share your experience with ${areaLabel}?`,
          validate:   `How would you rate your confidence in ${areaLabel}?`,
        };
        return {
          question:    fallbackQuestions[strategy.mode] || 'Can you tell me about a challenging project you worked on recently?',
          targetAreas: [strategy.targetArea || 'General'],
          reasoning:   'Fallback question due to AI timeout',
          fallback:    true,
        };
      });


      // â”€â”€ STEP 7: Quick dedup via RAG vector search (~50ms) â”€â”€
      let finalQuestion = proposedQuestion;
      try {
        const similarityCheck = await AIUtils.withTimeout(
          this.memoryAI.analyzeQuestionSimilarity(proposedQuestion.question, finalSession.conversation, sessionId),
          8000,
          'analyzeQuestionSimilarity'
        );
        if (similarityCheck.isSimilar && similarityCheck.confidence > 70) {
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
      const questionContent    = finalQuestion.question || finalQuestion.content;
      const questionTargetAreas = finalQuestion.targetAreas || [strategy.targetArea];

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: questionContent,
        timestamp: new Date().toISOString(),
        metadata: {
          aiGenerated: true,
          targetAreas: questionTargetAreas,
          reasoning:   finalQuestion.reasoning,
          strategy:    strategy.mode,
          questionStyle: questionStyle.id,
          ignoredPreviousResponse: isLowQuality,
        },
      });

      const currentStyleHistory = finalSession.questionStyleHistory || [];
      currentStyleHistory.push(questionStyle.id);
      await this.sessionManager.updateSession(sessionId, { questionStyleHistory: currentStyleHistory.slice(-10) });

      if (strategy.targetArea && finalCoverage.areas[strategy.targetArea]) {
        await incrementAreaQuestionCount(this.sessionManager, sessionId, strategy.targetArea);
        await this.sessionManager.setAreaStartTime(sessionId, strategy.targetArea);
        await this.sessionManager.updateSession(sessionId, { currentFocusArea: strategy.targetArea });
      }

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

      const complexity = await detectQuestionComplexity(questionContent);
      await this.sessionManager.saveCurrentQuestion(sessionId, questionContent, complexity);

      ragService.indexAskedQuestion(sessionId, questionContent).catch(err =>
        console.warn('âš ï¸ [RAG] Question indexing failed (non-blocking):', err.message)
      );

      const coverageAnalysisForReport = {
        overallAssessment: coverageForQGen.overallAssessment,
        coverageUpdates:   analysis.coverage?.areasImpacted || [],
      };
      updateRealTimeReportIntelligently(finalSession, transcript, coverageAnalysisForReport, { decision: strategy.mode, targetArea: strategy.targetArea })
        .then(reportUpdate => this.sessionManager.updateRealTimeReport(sessionId, reportUpdate))
        .catch(err => console.warn('âš ï¸ [Report] Background update failed:', err.message));

      const totalTime = Date.now() - pipelineStart;

      return {
        action:   strategy.mode === 'validate' ? 'wrap_up_area' : 'continue_probing',
        content:  questionContent,
        reasoning: finalQuestion.reasoning,
        targetArea: strategy.targetArea,
        confidence: analysis.quality?.score || 50,
        coverageUpdate: coverageForQGen.overallAssessment,
        metadata: {
          strategy:      strategy.mode,
          questionStyle: questionStyle.id,
          pipelineTimeMs: totalTime,
          qualityScore,
          coverageAnalysis: coverageForQGen.overallAssessment,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('âŒ Failed to process candidate response:', error);
      throw error;
    }
  }

  // â”€â”€ Event Handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  /**
   * Handle silence detection â€” only acts on extended silence (20s+) to move to next question.
   */
  async handleSilence(sessionId, silenceDuration) {
    try {
      if (silenceDuration < 20) {
        return { action: 'ignore', content: null, reasoning: 'Short pause - allowing natural thinking time' };
      }

      const session = await this.sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      const weakestAreas = Object.entries(session.coverage?.areas || {})
        .filter(([, d]) => d.percentage < 50 && !d.completed && !d.disqualified)
        .sort((a, b) => a[1].percentage - b[1].percentage)
        .map(([a]) => a);

      const coverageForQGen = {
        overallAssessment: {
          weakestAreas,
          strongestAreas: Object.entries(session.coverage?.areas || {})
            .filter(([, d]) => d.percentage >= 60)
            .map(([a]) => a),
        },
      };

      const nextQuestion = await AIUtils.withTimeout(
        this.questionAI.generateIntelligentQuestion(
          session,
          coverageForQGen,
          { previousQuestions: session.conversation.filter(e => e.type === 'interviewer').slice(-5) },
          null,
          null
        ),
        12000,
        'handleSilence-generateQuestion'
      );

      const questionContent = nextQuestion.question || nextQuestion.content;

      await this.sessionManager.addConversationEntry(sessionId, {
        type: 'interviewer',
        content: questionContent,
        timestamp: new Date().toISOString(),
        metadata: { aiGenerated: true, targetAreas: nextQuestion.targetAreas, reasoning: 'Extended silence - moving forward', silenceDuration },
      });

      if (nextQuestion.targetAreas?.[0] && session.coverage?.areas?.[nextQuestion.targetAreas[0]]) {
        await incrementAreaQuestionCount(this.sessionManager, sessionId, nextQuestion.targetAreas[0]);
        await this.sessionManager.updateSession(sessionId, { currentFocusArea: nextQuestion.targetAreas[0] });
      }

      return {
        action:     'next_question',
        content:    questionContent,
        reasoning:  `Extended silence (${silenceDuration}s) - automatically moving forward`,
        targetAreas: nextQuestion.targetAreas,
        silenceDuration,
      };
    } catch (error) {
      console.error('[Silence] Failed to handle silence:', error.message);
      const fallback = "Let's move on to the next topic. Can you tell me about a recent project you worked on?";
      return {
        action:  'next_question',
        content: fallback,
        reasoning: 'Silence handling failed - using fallback',
        error:   error.message,
      };
    }
  }

    async endInterview(sessionId) {
    try {
      const session = await this.sessionManager.getSession(sessionId);
      if (!session) throw new Error(`Session ${sessionId} not found`);

      const finalReport = await generateFinalReport(session);

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

  async getSessionStatus(sessionId) {
    const [analytics, session] = await Promise.all([
      this.sessionManager.getSessionAnalytics(sessionId),
      this.sessionManager.getSession(sessionId),
    ]);
    return {
      status:        session?.status || 'unknown',
      analytics,
      coverage:      session?.coverage,
      realTimeReport: session?.realTimeReport,
    };
  }

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
        disconnectTime:   new Date().toISOString(),
      }).catch(() => {});
      throw endErr;
    }
  }

  /**
   * Process candidate response â€” always uses full AI analysis.
   * Legacy alias kept for backward compatibility with controller.
   */
  async processCandidateResponseIntelligently(sessionId, transcript, audioMetadata = {}) {
    return await this.processCandidateResponse(sessionId, transcript, audioMetadata);
  }

  // Expose generateSilencePrompt for controllers that call it directly
  generateSilencePrompt(session, silenceData) {
    return generateSilencePrompt(session, silenceData);
  }
}

module.exports = new IntelligentInterviewService();
