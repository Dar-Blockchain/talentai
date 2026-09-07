'use strict';

/**
 * Per-turn logic — everything that runs after a candidate answers:
 *   cleanupTranscript                — fix accent-driven speech-to-text mis-hearings (LLM, non-blocking)
 *   combinedAnalysis                 — ONE LLM call: quality + skills + coverage + style + shouldEnd
 *   updateCandidateProfile           — fold the analysis into the running candidate profile (pure)
 *   decideQuestionStrategy           — bridge / probe / transition / validate (pure)
 *   selectQuestionStyle              — pick a question style with anti-repeat rotation (pure)
 *   computeRunningScore              — deterministic live score after each answer (pure)
 *   detectQuestionComplexity         — classify a generated question (LLM)
 *   updateRealTimeReportIntelligently — refresh the live report (LLM)
 *   updateQualityCounters            — consecutive good/bad answer streaks
 *   shouldEndInterview               — rule-based checks, then an LLM verdict
 */

const bedrock = require('../../../utils/bedrock-client');
const logger = require('../../../utils/logger');
const { AIUtils } = require('./interview.ai');
const promptBundle = require('../prompt-bundle');

// ─────────────────────────────────────────────────────────────────────────────
// Transcript cleanup — runs before analysis, fixes speech-to-text mis-hearings
// ─────────────────────────────────────────────────────────────────────────────

const CLEANUP_TIMEOUT_MS = 3000;
const MIN_LEN_FOR_CLEANUP = 20;
const SKIP_MARKER = '[SKIPPED]';

function extractJdKeywords(session) {
  const jd = session?.jobData || session?.jobDetails || session?.config?.jobData || {};
  const skills = []
    .concat(jd?.skillAnalysis?.requiredSkills || [])
    .concat(jd?.skillAnalysis?.softSkills || [])
    .map(s => s?.name)
    .filter(Boolean);
  const cfgSkills = (session?.config?.skills || session?.config?.requiredSkills || [])
    .map(s => typeof s === 'string' ? s : s?.name)
    .filter(Boolean);
  return [...new Set([...skills, ...cfgSkills])].slice(0, 40);
}

function looksLikeParaphrase(original, cleaned) {
  if (!cleaned) return true;
  const ol = original.trim().length;
  const cl = cleaned.trim().length;
  if (cl < ol * 0.6) return true;
  if (cl > ol * 1.6) return true;
  return false;
}

/**
 * Non-blocking transcript cleanup for accent-driven speech-to-text errors.
 * Fixes only likely mis-hearings (technical terms, proper nouns, phonetic substitutions).
 * Never paraphrases. On any failure returns the original transcript.
 *
 * @param {string} transcript
 * @param {object} ctx - { session, lastQuestion }
 * @returns {Promise<string>}
 */
async function cleanupTranscript(transcript, { session, lastQuestion } = {}) {
  if (!transcript || typeof transcript !== 'string') return transcript;
  const raw = transcript.trim();
  if (raw === SKIP_MARKER) return raw;
  if (raw.length < MIN_LEN_FOR_CLEANUP) return raw;

  const jdKeywords = session ? extractJdKeywords(session) : [];

  const systemPrompt = [
    'You are a transcription cleanup assistant for live technical interviews.',
    'The candidate speaks accented English (often Nigerian, Indian, Filipino or another West African / South Asian variant).',
    'The transcript is from real-time speech-to-text and may contain mis-hearings on:',
    '- technical terms ("Nexus" → "Next.js", "no JS" → "Node.js", "express us" → "Express", "type strip" → "TypeScript", "kew barnets" → "Kubernetes")',
    '- proper nouns (candidate name, company name, prior employers, product names)',
    '- accent-driven phonetic substitutions ("tink"→"think", "dat"→"that", "wit"→"with", "de"→"the")',
    '',
    'RULES (strict):',
    '1. Return ONLY the corrected transcript. No preamble, no quotes, no explanation.',
    '2. Do NOT paraphrase, summarize, add words, change tense, or expand contractions.',
    '3. Do NOT invent facts, technologies, or dates that were not spoken.',
    '4. Preserve the candidate\'s grammar and word order — only fix words that look like transcription errors.',
    '5. If the transcript is already clean, return it exactly unchanged.',
    '6. Never say "I cannot" or "I don\'t know" — return the original transcript if unsure.',
  ].join('\n');

  const userContext = [
    lastQuestion ? `Last interviewer question: ${String(lastQuestion).slice(0, 400)}` : null,
    jdKeywords.length ? `JD keywords (candidate is likely to mention): ${jdKeywords.join(', ')}` : null,
    '',
    'Transcript to clean:',
    raw,
  ].filter(Boolean).join('\n');

  try {
    const { content } = await bedrock.callLLM({
      systemPrompt,
      messages: [{ role: 'user', content: userContext }],
      temperature: 0.0,
      maxTokens: Math.min(1024, Math.ceil(raw.length * 1.5 / 3)), // ~char/token≈3
      timeout: CLEANUP_TIMEOUT_MS,
      useFastModel: true, // Nova Lite
    });
    const cleaned = (content || '').trim().replace(/^["']|["']$/g, '');
    if (!cleaned) return raw;
    if (looksLikeParaphrase(raw, cleaned)) {
      logger.info?.('transcript-cleanup: rejected (looks like paraphrase)', { origLen: raw.length, cleanedLen: cleaned.length });
      return raw;
    }
    return cleaned;
  } catch (err) {
    logger.warn?.('transcript-cleanup: failed, using raw', { err: err?.message });
    return raw;
  }
}

/**
 * Combined Analysis â€” ONE LLM call replaces analyzeResponseIntelligence + analyzeResponseQuality
 * + analyzeCoverageIntelligently + shouldEndInterview (LLM part).
 */
async function combinedAnalysis(candidateResponse, session, lastQuestion, targetArea) {
  const systemPrompt = promptBundle(session.config.interviewType).buildCombinedAnalysisSystem(session);

  const coverageSummary = Object.fromEntries(
    Object.entries(session.coverage?.areas || {}).map(([a, d]) => [a, d.percentage + '%'])
  );

  const userPrompt = `INTERVIEWER QUESTION: "${lastQuestion || 'N/A'}"
TARGET AREA: ${targetArea || 'General'}
CANDIDATE RESPONSE: "${candidateResponse}"
CURRENT COVERAGE: ${JSON.stringify(coverageSummary)}
CONVERSATION LENGTH: ${session.conversation?.length || 0} exchanges`;

  try {
    const response = await bedrock.callLLM({
      systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.2,
      maxTokens: 2048,
      timeout: 25000,
      useFastModel: false,
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
function updateCandidateProfile(profile, analysis, turnNumber) {
  if (!profile) {
    profile = {
      communicationStyle: { verbosity: null, confidenceLevel: null, usesExamples: null },
      revealedExpertise: [], revealedGaps: [], mentionedProjects: [], anchors: [],
      currentDifficulty: 'intermediate', responseQualities: [],
    };
  }

  if (analysis.style) {
    profile.communicationStyle.verbosity      = analysis.style.verbosity;
    profile.communicationStyle.confidenceLevel = analysis.style.confidence;
    profile.communicationStyle.usesExamples   = analysis.style.usesExamples;
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
        relevantArea: topic.relevantArea,
      });
    }
    profile.anchors = profile.anchors.slice(-10);
  }

  profile.responseQualities.push(analysis.quality?.score ?? 0);
  const avg = profile.responseQualities.reduce((a, b) => a + b, 0) / profile.responseQualities.length;
  profile.currentDifficulty = avg >= 75 ? 'advanced' : avg >= 50 ? 'intermediate' : 'foundational';

  return profile;
}

/**
 * Decide question strategy based on analysis + profile + coverage. Pure logic â€” no LLM call.
 * Returns one of 4 modes: bridge, probe, transition, validate.
 */
function decideQuestionStrategy(analysis, candidateProfile, coverage, session) {
  const areas = coverage.areas || {};
  const currentArea = session.currentFocusArea;
  const questionsInArea = areas[currentArea]?.questionsAsked || 0;

  // PASS/SKIP: If candidate just passed, immediately transition to different area
  const lastCandidateEntry = session.conversation?.filter(e => e.type === 'candidate').slice(-1)[0];
  const lastMeta = lastCandidateEntry?.metadata;
  if (lastMeta?.answeredQuestion === false || lastMeta?.completeness === 'avoided') {
    const weakest = Object.entries(areas)
      .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed && !d.disqualified)
      .sort((a, b) => a[1].percentage - b[1].percentage)[0];
    if (weakest) {
      return {
        mode: 'transition',
        targetArea: weakest[0],
        context: `Candidate passed on ${currentArea} â€” moving to ${weakest[0]}`,
      };
    }
  }

  // HARD CAP: After 2 questions in current area, always transition to weakest area
  if (questionsInArea >= 2 && currentArea) {
    const weakest = Object.entries(areas)
      .filter(([name, d]) => name !== currentArea && d.percentage < 70 && !d.completed && !d.disqualified)
      .sort((a, b) => a[1].percentage - b[1].percentage)[0];
    if (weakest) {
      return {
        mode: 'transition',
        targetArea: weakest[0],
        context: `Forced transition after ${questionsInArea} questions in ${currentArea}`,
      };
    }
  }

  // Priority 1: BRIDGE â€” candidate mentioned something mapping to a gap
  for (const topic of (analysis.interestingTopics || [])) {
    if (topic.relevantArea && areas[topic.relevantArea] && areas[topic.relevantArea].percentage < 60 && !areas[topic.relevantArea].disqualified) {
      return {
        mode: 'bridge',
        targetArea: topic.relevantArea,
        context: `Candidate mentioned "${topic.topic}"`,
        unexploredAngles: topic.unexplored,
      };
    }
  }

  // Priority 2: PROBE â€” only 1 follow-up before moving on (never probe a disqualified area)
  if (currentArea && !areas[currentArea]?.disqualified && questionsInArea < 2 && areas[currentArea]?.percentage < 70 && analysis.quality?.depthLevel === 'surface') {
    return {
      mode: 'probe',
      targetArea: currentArea,
      context: 'Answer was surface-level â€” ask for specific example',
    };
  }

  // Priority 3: TRANSITION â€” explore weakest uncovered area (skip disqualified)
  const weakest = Object.entries(areas)
    .filter(([_, d]) => d.percentage < 70 && !d.completed && !d.disqualified)
    .sort((a, b) => a[1].percentage - b[1].percentage)[0];

  if (weakest) {
    const anchor = candidateProfile?.anchors?.find(a => a.unexplored?.length > 0);
    return {
      mode: 'transition',
      targetArea: weakest[0],
      context: anchor ? `Bridge from "${anchor.topic}" to ${weakest[0]}` : `Transition to ${weakest[0]}`,
    };
  }

  // Priority 4: VALIDATE â€” never target a disqualified area
  const validateTarget = (currentArea && !areas[currentArea]?.disqualified)
    ? currentArea
    : Object.keys(areas).find(k => !areas[k].disqualified) || Object.keys(areas)[0];
  return {
    mode: 'validate',
    targetArea: validateTarget,
    context: 'Ask a final validation question',
  };
}

/**
 * Select question style â€” pure logic, no LLM call (~0ms).
 * Picks from universal styles + framework-defined styles + direct, with rotation to avoid repeats.
 */
function selectQuestionStyle(session, analysis, questionStrategy) {
  const { UNIVERSAL_STYLES, FRAMEWORK_STYLE_INSTRUCTIONS } = promptBundle(session.config.interviewType);
  const turnNumber    = Math.floor((session.conversation?.length || 0) / 2);
  const styleHistory  = session.questionStyleHistory || [];
  const lastStyle     = styleHistory.length > 0 ? styleHistory[styleHistory.length - 1] : null;
  const lastTwoStyles = new Set(styleHistory.slice(-2));

  const frameworkStyles  = session.agentPersona?.evaluationFramework?.questionStyles || [];
  const availableStyles  = [];

  availableStyles.push(UNIVERSAL_STYLES.situational);

  if (turnNumber >= 2) {
    availableStyles.push(UNIVERSAL_STYLES['problem-finding']);
  }

  const lastQuality    = analysis?.quality?.score || 50;
  const lastDepth      = analysis?.quality?.depthLevel;
  const lastConfidence = session.candidateProfile?.communicationStyle?.confidenceLevel;
  if (
    turnNumber >= 1 &&
    (lastQuality >= 55 || lastConfidence === 'confident') &&
    lastDepth !== 'surface' &&
    questionStrategy?.mode !== 'transition'
  ) {
    availableStyles.push(UNIVERSAL_STYLES.challenge);
  }

  for (const styleName of frameworkStyles) {
    if (styleName === 'situational') continue;
    const instruction = FRAMEWORK_STYLE_INSTRUCTIONS[styleName];
    if (instruction) {
      availableStyles.push({ id: styleName, instruction, minTurn: 0, requiresContext: false });
    }
  }

  availableStyles.push({ id: 'direct', instruction: null, minTurn: 0, requiresContext: false });

  let eligible = availableStyles.filter(s => s.id !== lastStyle);
  const fresh  = eligible.filter(s => !lastTwoStyles.has(s.id));
  const pool   = fresh.length > 0 ? fresh : eligible;

  const weighted = [];
  for (const style of pool) {
    const weight = UNIVERSAL_STYLES[style.id] ? 3 : (style.id === 'direct' ? 1 : 2);
    for (let i = 0; i < weight; i++) weighted.push(style);
  }

  return weighted[Math.floor(Math.random() * weighted.length)];
}

/**
 * Compute running score deterministically after each candidate response.
 * Pure logic â€” no LLM call (~0ms). Same formula as generateFinalReport().
 */
function computeRunningScore(session, updatedProfile, finalCoverage, analysis) {
  const persona      = session.agentPersona || {};
  const conversation = session.conversation || [];
  const existing     = session.runningScoreData || { strengths: [], weaknesses: [] };

  const responseQualities = updatedProfile.responseQualities || [];
  const qualityScore = responseQualities.length > 0
    ? Math.round(responseQualities.reduce((a, b) => a + b, 0) / responseQualities.length)
    : 0;

  const coverageScore = finalCoverage.overall || 0;

  const mustHaves   = persona.idealCandidate?.mustHaveSkills || [];
  const demonstrated = updatedProfile.revealedExpertise || [];
  let skillsScore;
  if (mustHaves.length > 0) {
    const covered = mustHaves.filter(s => {
      const sl = s.toLowerCase();
      return demonstrated.some(d => {
        const dl = d.toLowerCase();
        return dl.includes(sl) || sl.includes(dl) ||
          sl.split(/[\s,/]+/).some(w => w.length > 2 && dl.includes(w)) ||
          dl.split(/[\s,/]+/).some(w => w.length > 2 && sl.includes(w));
      });
    });
    skillsScore = Math.round((covered.length / mustHaves.length) * 100);
  } else {
    skillsScore = 50;
  }

  const depths      = conversation.filter(e => e.type === 'candidate' && e.metadata?.depthLevel).map(e => e.metadata.depthLevel);
  const depthValues = { deep: 100, moderate: 80, surface: 40 };
  const depthScore  = depths.length > 0
    ? Math.round(depths.reduce((sum, d) => sum + (depthValues[d] || 30), 0) / depths.length)
    : 20;

  const commStyle = updatedProfile.communicationStyle || {};
  let communicationScore = 30;
  if (commStyle.confidenceLevel === 'confident') communicationScore += 20;
  else if (commStyle.confidenceLevel === 'moderate') communicationScore += 10;
  if (commStyle.usesExamples) communicationScore += 15;
  if (commStyle.verbosity === 'detailed') communicationScore += 10;
  else if (commStyle.verbosity === 'concise') communicationScore += 5;
  communicationScore = Math.min(100, communicationScore);

  const isNonAnswering = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;
  const effectiveSkills = isNonAnswering ? 0 : skillsScore;
  const effectiveDepth  = isNonAnswering ? 0 : depthScore;
  const effectiveComm   = isNonAnswering ? 0 : communicationScore;

  const overall = isNonAnswering
    ? Math.max(0, Math.round((qualityScore * 0.40) + (coverageScore * 0.10)))
    : Math.round(
        (qualityScore * 0.40) +
        (coverageScore * 0.10) +
        (skillsScore * 0.25) +
        (depthScore * 0.15) +
        (communicationScore * 0.10)
      );

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
    scores: {
      overall, quality: qualityScore, coverage: coverageScore,
      skills: effectiveSkills, depth: effectiveDepth, communication: effectiveComm,
    },
    strengths: strengths.slice(0, 10),
    weaknesses: weaknesses.slice(0, 10),
    lastUpdated: new Date().toISOString(),
  };

  return result;
}

/**
 * Detect question complexity using AI.
 */
async function detectQuestionComplexity(questionText, interviewType) {
  try {
    const response = await bedrock.callLLM({
      systemPrompt: promptBundle(interviewType).DETECT_COMPLEXITY_SYSTEM,
      messages: [{ role: 'user', content: `Analyze this question: "${questionText}"` }],
      temperature: 0.2,
      maxTokens: 200,
      timeout: 30000,
      useFastModel: true,
    });
    const parsed = AIUtils.parseJSONResponse(response.content, 'detectQuestionComplexity');
    return parsed.complexity || 'medium';
  } catch (error) {
    console.error('âŒ Error detecting question complexity:', error.message);
    return 'medium';
  }
}

/**
 * Update real-time report with AI intelligence.
 */
async function updateRealTimeReportIntelligently(session, candidateResponse, coverageAnalysis, decisionAnalysis) {
  try {
    const trimmedReport = {
      strengths:       (session.realTimeReport?.strengths  || []).slice(-5),
      weaknesses:      (session.realTimeReport?.weaknesses || []).slice(-5),
      overallProgress: session.realTimeReport?.overallProgress || 0,
    };
    const trimmedDecision = {
      decision:   decisionAnalysis?.decision,
      reasoning:  decisionAnalysis?.reasoning,
      targetArea: decisionAnalysis?.targetArea,
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
      systemPrompt: promptBundle(session.config.interviewType).REAL_TIME_REPORT_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.4,
      maxTokens: 1500,
      timeout: 30000,
      useFastModel: false,
    });

    const reportUpdate = AIUtils.parseJSONResponse(response.content, 'updateRealTimeReport');
    return {
      ...reportUpdate,
      lastUpdated: new Date().toISOString(),
      aiPowered: true,
      metadata: {
        basedOnCoverageAnalysis: true,
        basedOnDecisionAnalysis: true,
        updateTrigger: 'ai_intelligence_processing',
      },
    };
  } catch (error) {
    console.error('Error updating real-time report intelligently:', error);
    return session.realTimeReport;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Termination — should the interview end?
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check consecutive answer quality counters and persist them to session.
 * @param {object} sessionManager - Redis session manager instance
 */
async function updateQualityCounters(sessionManager, sessionId, qualityScore) {
  try {
    const session = await sessionManager.getSession(sessionId);
    if (!session || !session.qualityTracking) return;

    const tracking = session.qualityTracking;
    const BAD_THRESHOLD  = 40;
    const GOOD_THRESHOLD = 75;

    if (qualityScore < BAD_THRESHOLD) {
      tracking.consecutiveBadAnswers++;
      tracking.consecutiveGoodAnswers = 0;
      tracking.totalBadAnswers++;
    } else if (qualityScore >= GOOD_THRESHOLD) {
      tracking.consecutiveGoodAnswers++;
      tracking.consecutiveBadAnswers = 0;
      tracking.totalGoodAnswers++;
    } else {
      tracking.consecutiveBadAnswers = 0;
      tracking.consecutiveGoodAnswers = 0;
    }

    tracking.lastQualityScore = qualityScore;
    await sessionManager.updateSession(sessionId, { qualityTracking: tracking });
  } catch (error) {
    console.error('âŒ Failed to update quality counters:', error.message);
  }
}

/**
 * Determine whether the interview should end.
 * Applies rule-based checks first (time, quality counters, avg quality),
 * then falls back to an LLM evaluation when sufficient coverage data exists.
 */
async function shouldEndInterview(session, totalDuration) {
  try {
    // â° TIME LIMIT CHECK (hard cap = target Ã— 1.5, e.g., 45 min)
    if (session.interviewStartTime) {
      const elapsedMinutes = (Date.now() - session.interviewStartTime) / 60000;
      const maxDuration    = session.maxDurationMinutes || 45;
      if (elapsedMinutes >= maxDuration) {
        return {
          shouldEnd: true,
          confidence: 100,
          reasoning: `Interview time limit of ${maxDuration} minutes has been reached.`,
          completedObjectives: ['Time-based completion'],
          remainingGaps: [],
          recommendedAction: 'End interview - time limit reached',
          terminationReason: 'time_limit_reached',
          message: "Thank you for your time. We've completed our scheduled time for today.",
          elapsedTime: elapsedMinutes,
          score: 'time_limit',
        };
      }
    }

    // ðŸ“Š QUALITY-BASED TERMINATION
    if (session.qualityTracking) {
      const tracking       = session.qualityTracking;
      const overallCoverage = session.coverage?.overall || 0;

      if (tracking.consecutiveBadAnswers >= 8) {
        return {
          shouldEnd: true, confidence: 95,
          reasoning: `Candidate provided 8 consecutive low-quality responses (quality < 40), indicating consistent difficulty with technical questions.`,
          completedObjectives: ['Performance assessment completed - insufficient technical competency'],
          remainingGaps: [],
          recommendedAction: 'End interview - insufficient technical competency demonstrated',
          terminationReason: 'poor_quality',
          message: "Thank you for your time. Let's conclude our interview here.",
          badAnswerCount: tracking.consecutiveBadAnswers,
          score: 'poor',
        };
      }

      if (tracking.consecutiveGoodAnswers >= 8 && overallCoverage >= 60) {
        return {
          shouldEnd: true, confidence: 95,
          reasoning: `Candidate demonstrated 8 consecutive high-quality responses (quality >= 75), showing strong technical competency.`,
          completedObjectives: ['Technical competency validated', 'Strong performance demonstrated', 'Sufficient evidence of expertise'],
          remainingGaps: [],
          recommendedAction: 'End interview - candidate clearly qualified',
          terminationReason: 'excellent_quality',
          message: "Excellent! You've demonstrated strong understanding. Thank you for your time.",
          goodAnswerCount: tracking.consecutiveGoodAnswers,
          score: 'excellent',
        };
      }
    }

    // Average quality checks
    const allQualityScores = session.conversation
      .filter(entry => entry.type === 'candidate')
      .map(entry => entry.metadata?.qualityScore || entry.aiAnalysis?.qualityScore)
      .filter(score => score !== undefined);

    const overallQualityAverage = allQualityScores.length > 0
      ? allQualityScores.reduce((sum, score) => sum + score, 0) / allQualityScores.length
      : 50;

    const candidateResponseCount = Math.floor(session.conversation.length / 2);

    if (candidateResponseCount >= 6 && overallQualityAverage < 35) {
      return {
        shouldEnd: true, confidence: 95,
        reasoning: `Candidate consistently provides insufficient technical responses (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Early termination to save time.`,
        completedObjectives: ['Performance assessment completed - insufficient technical depth'],
        remainingGaps: [],
        recommendedAction: 'End interview - insufficient technical competency demonstrated',
        earlyTermination: true,
        terminationReason: 'poor_performance',
        message: "Thank you for your time. Let's conclude our interview here.",
        qualityScore: overallQualityAverage, responseCount: candidateResponseCount,
        score: 'poor',
      };
    }

    if (candidateResponseCount >= 6 && overallQualityAverage >= 85) {
      return {
        shouldEnd: true, confidence: 95,
        reasoning: `Candidate consistently demonstrates excellent competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses).`,
        completedObjectives: ['Technical competency validated', 'Consistently excellent responses'],
        remainingGaps: [],
        recommendedAction: 'End interview - candidate clearly qualified',
        earlySuccess: true,
        terminationReason: 'early_excellence',
        message: "Excellent! You've demonstrated outstanding understanding across all topics. Thank you for your time.",
        qualityScore: overallQualityAverage, responseCount: candidateResponseCount,
        score: 'excellent',
      };
    }

    const overallCov = session.coverage?.overall || 0;
    if (candidateResponseCount >= 8 && overallQualityAverage >= 80 && overallCov >= 60) {
      return {
        shouldEnd: true, confidence: 90,
        reasoning: `Candidate consistently demonstrates strong technical competency (${overallQualityAverage.toFixed(1)}/100 average quality over ${candidateResponseCount} responses). Sufficient evidence gathered.`,
        completedObjectives: ['Technical competency validated', 'Strong performance across technical focus areas', 'Sufficient evidence of expertise'],
        remainingGaps: [],
        recommendedAction: 'End interview - candidate clearly qualified',
        earlySuccess: true,
        terminationReason: 'excellent_performance',
        message: "Excellent! You've demonstrated strong understanding. Thank you for your time.",
        qualityScore: overallQualityAverage, responseCount: candidateResponseCount,
        score: 'excellent',
      };
    }

    // Coverage-based guard: skip LLM if insufficient evidence
    const currentOverallCoverage = session.coverage?.overall || 0;
    const areasExplored = Object.values(session.coverage?.areas || {}).filter(a => a.percentage > 0).length;
    const totalAreas    = Object.keys(session.coverage?.areas || {}).length;

    if (currentOverallCoverage < 40 || areasExplored < Math.min(2, totalAreas)) {
      return {
        shouldEnd: false,
        confidence: 0,
        reasoning: `Coverage at ${currentOverallCoverage}% with ${areasExplored}/${totalAreas} areas explored â€” insufficient data to assess candidate`,
      };
    }

    // LLM evaluation (sufficient evidence available)
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
      systemPrompt: promptBundle(session.config.interviewType).SHOULD_END_INTERVIEW_SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.1,
      maxTokens: 500,
      timeout: 30000,
      useFastModel: true,
    });

    return AIUtils.parseJSONResponse(response.content, 'shouldEndInterview');
  } catch (error) {
    console.error('Error determining interview end:', error);
    return { shouldEnd: false, confidence: 0, reasoning: 'Analysis failed' };
  }
}

module.exports = {
  cleanupTranscript,
  combinedAnalysis,
  updateCandidateProfile,
  decideQuestionStrategy,
  selectQuestionStyle,
  computeRunningScore,
  detectQuestionComplexity,
  updateRealTimeReportIntelligently,
  updateQualityCounters,
  shouldEndInterview,
};
