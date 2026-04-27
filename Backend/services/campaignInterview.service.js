/**
 * Campaign Interview Service
 * Lightweight AI interview engine for campaign-based assessments.
 *
 * AI_INTERVIEW  — uses campaign.module.config.agentPrompt as the interview brief
 * SKILL_TEST    — uses campaign.module.config.skill (e.g. "React") for technical assessment
 *
 * Deliberately simpler than intelligentInterview.service:
 *   • No job post / JD / RAG
 *   • Single-pass combined analysis + question generation (one LLM call per turn)
 *   • Lightweight coverage tracking
 */

const bedrock = require("../helpers/bedrock.helpers");
const sessionMgr = require("../utils/redis-session-manager");
const Campaign = require("../models/internalCampaign.model");
const CampaignResponse = require("../models/campaignResponse.model");
const CampaignParticipant = require("../models/campaignParticipant.model");
require("dotenv").config();
// ── Phase-aware, diversity-enforcing question prompt ──────────────────────────
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

════ INTERVIEW TOPIC ════
${interviewTopic || "General assessment"}
Every question you ask MUST be directly relevant to this topic. Do not ask generic questions unrelated to it.

════ CONVERSATION HISTORY (last 4 turns) ════
${conversationSummary || "(interview just started — this is the first question after the greeting)"}

════ CANDIDATE'S LATEST ANSWER ════
"${transcript}"

════ LAST QUESTION YOU ASKED ════
${lastQuestion ? `"${lastQuestion}"` : "(none yet — you just gave the opening greeting)"}

════ INTERVIEW PROGRESS ════
Questions asked: ${questionsAsked} / ${maxQuestions} | Phase: ${phase.toUpperCase()} (${totalProgress}% through)
Coverage: ${coverageLine}
Topics explored so far: ${topicsCovered.join(", ") || "none yet"}
Topics still needed (priority order): ${remainingTopics.join(", ") || "all areas sufficiently covered"}
Question types recently used: ${recentTypes.join(", ") || "none"}
Recommended next type (for variety): ${recommendedType}

════ PHASE STRATEGY ════
${phaseGuide[phase]}

════ YOUR TASK ════
Step 1 — Evaluate the candidate's latest answer honestly.
Step 2 — Decide your next move:
  • "follow_up"      → if the answer was vague, incomplete, or skipped a key detail that needs probing
  • "next_question"  → if the answer was sufficient and you should move to a new topic or angle
  • "end_interview"  → ONLY if SHOULD_END is true OR overall coverage across all areas ≥ 75%
Step 3 — Generate the next question or closing statement following ALL of these rules:
  ✓ Use a DIFFERENT question type than the last 2 (avoid: ${recentTypes.join(", ") || "none"})
  ✓ One question only — never compound questions or sub-questions
  ✓ Human and conversational — no robotic phrasing
  ✓ For "follow_up": acknowledge something specific the candidate said, then probe deeper on that exact point
  ✓ For "next_question": one brief natural transition phrase, then the question
  ✓ For "end_interview": warm, professional closing statement — not a question
  ✓ Match the tone and depth to the "${phase}" phase

SHOULD END: ${shouldEnd}

Return ONLY valid JSON — no extra text, no markdown:
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
  5–10  = partial or shallow answer — touched the area but lacked depth
  10–15 = reasonable answer with some substance
  15–20 = solid, well-articulated answer
  20–25 = expert-level, detailed, insightful answer

If SHOULD END is true OR all areas have coverage ≥ 75%, decision MUST be "end_interview".
`;
}
// ─── JSON helpers ─────────────────────────────────────────────────────────────

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

// ─── Coverage area defaults ────────────────────────────────────────────────────

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

// ─── Service class ─────────────────────────────────────────────────────────────

class CampaignInterviewService {
  constructor() {
    this.sessionManager = sessionMgr;
  }

  // ── Initialize ──────────────────────────────────────────────────────────────

  async initialize() {
    try {
      // The Redis session manager is a shared singleton — skip re-initialization if already connected
      if (this.sessionManager.isConnected && this.sessionManager.client) {
        console.log(
          "✅ [CampaignInterview] Service initialized (Redis already connected)",
        );
        return true;
      }
      const ok = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, r) =>
          setTimeout(() => r(new Error("Redis timeout")), 5000),
        ),
      ]).catch((err) => {
        console.warn("⚠️ [CampaignInterview] Redis init failed:", err.message);
        return false;
      });
      console.log(
        ok
          ? "✅ [CampaignInterview] Service initialized with Redis"
          : "⚠️ [CampaignInterview] Service initialized WITHOUT Redis (degraded mode)",
      );
      return true;
    } catch (e) {
      console.error("❌ [CampaignInterview] Init error:", e.message);
      return true; // don't block server startup
    }
  }

  // ── Start interview ─────────────────────────────────────────────────────────

  async startInterview(sessionId, config, candidateId, onGreetingChunk = null) {
    const { campaignId, moduleType, duration = 20 } = config;

    // 1. Fetch campaign
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

    const moduleConfig = campaign.module?.config || {};
    const agentPrompt = moduleConfig.agentPrompt || null;
    const skill = moduleConfig.skill || null;

    // 2. Build context for this interview type
    const context =
      moduleType === "SKILL_TEST"
        ? this._buildSkillContext(skill)
        : this._buildAgentContext(agentPrompt, campaign);

    // 3. Determine coverage areas
    const coverageAreas =
      moduleType === "SKILL_TEST"
        ? SKILL_TEST_AREAS(skill || "the requested skill")
        : AI_INTERVIEW_DEFAULT_AREAS();

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

  // ── Process candidate response ──────────────────────────────────────────────

  async processCandidateResponse(sessionId, transcript) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Store candidate turn
    await this.sessionManager.addConversationEntry(sessionId, {
      type: "candidate",
      content: transcript,
      timestamp: new Date().toISOString(),
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

  // ── End interview ───────────────────────────────────────────────────────────

  async endInterview(sessionId) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      console.warn(`⚠️ [CampaignInterview] endInterview: session ${sessionId} not found in Redis — skipping persist`);
      return { success: true, sessionId };
    }

    const finalReport = await this._generateFinalReport(session);

    // Persist results to MongoDB — throw so the caller can surface the error
    await this._persistResults(session, finalReport);

    // Delete session from Redis after successful save to prevent double-processing
    try {
      const key = this.sessionManager.sessionPrefix + sessionId;
      await this.sessionManager.client.del(key);
    } catch (_) { /* non-critical — TTL will expire it anyway */ }

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

  // ── Persist interview results to MongoDB ─────────────────────────────────────

  async _persistResults(session, finalReport) {
    const { campaignId, candidateId, moduleType, conversation = [], coverage } = session;

    console.log(`📝 [CampaignInterview] _persistResults start — campaign=${campaignId} candidate=${candidateId} moduleType=${moduleType} turns=${conversation.length}`);

    if (!campaignId || !candidateId) {
      console.warn("⚠️ [CampaignInterview] Missing campaignId or candidateId — skipping persist");
      return;
    }

    // Look up the CampaignParticipant by (campaign, employee user _id)
    let participant = await CampaignParticipant.findOne({
      campaign: campaignId,
      employee: candidateId,
    });

    if (!participant) {
      // Employee started the interview without a pre-registered participant record.
      // Use findOneAndUpdate + upsert (idempotent) to avoid duplicate-key races
      // with the frontend's addCampaignParticipant call.
      console.warn(`⚠️ [CampaignInterview] No participant found for campaign=${campaignId} employee=${candidateId} — upserting`);
      participant = await CampaignParticipant.findOneAndUpdate(
        { campaign: campaignId, employee: candidateId },
        { $setOnInsert: { campaign: campaignId, employee: candidateId, status: 'IN_PROGRESS' } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );
      console.log(`✅ [CampaignInterview] Upserted participant ${participant._id}`);
    }

    console.log(`📝 [CampaignInterview] Found participant ${participant._id}, building response...`);

    const aiScore   = typeof finalReport.overallScore === "number" ? Math.round(finalReport.overallScore) : null;
    const aiSummary = finalReport.summary ?? null;

    // Build interviewTranscript — filter out system messages, keep interviewer + candidate turns
    const interviewTranscript = conversation
      .filter(e => e.type === "interviewer" || e.type === "candidate")
      .map(e => ({
        role:      e.type === "interviewer" ? "agent" : "candidate",
        message:   e.content || "",
        timestamp: e.timestamp ? new Date(e.timestamp) : new Date(),
      }));

    // Build $set payload — fields differ per module type
    const $setData = {
      campaign:            campaignId,
      participant:         participant._id,
      moduleType,
      aiScore,
      aiSummary,
      interviewTranscript,
    };

    if (moduleType === "SKILL_TEST") {
      // breakdown as array: [{ area, label, score }] — one entry per coverage area
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
      // AI_INTERVIEW — store soft-skill sub-scores in testResults.breakdown as array
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

    console.log(`📝 [CampaignInterview] Upserting CampaignResponse — campaign=${campaignId} participant=${participant._id} moduleType=${moduleType} aiScore=${aiScore} turns=${interviewTranscript.length}`);

    // Upsert CampaignResponse
    const savedResponse = await CampaignResponse.findOneAndUpdate(
      { campaign: campaignId, participant: participant._id, moduleType },
      { $set: $setData },
      { upsert: true, new: true, runValidators: false },
    );

    console.log(`✅ [CampaignInterview] CampaignResponse saved — _id=${savedResponse._id}`);

    // Mark participant COMPLETED + update moduleProgress
    participant.status         = "COMPLETED";
    participant.completedAt    = new Date();
    participant.moduleProgress = {
      moduleType,
      status:      "COMPLETED",
      completedAt: new Date(),
      responseRef: savedResponse._id,
    };

    await participant.save();

    console.log(`✅ [CampaignInterview] Participant updated — _id=${participant._id} status=COMPLETED`);
  }

  // ── Session storage ─────────────────────────────────────────────────────────

  /**
   * Store a campaign session directly in Redis, bypassing the standard
   * createSession() which requires intelligenceContext.focusAreas.
   */
  async _saveSession(sessionId, sessionData) {
    const mgr = this.sessionManager;
    if (!mgr.client || !mgr.isConnected) {
      throw new Error(
        "Redis not connected — cannot create campaign interview session",
      );
    }
    const key = mgr.sessionPrefix + sessionId;
    await mgr.client.setEx(key, mgr.sessionTTL, JSON.stringify(sessionData));
    console.log(`✅ [CampaignInterview] Session ${sessionId} stored in Redis`);
    return sessionData;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _buildSkillContext(skill) {
    const s = skill || "General Programming";
    return {
      type: "SKILL_TEST",
      skill: s,
      topic: s,
      systemPrompt: `You are a senior technical interviewer conducting a rigorous ${s} skill assessment.

ROLE
Act as a knowledgeable, professional, and empathetic interviewer — like a senior engineer interviewing a peer. Your tone should be encouraging yet evaluative. Make the candidate feel at ease while genuinely testing their depth.

INTERVIEW PROGRESSION
Phase 1 – Warm-up (first 2 questions):
  Broad, approachable questions about experience level and general familiarity with ${s}.
  Goal: break the ice, calibrate seniority level.
  Example style: "How long have you been working with ${s} and what kinds of projects have you used it on?"

Phase 2 – Exploration (next 2–3 questions):
  Core concepts, common patterns, and practical application.
  Mix conceptual understanding with real-world usage.
  Example styles: "How does X work internally?", "How have you used Y in a production context?"

Phase 3 – Deep-dive (next 2–3 questions):
  Advanced topics, edge cases, performance considerations, architectural trade-offs.
  Push for genuine depth — probe if answers are shallow.
  Example styles: "What would happen if...?", "How would you approach optimizing...?"

Phase 4 – Closing (last 1–2 questions):
  Reflection, best practices, lessons learned.
  Example styles: "What’s a mistake you made with ${s} and what did you learn?", "What advice would you give a junior developer starting with ${s}?"

QUESTION TYPE ROTATION — always vary across:
  • Conceptual   → test understanding of how/why things work
  • Applied      → test hands-on experience with real projects
  • Scenario     → present a problem and ask how they’d solve it
  • Best-practice → probe for quality standards and code hygiene
  • Problem-solving → give a challenge and evaluate their reasoning

ANTI-REPETITION RULES
  – Never ask two conceptual questions in a row
  – Never reuse the same example, framework feature, or scenario
  – If a candidate gave an excellent answer, build on it — don’t repeat the same angle
  – If a candidate gave a poor answer, simplify slightly and try a different angle, don’t abandon the area

RESPONSE QUALITY ADAPTATION
  – Excellent answer → increase difficulty, go deeper, ask about edge cases
  – Good answer → probe one specific detail further before moving on
  – Fair answer → stay at the same level, try a different angle
  – Poor/avoided → give a simpler follow-up or pivot to a related area

STYLE
  – Concise, clear questions (one thing at a time — no compound questions)
  – Brief acknowledgment of the previous answer before each new question (1 phrase max)
  – Professional but never cold or robotic`,
    };
  }

  _buildAgentContext(agentPrompt, campaign) {
    const rawInput    = agentPrompt?.trim() || "";
    const topic       = rawInput || campaign.title || "general assessment";
    // A real behavioral prompt has instructions; a short title does not
    const isRealPrompt = rawInput.length > 120;

    const conductRules = `
INTERVIEW CONDUCT RULES
- Ask one question at a time — no compound questions.
- Vary question types every turn: behavioral, situational, technical (if relevant), motivational, problem-solving.
- Acknowledge the candidate’s previous answer with one brief phrase before each new question.
- Adapt difficulty based on answer quality (deeper if excellent, simpler if poor).
- Never repeat the same angle, example, or scenario twice.
- Every question must be directly relevant to the interview topic: "${topic}".`;

    let systemPrompt;

    if (isRealPrompt) {
      // The agent prompt is a real behavioral brief — append conduct rules to it
      systemPrompt = `${rawInput}\n\n---\n${conductRules}`;
    } else {
      // Short title (e.g. "React Test", "Leadership") — build a complete topic-focused prompt
      systemPrompt = `You are an experienced interviewer conducting a structured assessment on the topic: "${topic}".
Campaign: "${campaign.title}"

INTERVIEW FOCUS
Every single question you ask must be directly and specifically about "${topic}".
Do not ask generic HR questions unrelated to this topic unless used as a brief warm-up opener.

ROLE
Act as a knowledgeable, professional, and empathetic interviewer. Your tone is encouraging yet evaluative.
You combine behavioral, situational, technical, and problem-solving questions to build a complete picture of the candidate’s capabilities in "${topic}".

INTERVIEW PROGRESSION
Phase 1 – Warm-up: Ask about the candidate’s overall experience with "${topic}" — how long, in what context.
Phase 2 – Exploration: Probe specific knowledge, past projects, and practical application of "${topic}".
Phase 3 – Deep-dive: Test advanced understanding, trade-offs, edge cases, and design decisions related to "${topic}".
Phase 4 – Closing: Ask about best practices, lessons learned, or an achievement they’re proud of involving "${topic}".

QUESTION TYPE ROTATION (always vary):
  • Conceptual     → "How does X work in the context of ${topic}?"
  • Applied        → "Tell me about a project where you used ${topic}. What did you build?"
  • Behavioral     → "Tell me about a challenge you faced with ${topic} and how you solved it."
  • Situational    → "If you had to use ${topic} to solve [problem], how would you approach it?"
  • Best-practice  → "What are the most common mistakes people make with ${topic}?"

${conductRules}`;
    }

    return {
      type:          "AI_INTERVIEW",
      topic,
      systemPrompt,
      campaignTitle: campaign.title,
    };
  }

  async _generateGreeting(context, moduleType, skill, onChunk) {
    const systemPrompt = context.systemPrompt;
    const topic        = context.topic || skill || "this subject";
    const userMsg =
      moduleType === "SKILL_TEST"
        ? `Generate a warm, professional opening message to start a ${topic} skill assessment.
The message must:
1. Greet the candidate using "I" — do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Set expectations briefly — mention it will be a conversational assessment covering ${topic} from fundamentals to advanced topics.
3. End with a natural warm-up question asking about their experience level with ${topic} and the kinds of projects they've used it on.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets.
Tone: encouraging, professional, human. Not robotic.
Length: 3–4 sentences maximum. No bullet points, no headers.`
        : `Generate a warm, professional opening message to start an interview on the topic: "${topic}".
The message must:
1. Greet the candidate using "I" — do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Briefly mention the interview will focus on "${topic}" and that it's a conversation, not a test.
3. End with an open warm-up question related to "${topic}" — for example, asking about their overall experience with it or how they've worked with it in the past.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets.
Tone: warm, welcoming, professional. Not robotic or formal.
Length: 3–4 sentences maximum. No bullet points, no headers.`;

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
        "⚠️ [CampaignInterview] Greeting generation failed:",
        e.message,
      );
      return this._fallbackGreeting(moduleType, skill);
    }
  }

  _fallbackGreeting(moduleType, skill) {
    const topic = skill || "technical";
    return moduleType === "SKILL_TEST"
      ? `Welcome! I'm your interviewer today and I'll be guiding you through a ${topic} assessment. We'll cover a range of topics from fundamentals to practical usage. To get started, could you tell me about your experience with ${topic} and the kinds of projects you've worked on?`
      : `Welcome! I'm your interviewer today. This will be a relaxed conversation — not a test — so feel free to speak freely. To kick things off, could you give me a quick overview of your background and what you've been working on recently?`;
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
Be objective, evidence-based, and specific — reference actual things the candidate said, not generic observations.

════ INTERVIEW TYPE ════
${moduleType}

════ COVERAGE ACHIEVED ════
${coverageLines}
Overall: ${Math.round(coverage.overall || 0)}%

════ FULL CONVERSATION ════
${conversationText.slice(0, 4500)}

════ SCORING GUIDELINES ════
overallScore (0–100):
  90–100 = Exceptional — would hire immediately, clear standout
  75–89  = Strong — above expectations, recommend hire
  60–74  = Solid — meets expectations with some gaps
  45–59  = Mixed — some good areas but significant gaps
  0–44   = Below bar — does not meet expectations

communicationScore: clarity, structure, and effectiveness of expression
confidenceScore: how decisive and self-assured responses were (not arrogance)
clarityScore: how precise, focused, and well-organized answers were
engagementScore: enthusiasm, curiosity, and active participation

recommendation rules:
  strong_hire → overallScore ≥ 85
  hire        → overallScore 70–84
  consider    → overallScore 50–69
  reject      → overallScore < 50

Respond ONLY with valid JSON — no markdown, no extra text:
{
  "overallScore": <0-100>,
  "summary": "<2–3 sentences: what stood out most — both positive and developmental — grounded in specific answers they gave>",
  "strengths": ["<3–5 specific, evidence-based strengths observed during the interview>"],
  "areasForImprovement": ["<2–4 concrete, actionable areas to develop>"],
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
    });

    const fallback = {
      analysis: { quality: "fair", score: 50, completeness: "partial", keyPoints: [] },
      coverageUpdates: [],
      decision: shouldEnd ? "end_interview" : "next_question",
      questionType: "situational",
      nextQuestion: shouldEnd
        ? "Thank you so much for your time today — I really enjoyed our conversation. That brings us to the end of this session."
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
      console.warn("⚠️ [CampaignInterview] Combined turn failed:", e.message);
      return fallback;
    }
  }
}

module.exports = new CampaignInterviewService();
