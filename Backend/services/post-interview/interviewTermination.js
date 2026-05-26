'use strict';

const bedrock = require('../../helpers/bedrock.helpers');
const AIUtils  = require('./ai/AIUtils');
const { SHOULD_END_INTERVIEW_SYSTEM } = require('./prompts/reportPrompts');

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
      console.log(`❌ [Quality Counter] Bad answer ${tracking.consecutiveBadAnswers}/8 (score: ${qualityScore})`);
    } else if (qualityScore >= GOOD_THRESHOLD) {
      tracking.consecutiveGoodAnswers++;
      tracking.consecutiveBadAnswers = 0;
      tracking.totalGoodAnswers++;
      console.log(`✅ [Quality Counter] Good answer ${tracking.consecutiveGoodAnswers}/8 (score: ${qualityScore})`);
    } else {
      tracking.consecutiveBadAnswers = 0;
      tracking.consecutiveGoodAnswers = 0;
      console.log(`📊 [Quality Counter] Medium answer (score: ${qualityScore}) - counters reset`);
    }

    tracking.lastQualityScore = qualityScore;
    await sessionManager.updateSession(sessionId, { qualityTracking: tracking });
  } catch (error) {
    console.error('❌ Failed to update quality counters:', error.message);
  }
}

/**
 * Determine whether the interview should end.
 * Applies rule-based checks first (time, quality counters, avg quality),
 * then falls back to an LLM evaluation when sufficient coverage data exists.
 */
async function shouldEndInterview(session, totalDuration) {
  try {
    // ⏰ TIME LIMIT CHECK (hard cap = target × 1.5, e.g., 45 min)
    if (session.interviewStartTime) {
      const elapsedMinutes = (Date.now() - session.interviewStartTime) / 60000;
      const maxDuration    = session.maxDurationMinutes || 45;
      if (elapsedMinutes >= maxDuration) {
        console.log(`⏰ [Time Limit] ${elapsedMinutes.toFixed(1)} minutes elapsed (max: ${maxDuration}) - ending interview`);
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

    // 📊 QUALITY-BASED TERMINATION
    if (session.qualityTracking) {
      const tracking       = session.qualityTracking;
      const overallCoverage = session.coverage?.overall || 0;

      if (tracking.consecutiveBadAnswers >= 8) {
        console.log('🚫 [Poor Quality Termination] 8 consecutive bad answers - ending interview');
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
        console.log(`✅ [Excellent Quality Termination] 8 consecutive good answers + ${overallCoverage}% coverage - ending interview`);
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
      console.log(`❌ [Early Termination - Poor Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses`);
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
      console.log(`🌟 [Early Excellence] ${overallQualityAverage.toFixed(1)}/100 avg quality over ${candidateResponseCount} responses — ending early`);
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
      console.log(`✅ [Early Success - Excellent Performance] ${overallQualityAverage.toFixed(1)}/100 avg quality, ${overallCov}% coverage`);
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
      console.log(`⏳ [shouldEndInterview] Coverage ${currentOverallCoverage}%, ${areasExplored}/${totalAreas} areas explored — insufficient data, continuing`);
      return {
        shouldEnd: false,
        confidence: 0,
        reasoning: `Coverage at ${currentOverallCoverage}% with ${areasExplored}/${totalAreas} areas explored — insufficient data to assess candidate`,
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
      systemPrompt: SHOULD_END_INTERVIEW_SYSTEM,
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

module.exports = { updateQualityCounters, shouldEndInterview };
