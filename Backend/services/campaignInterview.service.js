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

const bedrock       = require('../helpers/bedrock.helpers');
const sessionMgr    = require('../utils/redis-session-manager');
const Campaign      = require('../models/internalCampaign.model');
require('dotenv').config();

// ─── JSON helpers ─────────────────────────────────────────────────────────────

function parseJSON(raw, fallback) {
  try {
    let s = raw.trim();
    if (s.startsWith('```')) {
      const m = s.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (m) s = m[1];
    }
    return JSON.parse(s);
  } catch (_) {
    const a = raw.indexOf('{'), b = raw.lastIndexOf('}');
    if (a !== -1 && b > a) {
      try { return JSON.parse(raw.slice(a, b + 1)); } catch (_2) {}
    }
    return fallback;
  }
}

// ─── Coverage area defaults ────────────────────────────────────────────────────

const SKILL_TEST_AREAS = (skill) => ({
  fundamentals:    { label: `${skill} Fundamentals`,    percentage: 0, questionsAsked: 0, weight: 30 },
  practical_usage: { label: `Practical ${skill} Usage`, percentage: 0, questionsAsked: 0, weight: 25 },
  advanced_topics: { label: `Advanced ${skill} Topics`, percentage: 0, questionsAsked: 0, weight: 25 },
  best_practices:  { label: 'Best Practices & Patterns', percentage: 0, questionsAsked: 0, weight: 20 },
});

const AI_INTERVIEW_DEFAULT_AREAS = () => ({
  experience:    { label: 'Experience & Background',   percentage: 0, questionsAsked: 0, weight: 30 },
  competencies:  { label: 'Core Competencies',         percentage: 0, questionsAsked: 0, weight: 30 },
  motivation:    { label: 'Motivation & Culture Fit',  percentage: 0, questionsAsked: 0, weight: 20 },
  situational:   { label: 'Situational Judgment',      percentage: 0, questionsAsked: 0, weight: 20 },
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
        console.log('✅ [CampaignInterview] Service initialized (Redis already connected)');
        return true;
      }
      const ok = await Promise.race([
        this.sessionManager.initialize(),
        new Promise((_, r) => setTimeout(() => r(new Error('Redis timeout')), 5000)),
      ]).catch(err => {
        console.warn('⚠️ [CampaignInterview] Redis init failed:', err.message);
        return false;
      });
      console.log(ok
        ? '✅ [CampaignInterview] Service initialized with Redis'
        : '⚠️ [CampaignInterview] Service initialized WITHOUT Redis (degraded mode)');
      return true;
    } catch (e) {
      console.error('❌ [CampaignInterview] Init error:', e.message);
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
    const agentPrompt  = moduleConfig.agentPrompt || null;
    const skill        = moduleConfig.skill        || null;

    // 2. Build context for this interview type
    const context = moduleType === 'SKILL_TEST'
      ? this._buildSkillContext(skill)
      : this._buildAgentContext(agentPrompt, campaign);

    // 3. Determine coverage areas
    const coverageAreas = moduleType === 'SKILL_TEST'
      ? SKILL_TEST_AREAS(skill || 'the requested skill')
      : AI_INTERVIEW_DEFAULT_AREAS();

    // 4. Create Redis session
    const sessionData = {
      sessionId,
      campaignId,
      moduleType,
      context,
      conversation:   [],
      coverage:       { overall: 0, areas: coverageAreas },
      questionsAsked: 0,
      maxQuestions:   Math.max(5, Math.round(duration * 0.6)),
      config:         { duration, interviewType: moduleType },
      startedAt:      new Date().toISOString(),
      candidateId,
    };

    await this._saveSession(sessionId, sessionData);

    // 5. Generate greeting
    const greeting = await this._generateGreeting(context, moduleType, skill, onGreetingChunk);

    // Store greeting in conversation
    await this.sessionManager.addConversationEntry(sessionId, {
      type: 'interviewer', content: greeting, timestamp: new Date().toISOString(),
      metadata: { targetAreas: [Object.keys(coverageAreas)[0]] },
    });

    return {
      success:    true,
      sessionId,
      greeting,
      config: { duration, interviewType: moduleType, silenceIntelligence: null },
    };
  }

  // ── Process candidate response ──────────────────────────────────────────────

  async processCandidateResponse(sessionId, transcript) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    // Store candidate turn
    await this.sessionManager.addConversationEntry(sessionId, {
      type: 'candidate', content: transcript, timestamp: new Date().toISOString(),
    });

    const { context, moduleType, coverage, questionsAsked, maxQuestions, conversation } = session;

    // Last interviewer question
    const lastQuestion = [...(conversation || [])]
      .reverse()
      .find(e => e.type === 'interviewer')?.content || null;

    // Increment question counter
    const newCount = (questionsAsked || 0) + 1;
    await this.sessionManager.updateSession(sessionId, { questionsAsked: newCount });

    // Should we end?
    const shouldEnd = newCount >= maxQuestions;

    // Combined LLM call: analyse + decide + generate next
    const result = await this._combinedTurn(
      context, moduleType, conversation || [], transcript, lastQuestion,
      coverage, shouldEnd,
    );

    // Update coverage
    const updatedCoverage = this._applyCoverageUpdates(coverage, result.coverageUpdates);
    await this.sessionManager.updateSession(sessionId, { coverage: updatedCoverage });

    return {
      type:     result.decision,       // 'next_question' | 'follow_up' | 'end_interview'
      content:  result.nextQuestion,
      analysis: result.analysis,
      coverage: updatedCoverage,
      report:   result.report,
    };
  }

  // ── End interview ───────────────────────────────────────────────────────────

  async endInterview(sessionId) {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) return { success: true, sessionId };

    const finalReport = await this._generateFinalReport(session);
    return {
      success:     true,
      sessionId,
      finalReport,
      analytics:   { questionsAsked: session.questionsAsked, duration: session.config?.duration },
    };
  }

  // ── Session storage ─────────────────────────────────────────────────────────

  /**
   * Store a campaign session directly in Redis, bypassing the standard
   * createSession() which requires intelligenceContext.focusAreas.
   */
  async _saveSession(sessionId, sessionData) {
    const mgr = this.sessionManager;
    if (!mgr.client || !mgr.isConnected) {
      throw new Error('Redis not connected — cannot create campaign interview session');
    }
    const key = mgr.sessionPrefix + sessionId;
    await mgr.client.setEx(key, mgr.sessionTTL, JSON.stringify(sessionData));
    console.log(`✅ [CampaignInterview] Session ${sessionId} stored in Redis`);
    return sessionData;
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  _buildSkillContext(skill) {
    return {
      type:        'SKILL_TEST',
      skill:       skill || 'General Programming',
      systemPrompt: `You are a senior technical interviewer conducting a ${skill || 'technical'} skill assessment.
Your goal is to evaluate the candidate's proficiency in ${skill || 'the relevant technology'} through targeted technical questions.
Focus on: fundamentals, practical knowledge, advanced patterns, and best practices.
Be concise, professional, and adapt question difficulty based on the candidate's answers.`,
    };
  }

  _buildAgentContext(agentPrompt, campaign) {
    const defaultPrompt = `You are an experienced interviewer conducting a structured assessment for "${campaign.title}".
Evaluate the candidate across experience, competencies, motivation, and situational judgment.
Keep questions focused, professional, and relevant to the campaign objectives.`;
    return {
      type:        'AI_INTERVIEW',
      systemPrompt: agentPrompt || defaultPrompt,
      campaignTitle: campaign.title,
    };
  }

  async _generateGreeting(context, moduleType, skill, onChunk) {
    const systemPrompt = context.systemPrompt;
    const userMsg = moduleType === 'SKILL_TEST'
      ? `Generate a warm, professional greeting to start a ${skill} technical assessment.
         Introduce yourself briefly, explain what you'll cover, and ask the candidate to introduce themselves or confirm they're ready.
         Keep it under 3 sentences.`
      : `Generate a warm, professional greeting to start this interview session.
         Introduce yourself briefly, mention you'll have a conversation to get to know them better, and ask them to start with a brief self-introduction.
         Keep it under 3 sentences.`;

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
        temperature: 0.7,
        maxTokens: 200,
        timeout: 20000,
        useFastModel: true,
        onChunk,
      });
      return res.content || this._fallbackGreeting(moduleType, skill);
    } catch (e) {
      console.warn('⚠️ [CampaignInterview] Greeting generation failed:', e.message);
      return this._fallbackGreeting(moduleType, skill);
    }
  }

  _fallbackGreeting(moduleType, skill) {
    return moduleType === 'SKILL_TEST'
      ? `Welcome! I'm here to conduct your ${skill || 'technical'} assessment today. We'll go through a series of questions covering fundamentals and practical usage. Please go ahead and introduce yourself when you're ready.`
      : `Welcome! I'm glad you're here for this interview session. We'll have a conversation to learn more about your background and experience. Please start by telling me a bit about yourself.`;
  }

  async _combinedTurn(context, moduleType, conversation, transcript, lastQuestion, coverage, shouldEnd) {
    const coverageAreas = Object.entries(coverage.areas)
      .map(([k, v]) => `${k}: ${Math.round(v.percentage || 0)}%`)
      .join(', ');

    const conversationSummary = conversation
      .slice(-6)
      .map(e => `${e.type === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${e.content}`)
      .join('\n');

    const systemPrompt = context.systemPrompt;

    const userMsg = `
CONVERSATION HISTORY (last 6 turns):
${conversationSummary || '(interview just started)'}

CANDIDATE'S LATEST RESPONSE:
"${transcript}"

COVERAGE STATUS: ${coverageAreas}
SHOULD END INTERVIEW: ${shouldEnd}

Respond with a single JSON object:
{
  "analysis": {
    "quality": "poor|fair|good|excellent",
    "score": <0-100>,
    "completeness": "complete|partial|minimal|avoided",
    "keyPoints": ["..."]
  },
  "coverageUpdates": [
    { "area": "<area_key>", "increase": <0-25> }
  ],
  "decision": "next_question|follow_up|end_interview",
  "nextQuestion": "<the next question to ask, or a closing statement if ending>",
  "report": {
    "strengths": ["..."],
    "areasForImprovement": ["..."],
    "overallProgress": <0-100>
  }
}

RULES:
- If SHOULD END is true OR overall coverage across all areas >= 75%, set decision to "end_interview" and nextQuestion to a professional closing statement.
- Use "follow_up" if the candidate gave a vague or incomplete answer that needs clarification.
- Use "next_question" to move to a new topic/area.
- coverageUpdates: only include areas genuinely discussed; increase should reflect answer quality (0 for avoided/off-topic, up to 25 for deep expert answer).
- nextQuestion must be a single, clear, conversational question. No bullet lists.
`;

    const fallback = {
      analysis:        { quality: 'fair', score: 50, completeness: 'partial', keyPoints: [] },
      coverageUpdates: [],
      decision:        shouldEnd ? 'end_interview' : 'next_question',
      nextQuestion:    shouldEnd
        ? 'Thank you for your time today. That concludes our session!'
        : 'Can you tell me more about your experience in this area?',
      report: { strengths: [], areasForImprovement: [], overallProgress: 30 },
    };

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
        temperature: 0.5,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: false,
      });
      return parseJSON(res.content, fallback);
    } catch (e) {
      console.warn('⚠️ [CampaignInterview] Combined turn failed:', e.message);
      return fallback;
    }
  }

  _applyCoverageUpdates(coverage, updates = []) {
    const areas = { ...coverage.areas };
    for (const u of updates) {
      if (areas[u.area] && typeof u.increase === 'number') {
        areas[u.area] = {
          ...areas[u.area],
          percentage:     Math.min(100, (areas[u.area].percentage || 0) + u.increase),
          questionsAsked: (areas[u.area].questionsAsked || 0) + 1,
          lastUpdated:    new Date().toISOString(),
        };
      }
    }
    const totalWeight = Object.values(areas).reduce((s, a) => s + (a.weight || 25), 0);
    const overall = Math.round(
      Object.values(areas).reduce((s, a) => s + (a.percentage || 0) * (a.weight || 25), 0) / totalWeight
    );
    return { ...coverage, areas, overall };
  }

  async _generateFinalReport(session) {
    const { context, conversation, coverage, moduleType } = session;
    const systemPrompt = context.systemPrompt;

    const conversationText = (conversation || [])
      .map(e => `${e.type === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${e.content}`)
      .join('\n');

    const userMsg = `
Based on this interview conversation, generate a concise final assessment report.

INTERVIEW TYPE: ${moduleType}
COVERAGE: ${Object.entries(coverage.areas).map(([k, v]) => `${k}: ${Math.round(v.percentage || 0)}%`).join(', ')}

CONVERSATION:
${conversationText.slice(0, 4000)}

Respond with JSON:
{
  "overallScore": <0-100>,
  "summary": "2-3 sentence overall assessment of the candidate",
  "strengths": ["3-5 specific strengths observed"],
  "areasForImprovement": ["2-4 areas to develop"],
  "recommendation": "hire|strong_hire|consider|reject",
  "coverageSummary": { <area_key>: <0-100> },
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "clarityScore": <0-100>,
  "engagementScore": <0-100>
}

Score guidelines:
- communicationScore: how clearly and effectively the candidate expressed their ideas
- confidenceScore: how confident and assertive the candidate appeared in their answers
- clarityScore: how precise and structured the answers were (avoid vague or rambling)
- engagementScore: how engaged, enthusiastic, and interactive the candidate was
`;

    const base = Math.round(coverage.overall || 50);
    const fallback = {
      overallScore:       base,
      summary:            'Interview completed. Detailed analysis is being processed.',
      strengths:          ['Completed the full interview session'],
      areasForImprovement: [],
      recommendation:     'consider',
      coverageSummary:    Object.fromEntries(
        Object.entries(coverage.areas).map(([k, v]) => [k, Math.round(v.percentage || 0)])
      ),
      communicationScore: base,
      confidenceScore:    Math.round(base * 0.92),
      clarityScore:       Math.round(base * 1.05 > 100 ? 100 : base * 1.05),
      engagementScore:    Math.round(base * 0.94),
    };

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: 'user', content: userMsg }],
        temperature: 0.3,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: false,
      });
      return parseJSON(res.content, fallback);
    } catch (e) {
      console.warn('⚠️ [CampaignInterview] Final report failed:', e.message);
      return fallback;
    }
  }
}

module.exports = new CampaignInterviewService();
