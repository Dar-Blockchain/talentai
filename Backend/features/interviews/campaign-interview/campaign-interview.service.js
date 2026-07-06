/**
 * Campaign Interview Service
 * Lightweight AI interview engine for campaign-based assessments.
 *
 * AI_INTERVIEW  â€” uses campaign.module.config.agentPrompt as the interview brief
 * SKILL_TEST    â€” uses campaign.module.config.skill (e.g. "React") for technical assessment
 *
 * Deliberately simpler than intelligentInterview.service:
 *   â€¢ No job post / JD / RAG
 *   â€¢ Single-pass combined analysis + question generation (one LLM call per turn)
 *   â€¢ Lightweight coverage tracking
 */

const mongoose = require("mongoose");
const bedrock = require("../../../utils/bedrock-client");
const sessionMgr = require("../shared/redis-session-manager");
const Campaign = require("../../campaigns/campaign.model");
const CampaignResponse = require("../../campaigns/campaign-response.model");
const CampaignParticipant = require("../../campaigns/campaign-participant.model");
require("dotenv").config();
// â”€â”€ Phase-aware, diversity-enforcing question prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function buildMixedQuestionPrompt({
  transcript,
  conversationSummary,
  lastQuestion,
  coverage,
  shouldEnd,
  questionsAsked,
  maxQuestions,
  usedQuestionTypes = [],
  moduleType,
  interviewTopic,
  isSkipped = false,
}) {
  const totalProgress   = Math.round((questionsAsked / Math.max(maxQuestions, 1)) * 100);
  const phase =
    totalProgress < 25 ? "warm-up"
    : totalProgress < 60 ? "exploration"
    : totalProgress < 85 ? "deep-dive"
    : "closing";

  const remainingTopics = Object.entries(coverage.areas)
    .filter(([_, v]) => v.percentage < 75)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .map(([k, v]) => `${k} (${Math.round(v.percentage)}% covered)`);

  const topicsCovered = Object.entries(coverage.areas)
    .filter(([_, v]) => v.questionsAsked > 0)
    .map(([k, v]) => `${k}: ${Math.round(v.percentage)}% (${v.questionsAsked}q)`);

  const coverageLine = Object.entries(coverage.areas)
    .map(([k, v]) => `${k}=${Math.round(v.percentage)}%`)
    .join(" | ");

  const allTypes = ["behavioral", "situational", "technical", "problem-solving", "motivational"];
  const recentTypes = usedQuestionTypes.slice(-2);
  const recommendedType = allTypes.find(t => !recentTypes.includes(t)) || "situational";

  const phaseGuide = {
    "warm-up":     "Build rapport. Keep questions broad and welcoming. Ask about background and overall experience. No pressure.",
    "exploration": "Dig into specific skills and past experiences. Mix behavioral (STAR method) and situational questions. Introduce topic variety.",
    "deep-dive":   "Push for depth. Explore trade-offs, challenges, and advanced knowledge. Connect to specific points from earlier answers.",
    "closing":     "Wrap up gracefully. Cover any significant coverage gaps. One final meaningful question, then prepare to close.",
  };

  return `
You are conducting a live interview. Use the full context below to generate your next move.

â•â•â•â• INTERVIEW TOPIC â•â•â•â•
${interviewTopic || "General assessment"}
Every question you ask MUST be directly relevant to this topic. Do not ask generic questions unrelated to it.

â•â•â•â• CONVERSATION HISTORY (last 4 turns) â•â•â•â•
${conversationSummary || "(interview just started â€” this is the first question after the greeting)"}

â•â•â•â• CANDIDATE'S LATEST ANSWER â•â•â•â•
${isSkipped ? "(The candidate chose to SKIP this question — no answer was given. Do not evaluate or reference an answer that does not exist.)" : `\"${transcript}\"`}

â•â•â•â• LAST QUESTION YOU ASKED â•â•â•â•
${lastQuestion ? `"${lastQuestion}"` : "(none yet â€” you just gave the opening greeting)"}

â•â•â•â• INTERVIEW PROGRESS â•â•â•â•
Questions asked: ${questionsAsked} / ${maxQuestions} | Phase: ${phase.toUpperCase()} (${totalProgress}% through)
Coverage: ${coverageLine}
Topics explored so far: ${topicsCovered.join(", ") || "none yet"}
Topics still needed (priority order): ${remainingTopics.join(", ") || "all areas sufficiently covered"}
Question types recently used: ${recentTypes.join(", ") || "none"}
Recommended next type (for variety): ${recommendedType}

â•â•â•â• PHASE STRATEGY â•â•â•â•
${phaseGuide[phase]}

â•â•â•â• YOUR TASK â•â•â•â•
Step 1 â€” Evaluate the candidate's latest answer honestly.
Step 2 â€” Decide your next move:
  â€¢ "follow_up"      â†’ if the answer was vague, incomplete, or skipped a key detail that needs probing
  â€¢ "next_question"  â†’ if the answer was sufficient and you should move to a new topic or angle
  â€¢ "end_interview"  â†’ ONLY if SHOULD_END is true OR overall coverage across all areas â‰¥ 75%
${isSkipped ? `NOTE: the candidate SKIPPED this question without answering. decision MUST be "next_question" (never "follow_up" — there is nothing to probe), every coverageUpdates increase MUST be 0, and analysis.quality should be "avoided". Move on to a fresh topic or angle and do not reference or evaluate a nonexistent answer.` : ""}

Step 3 â€” Generate the next question or closing statement following ALL of these rules:
  âœ“ Use a DIFFERENT question type than the last 2 (avoid: ${recentTypes.join(", ") || "none"})
  âœ“ One question only â€” never compound questions or sub-questions
  âœ“ Human and conversational â€” no robotic phrasing
  âœ“ For "follow_up": acknowledge something specific the candidate said, then probe deeper on that exact point
  âœ“ For "next_question": one brief natural transition phrase, then the question
  âœ“ For "end_interview": warm, professional closing statement â€” not a question
  âœ“ Match the tone and depth to the "${phase}" phase

SHOULD END: ${shouldEnd}

Return ONLY valid JSON â€” no extra text, no markdown:
{
  "analysis": {
    "quality": "poor|fair|good|excellent",
    "score": <0-100>,
    "completeness": "complete|partial|minimal|avoided",
    "keyPoints": ["<key observation 1>", "<key observation 2>"]
  },
  "coverageUpdates": [
    { "area": "<area_key>", "increase": <0-25> }
  ],
  "decision": "next_question|follow_up|end_interview",
  "questionType": "behavioral|situational|technical|problem-solving|motivational|closing",
  "nextQuestion": "<next question or closing statement>",
  "report": {
    "strengths": ["<strength observed>"],
    "areasForImprovement": ["<area to develop>"],
    "overallProgress": <0-100>
  }
}

Coverage increase guide:
  0     = answer was off-topic, avoided, or empty
  5â€“10  = partial or shallow answer â€” touched the area but lacked depth
  10â€“15 = reasonable answer with some substance
  15â€“20 = solid, well-articulated answer
  20â€“25 = expert-level, detailed, insightful answer

If SHOULD END is true OR all areas have coverage â‰¥ 75%, decision MUST be "end_interview".
`;
}
// â”€â”€â”€ JSON helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function parseJSON(raw, fallback) {
  try {
    let s = raw.trim();
    if (s.startsWith("```")) {
      const m = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) s = m[1];
    }
    return JSON.parse(s);
  } catch (_) {
    const a = raw.indexOf("{"),
      b = raw.lastIndexOf("}");
    if (a !== -1 && b > a) {
      try {
        return JSON.parse(raw.slice(a, b + 1));
      } catch (_2) {}
    }
    return fallback;
  }
}

// â”€â”€â”€ Coverage area defaults â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SKILL_TEST_AREAS = (skill) => ({
  fundamentals: {
    label: `${skill} Fundamentals`,
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  practical_usage: {
    label: `Practical ${skill} Usage`,
    percentage: 0,
    questionsAsked: 0,
    weight: 25,
  },
  advanced_topics: {
    label: `Advanced ${skill} Topics`,
    percentage: 0,
    questionsAsked: 0,
    weight: 25,
  },
  best_practices: {
    label: "Best Practices & Patterns",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
});

const AI_INTERVIEW_DEFAULT_AREAS = () => ({
  experience: {
    label: "Experience & Background",
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  competencies: {
    label: "Core Competencies",
    percentage: 0,
    questionsAsked: 0,
    weight: 30,
  },
  motivation: {
    label: "Motivation & Culture Fit",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
  situational: {
    label: "Situational Judgment",
    percentage: 0,
    questionsAsked: 0,
    weight: 20,
  },
});

// â”€â”€â”€ Service class â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class CampaignInterviewService {
  constructor() {
    this.sessionManager = sessionMgr;
  }

  // â”€â”€ Initialize â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ Start interview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async startInterview(sessionId, config, candidateId, onGreetingChunk = null) {
    const { campaignId, moduleType } = config;

    // 1. Fetch campaign
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    const moduleConfig = campaign.module?.config || {};
    const agentPrompt = moduleConfig.agentPrompt || null;
    const skill = moduleConfig.skill || null;
    const duration = config?.duration ?? config.sessionSettings?.duration ?? 20;

    // 2. Build context for this interview type
    const context =
      moduleType === "SKILL_TEST"
        ? this._buildSkillContext(skill)
        : await this._buildAgentContext(agentPrompt, campaign);

    // 3. Determine coverage areas
    const coverageAreas =
      moduleType === "SKILL_TEST"
        ? SKILL_TEST_AREAS(skill || "the requested skill")
        : this._buildCoverageAreasFromFocus(context.focusAreas) || AI_INTERVIEW_DEFAULT_AREAS();

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

  // â”€â”€ Process candidate response â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    );

    // Track question type for anti-repetition
    const updatedQuestionTypes = result.questionType
      ? [...usedQuestionTypes, result.questionType].slice(-10)
      : usedQuestionTypes;

    // Update coverage
    const updatedCoverage = this._applyCoverageUpdates(
      coverage,
      result.coverageUpdates,
    );
    await this.sessionManager.updateSession(sessionId, {
      coverage: updatedCoverage,
      usedQuestionTypes: updatedQuestionTypes,
    });

    return {
      type: result.decision, // 'next_question' | 'follow_up' | 'end_interview'
      content: result.nextQuestion,
      analysis: result.analysis,
      coverage: updatedCoverage,
      report: result.report,
    };
  }

  // â”€â”€ End interview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async endInterview(sessionId) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      console.warn(`âš ï¸ [CampaignInterview] endInterview: session ${sessionId} not found in Redis â€” skipping persist`);
      return { success: true, sessionId };
    }

    const finalReport = await this._generateFinalReport(session);

    // Persist results to MongoDB â€” throw so the caller can surface the error
    await this._persistResults(session, finalReport);

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

  // â”€â”€ Persist interview results to MongoDB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async _persistResults(session, finalReport) {
    const { campaignId, candidateId, moduleType, conversation = [], coverage } = session;

    if (!campaignId || !candidateId) {
      console.warn("âš ï¸ [CampaignInterview] Missing campaignId or candidateId â€” skipping persist");
      return;
    }

    // Resolve the CampaignParticipant. candidateId may be a real User _id (authenticated
    // employee) OR an anonymous/link token (ANONYMOUS-mode or unauthenticated LINK access)
    // — mirrors the resolution order already proven in campaign.controller.js's
    // exports.getParticipantResults.
    const candidateIsObjectId = mongoose.Types.ObjectId.isValid(candidateId);

    let participant = null;
    if (candidateIsObjectId) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, employee: candidateId });
    }
    if (!participant) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, anonymousToken: candidateId });
    }
    if (!participant) {
      participant = await CampaignParticipant.findOne({ campaign: campaignId, linkAccessToken: candidateId });
    }

    if (!participant) {
      if (!candidateIsObjectId) {
        console.warn(`⚠️ [CampaignInterview] No participant found for anonymous/link candidateId=${candidateId}, campaign=${campaignId} — skipping persist`);
        return;
      }
      console.warn(`⚠️ [CampaignInterview] No participant found for campaign=${campaignId} employee=${candidateId} — upserting`);
      participant = await CampaignParticipant.findOneAndUpdate(
        { campaign: campaignId, employee: candidateId },
        { $setOnInsert: { campaign: campaignId, employee: candidateId, status: 'IN_PROGRESS' } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
    }


    const aiScore   = typeof finalReport.overallScore === "number" ? Math.round(finalReport.overallScore) : null;
    const aiSummary = finalReport.summary ?? null;

    const interviewTranscript = conversation
      .filter(e => e.type === "interviewer" || e.type === "candidate")
      .map(e => ({
        role:      e.type === "interviewer" ? "agent" : "candidate",
        message:   e.content || "",
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      }));

    const $setData = {
      campaign:            campaignId,
      participant:         participant._id,
      moduleType,
      aiScore,
      aiSummary,
      interviewTranscript,
      aiReport: {
        strengths:            Array.isArray(finalReport.strengths) ? finalReport.strengths : [],
        areasForImprovement:  Array.isArray(finalReport.areasForImprovement) ? finalReport.areasForImprovement : [],
        recommendation:       finalReport.recommendation ?? null,
      },
    };

    if (moduleType === "SKILL_TEST") {
      const coverageAreas = coverage?.areas ?? {};
      const breakdown = Object.entries(finalReport.coverageSummary ?? {}).map(([area, score]) => ({
        area,
        label: coverageAreas[area]?.label ?? area,
        score: Math.round(Number(score) || 0),
      }));

      $setData.testResults = {
        score:    aiScore,
        maxScore: 100,
        breakdown,
      };
    } else {
      const breakdown = [
        { area: "communication", label: "Communication", score: finalReport.communicationScore ?? null },
        { area: "confidence",    label: "Confidence",    score: finalReport.confidenceScore    ?? null },
        { area: "clarity",       label: "Clarity",       score: finalReport.clarityScore       ?? null },
        { area: "engagement",    label: "Engagement",    score: finalReport.engagementScore    ?? null },
      ].filter(b => b.score !== null);

      $setData.testResults = {
        score:    aiScore,
        maxScore: 100,
        breakdown,
      };
    }


    const savedResponse = await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType },
      { $set: $setData },
      { upsert: true, new: true, runValidators: false },
    );


    participant.status         = "COMPLETED";
    participant.completedAt    = new Date();
    participant.moduleProgress = {
      moduleType,
      status:      "COMPLETED",
      completedAt: new Date(),
      responseRef: savedResponse._id,
    };

    await participant.save();

  }

  // â”€â”€ Session storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ Private helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  _buildSkillContext(skill) {
    const s = skill || "General Programming";
    return {
      type: "SKILL_TEST",
      skill: s,
      topic: s,
      systemPrompt: `You are a senior technical interviewer conducting a rigorous ${s} skill assessment.

ROLE
Act as a knowledgeable, professional, and empathetic interviewer â€” like a senior engineer interviewing a peer. Your tone should be encouraging yet evaluative. Make the candidate feel at ease while genuinely testing their depth.

INTERVIEW PROGRESSION
Phase 1 â€“ Warm-up (first 2 questions):
  Broad, approachable questions about experience level and general familiarity with ${s}.
  Goal: break the ice, calibrate seniority level.
  Example style: "How long have you been working with ${s} and what kinds of projects have you used it on?"

Phase 2 â€“ Exploration (next 2â€“3 questions):
  Core concepts, common patterns, and practical application.
  Mix conceptual understanding with real-world usage.
  Example styles: "How does X work internally?", "How have you used Y in a production context?"

Phase 3 â€“ Deep-dive (next 2â€“3 questions):
  Advanced topics, edge cases, performance considerations, architectural trade-offs.
  Push for genuine depth â€” probe if answers are shallow.
  Example styles: "What would happen if...?", "How would you approach optimizing...?"

Phase 4 â€“ Closing (last 1â€“2 questions):
  Reflection, best practices, lessons learned.
  Example styles: "What's a mistake you made with ${s} and what did you learn?", "What advice would you give a junior developer starting with ${s}?"

QUESTION TYPE ROTATION â€” always vary across:
  â€¢ Conceptual   â†’ test understanding of how/why things work
  â€¢ Applied      â†’ test hands-on experience with real projects
  â€¢ Scenario     â†’ present a problem and ask how they'd solve it
  â€¢ Best-practice â†’ probe for quality standards and code hygiene
  â€¢ Problem-solving â†’ give a challenge and evaluate their reasoning

ANTI-REPETITION RULES
  â€“ Never ask two conceptual questions in a row
  â€“ Never reuse the same example, framework feature, or scenario
  â€“ If a candidate gave an excellent answer, build on it â€” don't repeat the same angle
  â€“ If a candidate gave a poor answer, simplify slightly and try a different angle, don't abandon the area

RESPONSE QUALITY ADAPTATION
  â€“ Excellent answer â†’ increase difficulty, go deeper, ask about edge cases
  â€“ Good answer â†’ probe one specific detail further before moving on
  â€“ Fair answer â†’ stay at the same level, try a different angle
  â€“ Poor/avoided â†’ give a simpler follow-up or pivot to a related area

STYLE
  â€“ Concise, clear questions (one thing at a time â€” no compound questions)
  â€“ Brief acknowledgment of the previous answer before each new question (1 phrase max)
  â€“ Professional but never cold or robotic`,
    };
  }

  // Reads the company's free-form agentPrompt (a phrase, a list, or full instructions)
  // and interprets its INTENT into a short topic label, weighted focus areas, and tone â€”
  // instead of ever splicing the raw text verbatim into the system prompt.
  async _interpretAgentPrompt(rawInput, campaignTitle) {
    if (!rawInput) return null;

    const systemPrompt = `You are an expert interview designer. You read a free-form brief written by a company describing what an AI-led interview should cover, and convert it into a structured, actionable interview plan. You never copy the brief verbatim into your output â€” you interpret its intent and re-express it in your own words.`;

    const userMsg = `Read the brief below and produce a structured interview plan.

BRIEF (written by the company â€” may be a single phrase, a list of topics, or full persona/instructions):
"""
${rawInput}
"""
${campaignTitle ? `Campaign title (context): "${campaignTitle}"` : ""}

Produce:
- "topic": a short 2-6 word label for what this interview is about
- "focusAreas": 3-5 subtopics/competencies to probe, each an object with:
    "key"    â€” snake_case identifier, no spaces (e.g. "react_expertise")
    "label"  â€” short human-readable label (e.g. "React Expertise")
    "weight" â€” integer importance weight; all weights together should sum to ~100
- "tone": a short phrase describing the interview's tone/style, inferred from the brief (default to "professional and encouraging" if the brief doesn't imply otherwise)
- "openingContext": one natural sentence (no surrounding quotes, no "the interview will focus on" boilerplate) summarizing what this conversation will explore, written so it can be dropped directly into a greeting

Return ONLY valid JSON, no markdown, no extra text:
{
  "topic": "<label>",
  "focusAreas": [{ "key": "<key>", "label": "<label>", "weight": <int> }],
  "tone": "<tone>",
  "openingContext": "<sentence>"
}`;

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.4,
        maxTokens: 500,
        timeout: 20000,
        useFastModel: true,
      });
      const parsed = parseJSON(res.content, null);
      if (!parsed || !Array.isArray(parsed.focusAreas) || parsed.focusAreas.length === 0) return null;
      return parsed;
    } catch (e) {
      console.warn("âš ï¸ [CampaignInterview] Prompt interpretation failed:", e.message);
      return null;
    }
  }

  _buildCoverageAreasFromFocus(focusAreas) {
    if (!Array.isArray(focusAreas) || focusAreas.length === 0) return null;
    const areas = {};
    for (const a of focusAreas) {
      if (!a?.key || !a?.label) continue;
      areas[a.key] = {
        label: a.label,
        percentage: 0,
        questionsAsked: 0,
        weight: typeof a.weight === "number" && a.weight > 0 ? a.weight : 25,
      };
    }
    return Object.keys(areas).length > 0 ? areas : null;
  }

  async _buildAgentContext(agentPrompt, campaign) {
    const rawInput    = agentPrompt?.trim() || "";
    const interpreted  = await this._interpretAgentPrompt(rawInput, campaign.title);

    const topic          = interpreted?.topic || rawInput || campaign.title || "general assessment";
    const tone            = interpreted?.tone || "professional and encouraging";
    const openingContext  = interpreted?.openingContext || null;
    const focusAreas      = Array.isArray(interpreted?.focusAreas) && interpreted.focusAreas.length > 0
      ? interpreted.focusAreas
      : null;
    const focusList = focusAreas
      ? focusAreas.map((a) => `  â€¢ ${a.label}`).join("\n")
      : null;

    const conductRules = `
INTERVIEW CONDUCT RULES
- Ask one question at a time â€” no compound questions.
- Vary question types every turn: behavioral, situational, technical (if relevant), motivational, problem-solving.
- Acknowledge the candidate's previous answer with one brief phrase before each new question.
- Adapt difficulty based on answer quality (deeper if excellent, simpler if poor).
- Never repeat the same angle, example, or scenario twice.
- Every question must be directly relevant to the interview topic: "${topic}".`;

    const systemPrompt = `You are an experienced interviewer conducting a structured assessment on the topic: "${topic}".
Campaign: "${campaign.title}"
Interview tone: ${tone}.

INTERVIEW FOCUS
Every single question you ask must be directly and specifically about "${topic}"${focusList ? `, covering these areas:\n${focusList}` : ""}.
Do not ask generic HR questions unrelated to this topic unless used as a brief warm-up opener.

ROLE
Act as a knowledgeable, professional, and empathetic interviewer. Your tone is ${tone}.
You combine behavioral, situational, technical, and problem-solving questions to build a complete picture of the candidate's capabilities in "${topic}".

INTERVIEW PROGRESSION
Phase 1 â€“ Warm-up: Ask about the candidate's overall experience with "${topic}" â€” how long, in what context.
Phase 2 â€“ Exploration: Probe specific knowledge, past projects, and practical application of "${topic}".
Phase 3 â€“ Deep-dive: Test advanced understanding, trade-offs, edge cases, and design decisions related to "${topic}".
Phase 4 â€“ Closing: Ask about best practices, lessons learned, or an achievement they're proud of involving "${topic}".

QUESTION TYPE ROTATION (always vary):
  â€¢ Conceptual     â†’ "How does X work in the context of ${topic}?"
  â€¢ Applied        â†’ "Tell me about a project where you used ${topic}. What did you build?"
  â€¢ Behavioral     â†’ "Tell me about a challenge you faced with ${topic} and how you solved it."
  â€¢ Situational    â†’ "If you had to use ${topic} to solve [problem], how would you approach it?"
  â€¢ Best-practice  â†’ "What are the most common mistakes people make with ${topic}?"

${conductRules}`;

    return {
      type:          "AI_INTERVIEW",
      topic,
      tone,
      openingContext,
      focusAreas,
      systemPrompt,
      campaignTitle: campaign.title,
    };
  }

  async _generateGreeting(context, moduleType, skill, onChunk) {
    const systemPrompt   = context.systemPrompt;
    const topic          = context.topic || skill || "this subject";
    const tone           = context.tone || "warm, welcoming, professional";
    const openingContext = context.openingContext;
    const userMsg =
      moduleType === "SKILL_TEST"
        ? `Generate a warm, professional opening message to start a ${topic} skill assessment.
The message must:
1. Greet the candidate using "I" â€” do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Set expectations briefly â€” mention it will be a conversational assessment covering ${topic} from fundamentals to advanced topics.
3. End with a natural warm-up question asking about their experience level with ${topic} and the kinds of projects they've used it on.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets.
Tone: encouraging, professional, human. Not robotic.
Length: 3â€“4 sentences maximum. No bullet points, no headers.`
        : `Generate a warm, professional opening message to start an interview${openingContext ? ` covering: ${openingContext}` : ` on the topic: "${topic}"`}.
The message must:
1. Greet the candidate using "I" â€” do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Briefly and naturally mention what this conversation will explore${openingContext ? "" : ` â€” "${topic}"`} and that it's a conversation, not a test.
3. End with an open warm-up question related to "${topic}" â€” for example, asking about their overall experience with it or how they've worked with it in the past.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets. Speak naturally in your own words â€” never quote or copy any source brief verbatim.
Tone: ${tone}. Not robotic.
Length: 3â€“4 sentences maximum. No bullet points, no headers.`;

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
      return res.content || this._fallbackGreeting(moduleType, skill);
    } catch (e) {
      console.warn(
        "âš ï¸ [CampaignInterview] Greeting generation failed:",
        e.message,
      );
      return this._fallbackGreeting(moduleType, skill);
    }
  }

  _fallbackGreeting(moduleType, skill) {
    const topic = skill || "technical";
    return moduleType === "SKILL_TEST"
      ? `Welcome! I'm your interviewer today and I'll be guiding you through a ${topic} assessment. We'll cover a range of topics from fundamentals to practical usage. To get started, could you tell me about your experience with ${topic} and the kinds of projects you've worked on?`
      : `Welcome! I'm your interviewer today. This will be a relaxed conversation â€” not a test â€” so feel free to speak freely. To kick things off, could you give me a quick overview of your background and what you've been working on recently?`;
  }


  _applyCoverageUpdates(coverage, updates = []) {
    const areas = { ...coverage.areas };
    for (const u of updates) {
      if (areas[u.area] && typeof u.increase === "number") {
        areas[u.area] = {
          ...areas[u.area],
          percentage: Math.min(
            100,
            (areas[u.area].percentage || 0) + u.increase,
          ),
          questionsAsked: (areas[u.area].questionsAsked || 0) + 1,
          lastUpdated: new Date().toISOString(),
        };
      }
    }
    const totalWeight = Object.values(areas).reduce(
      (s, a) => s + (a.weight || 25),
      0,
    );
    const overall = Math.round(
      Object.values(areas).reduce(
        (s, a) => s + (a.percentage || 0) * (a.weight || 25),
        0,
      ) / totalWeight,
    );
    return { ...coverage, areas, overall };
  }

  async _generateFinalReport(session) {
    const { context, conversation, coverage, moduleType } = session;
    const systemPrompt = context.systemPrompt;

    const conversationText = (conversation || [])
      .map(
        (e) =>
          `${e.type === "interviewer" ? "Interviewer" : "Candidate"}: ${e.content}`,
      )
      .join("\n");

    const coverageLines = Object.entries(coverage.areas)
      .map(([k, v]) => `  ${k}: ${Math.round(v.percentage || 0)}% (${v.questionsAsked || 0} questions)`)
      .join("\n");

    const userMsg = `
You are generating a final assessment report based on the completed interview below.
Be objective, evidence-based, and specific â€” reference actual things the candidate said, not generic observations.

â•â•â•â• INTERVIEW TYPE â•â•â•â•
${moduleType}

â•â•â•â• COVERAGE ACHIEVED â•â•â•â•
${coverageLines}
Overall: ${Math.round(coverage.overall || 0)}%

â•â•â•â• FULL CONVERSATION â•â•â•â•
${conversationText.slice(0, 4500)}

â•â•â•â• SCORING GUIDELINES â•â•â•â•
overallScore (0â€“100):
  90â€“100 = Exceptional â€” would hire immediately, clear standout
  75â€“89  = Strong â€” above expectations, recommend hire
  60â€“74  = Solid â€” meets expectations with some gaps
  45â€“59  = Mixed â€” some good areas but significant gaps
  0â€“44   = Below bar â€” does not meet expectations

communicationScore: clarity, structure, and effectiveness of expression
confidenceScore: how decisive and self-assured responses were (not arrogance)
clarityScore: how precise, focused, and well-organized answers were
engagementScore: enthusiasm, curiosity, and active participation

recommendation rules:
  strong_hire â†’ overallScore â‰¥ 85
  hire        â†’ overallScore 70â€“84
  consider    â†’ overallScore 50â€“69
  reject      â†’ overallScore < 50

Respond ONLY with valid JSON â€” no markdown, no extra text:
{
  "overallScore": <0-100>,
  "summary": "<2â€“3 sentences: what stood out most â€” both positive and developmental â€” grounded in specific answers they gave>",
  "strengths": ["<3â€“5 specific, evidence-based strengths observed during the interview>"],
  "areasForImprovement": ["<2â€“4 concrete, actionable areas to develop>"],
  "recommendation": "strong_hire|hire|consider|reject",
  "coverageSummary": { "<area_key>": <0-100> },
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "clarityScore": <0-100>,
  "engagementScore": <0-100>
}
`;

    const base = Math.round(coverage.overall || 50);
    const fallback = {
      overallScore: base,
      summary: "Interview completed. Detailed analysis is being processed.",
      strengths: ["Completed the full interview session"],
      areasForImprovement: [],
      recommendation: "consider",
      coverageSummary: Object.fromEntries(
        Object.entries(coverage.areas).map(([k, v]) => [
          k,
          Math.round(v.percentage || 0),
        ]),
      ),
      communicationScore: base,
      confidenceScore: Math.round(base * 0.92),
      clarityScore: Math.round(base * 1.05 > 100 ? 100 : base * 1.05),
      engagementScore: Math.round(base * 0.94),
    };

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: false,
      });
      return parseJSON(res.content, fallback);
    } catch (e) {
      console.warn("âš ï¸ [CampaignInterview] Final report failed:", e.message);
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
  ) {
    const conversationSummary = conversation
      .slice(-4)
      .map((e) => `${e.type === "interviewer" ? "Interviewer" : "Candidate"}: ${e.content}`)
      .join("\n");

    const systemPrompt  = context.systemPrompt;
    const interviewTopic = context.topic || context.skill || context.campaignTitle || "this assessment";
    const userMsg = buildMixedQuestionPrompt({
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
    });

    const fallback = {
      analysis: { quality: "fair", score: 50, completeness: "partial", keyPoints: [] },
      coverageUpdates: [],
      decision: shouldEnd ? "end_interview" : "next_question",
      questionType: "situational",
      nextQuestion: shouldEnd
        ? "Thank you so much for your time today â€” I really enjoyed our conversation. That brings us to the end of this session."
        : isSkipped
          ? "No problem, let's move on. Could you tell me about a different experience relevant to this role?"
          : "That's interesting. Could you walk me through a specific situation where you had to apply that in practice?",
      report: { strengths: [], areasForImprovement: [], overallProgress: 30 },
    };

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.65,
        maxTokens: 700,
        timeout: 30000,
        useFastModel: false,
      });
      return parseJSON(res.content, fallback);
    } catch (e) {
      console.warn("âš ï¸ [CampaignInterview] Combined turn failed:", e.message);
      return fallback;
    }
  }
}

module.exports = new CampaignInterviewService();
