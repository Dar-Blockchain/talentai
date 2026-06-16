'use strict';

const bedrock = require('../../../helpers/bedrock.helpers');
const AIUtils  = require('./ai/ai.utils');
const {
  UNIVERSAL_STYLES,
  FRAMEWORK_STYLE_INSTRUCTIONS,
} = require('./prompts/generation.prompts');
const {
  REAL_TIME_REPORT_SYSTEM,
  DETECT_COMPLEXITY_SYSTEM,
  buildCombinedAnalysisSystem,
} = require('./prompts/analysis.prompts');

/**
 * Combined Analysis â€” ONE LLM call replaces analyzeResponseIntelligence + analyzeResponseQuality
 * + analyzeCoverageIntelligently + shouldEndInterview (LLM part).
 */
async function combinedAnalysis(candidateResponse, session, lastQuestion, targetArea) {
  const systemPrompt = buildCombinedAnalysisSystem(session);

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

  console.log(`ðŸ“Š [RunningScore] overall=${overall} (q=${qualityScore} c=${coverageScore} s=${effectiveSkills} d=${effectiveDepth} comm=${effectiveComm})${isNonAnswering ? ' NON-ANSWERING' : ''}`);
  return result;
}

/**
 * Detect question complexity using AI.
 */
async function detectQuestionComplexity(questionText) {
  try {
    const response = await bedrock.callLLM({
      systemPrompt: DETECT_COMPLEXITY_SYSTEM,
      messages: [{ role: 'user', content: `Analyze this question: "${questionText}"` }],
      temperature: 0.2,
      maxTokens: 200,
      timeout: 30000,
      useFastModel: true,
    });
    const parsed = AIUtils.parseJSONResponse(response.content, 'detectQuestionComplexity');
    console.log('ðŸ” [Complexity] Detected:', { complexity: parsed.complexity, estimatedThinkingTime: parsed.estimatedThinkingTime });
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
      systemPrompt: REAL_TIME_REPORT_SYSTEM,
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

module.exports = {
  combinedAnalysis,
  updateCandidateProfile,
  decideQuestionStrategy,
  selectQuestionStyle,
  computeRunningScore,
  detectQuestionComplexity,
  updateRealTimeReportIntelligently,
};
