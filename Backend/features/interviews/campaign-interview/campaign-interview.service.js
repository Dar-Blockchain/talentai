const mongoose = require("mongoose");
const bedrock = require("../../../utils/bedrock-client");
const sessionMgr = require("../shared/interview.session");
const Campaign = require("../../campaigns/campaign.model");
const CampaignParticipant = require("../../campaigns/campaign-participant.model");
require("dotenv").config();

const helpers = require("./campaign-interview.helpers");
const persistence = require("./campaign-interview.persistence");
const skillTestPrompts = require("./prompts/skill-test.prompt");
const agentInterviewPrompts = require("./prompts/agent-interview.prompt");
const turnPrompts = require("./prompts/turn.prompt");
const greetingPrompts = require("./prompts/greeting.prompt");
const finalReportPrompts = require("./prompts/final-report.prompt");

// ─── Service class ───────────────────────────────────────────────────

class CampaignInterviewService {
  constructor() {
    this.sessionManager = sessionMgr;
  }

  // ── Initialize ──────────────────────────────────────────────────────

  async initialize() {
    try {
      // The Redis session manager is a shared singleton â€” skip re-initialization if already connected
      if (this.sessionManager.isConnected && this.sessionManager.client) {
        return true;
      }
      const ok = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, r) =>
          setTimeout(() => r(new Error("Redis timeout")), 5000),
        ),
      ]).catch((err) => {
        console.warn("âš ï¸ [CampaignInterview] Redis init failed:", err.message);
        return false;
      });
      return true;
    } catch (e) {
      console.error("âŒ [CampaignInterview] Init error:", e.message);
      return true; // don't block server startup
    }
  }

  // ── Start interview ─────────────────────────────────────────────────

  async startInterview(sessionId, config, candidateId, onGreetingChunk = null) {
    const { campaignId, moduleType } = config;

    // 1. Fetch campaign
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    // A connected (logged-in) participant who already completed this
    // campaign's module cannot start a new session -- this is the actual
    // gate; the "already_completed" UI state on the frontend only hides the
    // Start button, it doesn't stop a direct start_interview call. Anonymous
    // or link-based participants aren't tracked by a stable candidateId here,
    // so they're intentionally left out of this check.
    if (mongoose.Types.ObjectId.isValid(candidateId)) {
      const existingParticipant = await CampaignParticipant.findOne(
        { campaign: campaignId, employee: candidateId },
        { status: 1 },
      ).lean();
      if (existingParticipant?.status === "COMPLETED") {
        throw new Error("You have already completed this interview and cannot retake it.");
      }
    }

    const moduleConfig = campaign.module?.config || {};
    const agentPrompt = moduleConfig.agentPrompt || null;
    const skill = moduleConfig.skill || null;
    const duration = config?.duration ?? config.sessionSettings?.duration ?? 20;

    // 2. Build context for this interview type
    const context =
      moduleType === "SKILL_TEST"
        ? skillTestPrompts.buildSkillContext(skill)
        : await agentInterviewPrompts.buildAgentContext(agentPrompt, campaign);

    // 3. Determine coverage areas
    const coverageAreas =
      moduleType === "SKILL_TEST"
        ? helpers.SKILL_TEST_AREAS(skill || "the requested skill")
        : agentInterviewPrompts.buildCoverageAreasFromFocus(context.focusAreas) || helpers.AI_INTERVIEW_DEFAULT_AREAS();

    // 4. Create Redis session
    const sessionData = {
      sessionId,
      campaignId,
      moduleType,
      context,
      conversation: [],
      coverage: { overall: 0, areas: coverageAreas },
      questionsAsked: 0,
      maxQuestions: Math.max(5, Math.round(duration * 0.6)),
      usedQuestionTypes: [],
      config: { duration, interviewType: moduleType },
      startedAt: new Date().toISOString(),
      candidateId,
    };

    await this._saveSession(sessionId, sessionData);

    // 5. Generate greeting
    const greeting = await this._generateGreeting(
      context,
      moduleType,
      skill,
      onGreetingChunk,
    );

    // Store greeting in conversation
    await this.sessionManager.addConversationEntry(sessionId, {
      type: "interviewer",
      content: greeting,
      timestamp: new Date().toISOString(),
      metadata: { targetAreas: [Object.keys(coverageAreas)[0]] },
    });

    return {
      success: true,
      sessionId,
      greeting,
      config: {
        duration,
        interviewType: moduleType,
        silenceIntelligence: null,
      },
    };
  }

  // ── Process candidate response ──────────────────────────────────────

  async processCandidateResponse(sessionId, transcript, isSkipped = false) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Store candidate turn
    await this.sessionManager.addConversationEntry(sessionId, {
      type: "candidate",
      content: transcript,
      timestamp: new Date().toISOString(),
      ...(isSkipped ? { metadata: { skipped: true } } : {}),
    });

    const {
      context,
      moduleType,
      coverage,
      questionsAsked,
      maxQuestions,
      usedQuestionTypes = [],
      conversation,
      consecutiveFollowUps = 0,
    } = session;

    // Last interviewer question
    const lastQuestion =
      [...(conversation || [])].reverse().find((e) => e.type === "interviewer")
        ?.content || null;

    // Increment question counter
    const newCount = (questionsAsked || 0) + 1;
    await this.sessionManager.updateSession(sessionId, {
      questionsAsked: newCount,
    });

    // Should we end?
    const shouldEnd = newCount >= maxQuestions;

    // Combined LLM call: analyse + decide + generate next
    const result = await this._combinedTurn(
      context,
      moduleType,
      conversation || [],
      transcript,
      lastQuestion,
      coverage,
      shouldEnd,
      newCount,
      maxQuestions,
      usedQuestionTypes,
      isSkipped,
      consecutiveFollowUps,
    );

    // Track question type for anti-repetition
    const updatedQuestionTypes = result.questionType
      ? [...usedQuestionTypes, result.questionType].slice(-10)
      : usedQuestionTypes;

    // Track consecutive follow-ups so the next prompt can hard-force a pivot
    // if the model keeps probing the same point (e.g. candidate says "I don't
    // know" without using the skip button, and the model doesn't recognize it).
    const updatedFollowUpStreak = result.decision === "follow_up" ? consecutiveFollowUps + 1 : 0;

    // Update coverage
    const updatedCoverage = helpers.applyCoverageUpdates(
      coverage,
      result.coverageUpdates,
    );
    await this.sessionManager.updateSession(sessionId, {
      coverage: updatedCoverage,
      usedQuestionTypes: updatedQuestionTypes,
      consecutiveFollowUps: updatedFollowUpStreak,
    });

    return {
      type: result.decision, // 'next_question' | 'follow_up' | 'end_interview'
      content: result.nextQuestion,
      analysis: result.analysis,
      coverage: updatedCoverage,
      report: result.report,
    };
  }

  // ── End interview ────────────────────────────────────────────────────

  async endInterview(sessionId) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      console.warn(`âš ï¸ [CampaignInterview] endInterview: session ${sessionId} not found in Redis â€” skipping persist`);
      return { success: true, sessionId };
    }

    const finalReport = await this._generateFinalReport(session);

    // Persist results to MongoDB â€” throw so the caller can surface the error
    await persistence.persistResults(session, finalReport);

    // Delete session from Redis after successful save to prevent double-processing
    try {
      const key = this.sessionManager.sessionPrefix + sessionId;
      await this.sessionManager.client.del(key);
    } catch (_) { /* non-critical â€” TTL will expire it anyway */ }

    return {
      success: true,
      sessionId,
      finalReport,
      analytics: {
        questionsAsked: session.questionsAsked,
        duration: session.config?.duration,
      },
    };
  }

  // ── Session storage ─────────────────────────────────────────────────

  async _saveSession(sessionId, sessionData) {
    const mgr = this.sessionManager;
    if (!mgr.client || !mgr.isConnected) {
      throw new Error(
        "Redis not connected â€” cannot create campaign interview session",
      );
    }
    const key = mgr.sessionPrefix + sessionId;
    await mgr.client.setEx(key, mgr.sessionTTL, JSON.stringify(sessionData));
    return sessionData;
  }

  // ── LLM calls (thin wrappers around the prompt builders in ./prompts) ──

  async _generateGreeting(context, moduleType, skill, onChunk) {
    const { systemPrompt, userMsg } = greetingPrompts.buildGreetingUserMessage(context, moduleType, skill);
    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7,
        maxTokens: 200,
        timeout: 20000,
        useFastModel: true,
        onChunk,
      });
      return res.content || greetingPrompts.fallbackGreeting(moduleType, skill);
    } catch (e) {
      console.warn("⚠️ [CampaignInterview] Greeting generation failed:", e.message);
      return greetingPrompts.fallbackGreeting(moduleType, skill);
    }
  }

  async _generateFinalReport(session) {
    const { systemPrompt, userMsg } = finalReportPrompts.buildFinalReportUserMessage(session);
    const fallback = finalReportPrompts.buildFinalReportFallback(session.coverage);
    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: false,
      });
      return helpers.parseJSON(res.content, fallback);
    } catch (e) {
      console.warn("⚠️ [CampaignInterview] Final report failed:", e.message);
      return fallback;
    }
  }

  async _combinedTurn(
    context,
    moduleType,
    conversation,
    transcript,
    lastQuestion,
    coverage,
    shouldEnd,
    questionsAsked = 1,
    maxQuestions = 10,
    usedQuestionTypes = [],
    isSkipped = false,
    followUpStreak = 0,
  ) {
    const conversationSummary = conversation
      .slice(-4)
      .map((e) => `${e.type === "interviewer" ? "Interviewer" : "Candidate"}: ${e.content}`)
      .join("\n");

    const systemPrompt  = context.systemPrompt;
    const interviewTopic = context.topic || context.skill || context.campaignTitle || "this assessment";
    const userMsg = turnPrompts.buildMixedQuestionPrompt({
      transcript,
      conversationSummary,
      lastQuestion,
      coverage,
      shouldEnd,
      questionsAsked,
      maxQuestions,
      usedQuestionTypes,
      moduleType,
      interviewTopic,
      isSkipped,
      followUpStreak,
    });

    const fallback = turnPrompts.buildTurnFallback({ shouldEnd, isSkipped, questionsAsked });

    // A response that fails to parse as JSON is usually truncation (maxTokens
    // too tight for the combined analysis+coverage+report schema) rather than
    // a hard API error, so parseJSON's silent fallback needs to surface here
    // as a real failure to retry on -- previously it was invisible and the
    // static fallback question could repeat on nearly every turn with no log.
    const NOT_PARSED = Symbol("not-parsed");
    const attempt = async () => {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.7,
        maxTokens: 1100,
        timeout: 30000,
        useFastModel: false,
      });
      const parsed = helpers.parseJSON(res.content, NOT_PARSED);
      if (parsed === NOT_PARSED) {
        throw new Error(`response was not valid JSON (${res.content?.length ?? 0} chars -- likely truncated)`);
      }
      return parsed;
    };

    try {
      return await attempt();
    } catch (e) {
      console.warn("⚠️ [CampaignInterview] Combined turn failed, retrying once:", e.message);
      try {
        return await attempt();
      } catch (e2) {
        console.warn("⚠️ [CampaignInterview] Combined turn retry also failed, using fallback:", e2.message);
        return fallback;
      }
    }
  }
}

module.exports = new CampaignInterviewService();