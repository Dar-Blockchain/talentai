'use strict';

const bedrock = require('../../../utils/bedrock-client');
const AIUtils  = require('./ai/ai.utils');
const { detectJobCategory, getEvaluationFramework } = require('./config-manager');
const { buildGreetingSystem, buildSilenceUser } = require('./prompts/generation.prompts');
const { buildPostInterviewGreetingUser, buildAgentPersonaUser, buildFinalReportUser } = require('../post-interview/prompts/post-interview.prompts');
const { buildSkillInterviewGreetingUser } = require('../skill-interview/prompts/skill-interview.prompts');

const SKILL_INTERVIEW_TYPES = ['TECHNICAL_SKILL', 'SOFT_SKILL', 'ASSESSMENT', 'EVALUATION'];

/**
 * Build agent persona from job description â€” ONE LLM call at interview start.
 * Creates a job-aware AI profile with must-have skills, red flags, and evaluation framework.
 */
async function buildAgentPersona(jobData, interviewConfig) {
  const jobCategory         = interviewConfig.jobCategory || detectJobCategory(jobData.title, jobData.description);
  const evaluationFramework = getEvaluationFramework(jobCategory, interviewConfig.interviewType);

  let parsed;
  try {
    const analysis = await bedrock.callLLM({
      systemPrompt: 'You are an expert recruiter. Analyze this job and return ONLY a valid JSON object. No explanation, no reasoning, no text before or after the JSON.',
      messages: [{ role: 'user', content: buildAgentPersonaUser({
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
      useFastModel: true,
    });
    parsed = AIUtils.parseJSONResponse(analysis.content, 'buildAgentPersona');
  } catch (error) {
    console.warn('âš ï¸ [Persona] LLM analysis failed, using defaults:', error.message);
    parsed = AIUtils.getFallbackResponse('buildAgentPersona', '');
  }

  const llmFocusAreas    = parsed.focusAreas;
  const llmQuestionStyles = parsed.questionStyles;
  let finalEvaluationFramework;

  if (llmFocusAreas && typeof llmFocusAreas === 'object' && Object.keys(llmFocusAreas).length >= 3) {
    const totalWeight = Object.values(llmFocusAreas).reduce((sum, a) => sum + (a?.weight || 0), 0);
    if (totalWeight >= 80 && totalWeight <= 120) {
      const normFactor = 100 / totalWeight;
      for (const key of Object.keys(llmFocusAreas)) {
        llmFocusAreas[key].weight = Math.round(llmFocusAreas[key].weight * normFactor);
        if (!Array.isArray(llmFocusAreas[key].indicators)) {
          llmFocusAreas[key].indicators = [];
        }
      }
      finalEvaluationFramework = {
        focusAreas: llmFocusAreas,
        questionStyles: Array.isArray(llmQuestionStyles) && llmQuestionStyles.length > 0
          ? llmQuestionStyles
          : evaluationFramework.questionStyles,
      };
    } else {
      finalEvaluationFramework = evaluationFramework;
    }
  } else {
    finalEvaluationFramework = evaluationFramework;
  }


  return {
    job: {
      title: jobData.title,
      company: jobData.company || jobData.companyName,
      description: jobData.description,
      requirements: jobData.requirements || [],
      responsibilities: jobData.responsibilities || [],
      experienceLevel: jobData.experienceLevel || interviewConfig.context?.experienceLevel || 'mid',
    },
    interviewType: interviewConfig.interviewType,
    jobCategory,
    idealCandidate: parsed,
    evaluationFramework: finalEvaluationFramework,
    agentBehavior: {
      tone: parsed.agentTone || 'professional and conversational',
      domainTopics: parsed.domainSpecificTopics || [],
    },
  };
}

/**
 * Generate intelligent greeting based on context.
 */
async function generateIntelligentGreeting(config, onChunk = null, persona = null) {
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const startTime = Date.now();

      const greetingUser = SKILL_INTERVIEW_TYPES.includes(config.interviewType)
        ? buildSkillInterviewGreetingUser(config, persona)
        : buildPostInterviewGreetingUser(config, persona);

      const llmOptions = {
        systemPrompt: buildGreetingSystem(config),
        messages: [{ role: 'user', content: greetingUser }],
        temperature: 0.6,
        maxTokens: 400,
        timeout: 30000,
      };

      const response = onChunk
        ? await bedrock.callLLMStreaming({ ...llmOptions, onChunk })
        : await bedrock.callLLM(llmOptions);

      const processingTime = Date.now() - startTime;
      const greeting = response.content.trim();

      if (greeting.length < 20) {
        throw new Error(`Malformed greeting (too short): "${greeting}"`);
      }
      if (/^[a-z]\d+$/i.test(greeting) || greeting.length < 15 || !greeting.includes(' ')) {
        throw new Error(`Invalid greeting format: "${greeting}"`);
      }

      return {
        content: greeting,
        metadata: {
          model: config.models.fastModel,
          processingTime,
          prompt: 'greeting_generation',
          interviewType: config.interviewType,
          attempt,
        },
      };
    } catch (error) {
      lastError = error;
      console.error(`âŒ [Greeting] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  console.error('âŒ [Greeting] All attempts failed, using fallback');
  const fallbackGreeting = SKILL_INTERVIEW_TYPES.includes(config.interviewType)
    ? `Hello! I'm excited to discuss your ${config.context.targetRole} skills today. Let's explore your expertise together!`
    : `Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's start our conversation!`;

  return {
    content: fallbackGreeting,
    metadata: {
      fallback: true,
      error: lastError?.message,
      errorCode: lastError?.code,
      attemptedModel: config.models.fastModel,
      attempts: maxRetries,
    },
  };
}

/**
 * Generate an intelligent silence prompt.
 */
async function generateSilencePrompt(session, silenceData) {
  const maxRetries = 2;
  let lastError = null;

  const recentMessages = session.conversation.slice(-3).map(entry =>
    `${entry.type === 'interviewer' ? 'Interviewer' : 'Candidate'}: ${entry.content?.substring(0, 100) || '[no content]'}`
  ).join('\n');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config = session.config;

      const response = await bedrock.callLLM({
        systemPrompt: 'You are a supportive interviewer. Your task is to generate ONLY the encouraging text - nothing else. Be empathetic and natural.',
        messages: [{ role: 'user', content: buildSilenceUser({ config, recentMessages, silenceData }) }],
        temperature: 0.7,
        maxTokens: 300,
        timeout: 30000,
        useFastModel: true,
      });

      const silencePrompt = response.content.trim();

      if (silencePrompt.length < 15) {
        throw new Error(`Malformed silence prompt (too short): "${silencePrompt}"`);
      }
      if (/^[a-z]+\d*$/i.test(silencePrompt) || !silencePrompt.includes(' ')) {
        throw new Error(`Invalid silence prompt format: "${silencePrompt}"`);
      }

      return {
        content: silencePrompt,
        metadata: {
          model: config.models.fastModel,
          silenceCount: silenceData.silenceCount,
          silenceDuration: silenceData.silenceDuration,
          type: 'silence_prompt',
          attempt,
        },
      };
    } catch (error) {
      lastError = error;
      console.error(`âŒ [Silence] Attempt ${attempt}/${maxRetries} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }

  const fallbacks = [
    "Take your time to think about it. I'm here when you're ready to continue.",
    'No rush at all. Would you like me to rephrase the question?',
    'Feel free to take a moment to gather your thoughts. How would you like to approach this?',
  ];

  return {
    content: fallbacks[silenceData.silenceCount % fallbacks.length],
    metadata: { fallback: true, silenceCount: silenceData.silenceCount, error: lastError?.message, attempts: maxRetries },
  };
}

/**
 * Generate comprehensive final report after interview ends.
 */
async function generateFinalReport(session) {
  const persona          = session.agentPersona || {};
  const candidateProfile = session.candidateProfile || {};
  const coverage         = session.coverage || { overall: 0, areas: {} };
  const conversation     = session.conversation || [];
  const runningData      = session.runningScoreData;

  const mustHaves   = persona.idealCandidate?.mustHaveSkills || [];
  const demonstrated = candidateProfile.revealedExpertise || [];
  const gaps         = candidateProfile.revealedGaps || [];
  const commStyle    = candidateProfile.communicationStyle || {};

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

  const totalResponses   = conversation.filter(e => e.type === 'candidate').length;
  const questionsPerArea = Object.fromEntries(
    Object.entries(coverage.areas || {}).map(([k, a]) => [k, a.questionsAsked || 0])
  );

  let finalScore, qualityScore, coverageScore, effectiveSkillsScore, effectiveDepthScore, effectiveCommunicationScore;

  if (runningData?.scores) {
    finalScore                  = runningData.scores.overall;
    qualityScore                = runningData.scores.quality;
    coverageScore               = runningData.scores.coverage;
    effectiveSkillsScore        = runningData.scores.skills;
    effectiveDepthScore         = runningData.scores.depth;
    effectiveCommunicationScore = runningData.scores.communication;
  } else {
    console.warn('âš ï¸ [FinalReport] No running score found, computing from scratch');
    const responseQualities = candidateProfile.responseQualities || [];
    qualityScore  = responseQualities.length > 0
      ? Math.round(responseQualities.reduce((a, b) => a + b, 0) / responseQualities.length)
      : 0;
    coverageScore = coverage.overall || 0;

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

    let communicationScore = 30;
    if (commStyle.confidenceLevel === 'confident') communicationScore += 20;
    else if (commStyle.confidenceLevel === 'moderate') communicationScore += 10;
    if (commStyle.usesExamples) communicationScore += 15;
    if (commStyle.verbosity === 'detailed') communicationScore += 10;
    else if (commStyle.verbosity === 'concise') communicationScore += 5;
    communicationScore = Math.min(100, communicationScore);

    const isNonAnsweringFallback = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;
    effectiveSkillsScore        = isNonAnsweringFallback ? 0 : skillsScore;
    effectiveDepthScore         = isNonAnsweringFallback ? 0 : depthScore;
    effectiveCommunicationScore = isNonAnsweringFallback ? 0 : communicationScore;
    finalScore = isNonAnsweringFallback
      ? Math.max(0, Math.round((qualityScore * 0.40) + (coverageScore * 0.10)))
      : Math.round((qualityScore * 0.40) + (coverageScore * 0.10) + (skillsScore * 0.25) + (depthScore * 0.15) + (communicationScore * 0.10));
  }

  const isNonAnswering = qualityScore <= 15 && coverageScore <= 5 && demonstrated.length === 0;

  let finalStrengths  = runningData?.strengths || [];
  let finalWeaknesses = runningData?.weaknesses || [];

  if (isNonAnswering) {
    finalStrengths  = [];
    finalWeaknesses = mustHaves.length > 0
      ? mustHaves.map(s => `Failed to demonstrate knowledge of ${s}`)
      : ['Candidate did not provide substantive answers to interview questions'];
  }

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
      systemPrompt: 'You are an expert recruiter writing a structured hiring report for a decision-maker. Summarize the interview and generate the required JSON fields. The scores are already pre-computed â€” do NOT re-evaluate them. Return ONLY valid JSON with all required fields.',
      messages: [{ role: 'user', content: buildFinalReportUser({
        persona, finalScore, qualityScore, responseQualities, coverageScore,
        demonstrated, gaps, areaScores, conversationSummary,
        mustHaveSkills: mustHaves, mustHavesCovered, mustHavesMissed, totalResponses,
      }) }],
      temperature: 0.3,
      maxTokens: 2000,
      timeout: 25000,
      useFastModel: false,
    });

    aiSummary = AIUtils.parseJSONResponse(summaryResponse.content, 'generateFinalReport');
  } catch (err) {
    console.warn('âš ï¸ [FinalReport] LLM summary failed:', err.message);
    aiSummary.summary        = `Candidate scored ${finalScore}/100 overall. Quality: ${qualityScore}/100, Coverage: ${coverageScore}%.`;
    aiSummary.recommendation = finalScore >= 75 ? 'hire' : finalScore >= 55 ? 'maybe' : 'no_hire';
    aiSummary.reasoning      = `Based on composite score of ${finalScore}/100.`;
  }

  if (isNonAnswering) aiSummary.recommendation = 'no_hire';

  return {
    summary:        aiSummary.summary,
    recommendation: aiSummary.recommendation,
    reasoning:      aiSummary.reasoning,

    keyDecisionFactors: Array.isArray(aiSummary.keyDecisionFactors) ? aiSummary.keyDecisionFactors : [],
    hiringRisks:        Array.isArray(aiSummary.hiringRisks)        ? aiSummary.hiringRisks        : [],
    developmentAreas:   Array.isArray(aiSummary.developmentAreas)   ? aiSummary.developmentAreas   : [],

    scores: {
      overall:       finalScore,
      quality:       qualityScore,
      coverage:      coverageScore,
      skills:        effectiveSkillsScore,
      depth:         effectiveDepthScore,
      communication: effectiveCommunicationScore,
    },

    strengths:  finalStrengths,
    weaknesses: finalWeaknesses,

    requiredSkills: {
      all:          mustHaves,
      demonstrated: mustHavesCovered,
      missed:       mustHavesMissed,
    },

    coverage,

    candidateProfile: {
      communicationStyle: commStyle,
      revealedExpertise:  demonstrated,
      revealedGaps:       gaps,
      difficultyLevel:    candidateProfile.currentDifficulty || 'intermediate',
    },

    sessionMetrics: { totalResponses, questionsPerArea },

    timestamp: new Date().toISOString(),
  };
}

/**
 * Increment question count for a coverage area (max 5 per area to avoid repetition).
 * @param {object} sessionManager - Redis session manager instance
 */
async function incrementAreaQuestionCount(sessionManager, sessionId, areaName) {
  try {
    const session = await sessionManager.getSession(sessionId);
    if (!session || !session.coverage.areas[areaName]) return;

    const area = session.coverage.areas[areaName];
    area.questionsAsked    = (area.questionsAsked || 0) + 1;
    area.lastQuestionTime  = new Date().toISOString();

    await sessionManager.updateCoverage(sessionId, session.coverage);
  } catch (error) {
    console.error('Error incrementing area question count:', error);
  }
}

module.exports = {
  buildAgentPersona,
  generateIntelligentGreeting,
  generateSilencePrompt,
  generateFinalReport,
  incrementAreaQuestionCount,
};

