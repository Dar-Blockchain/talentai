'use strict';

const bedrock  = require('../../../helpers/bedrock.helpers');
const AIUtils  = require('./AIUtils');
const {
  getLanguageInstruction,
  buildQuestionGeneratorSystem,
  buildTargetedQuestionSystem,
} = require('../interviewPrompts');

/**
 * QuestionGeneratorAI — generates the next interview question.
 *
 * Methods:
 *   generateIntelligentQuestion   — main pipeline question (strategy + style aware)
 *   generateTargetedQuestionForArea — dedup fallback for a specific area
 */
class QuestionGeneratorAI {
  /**
   * Generate the next interview question using coverage, strategy, style, and RAG context.
   *
   * @param {object}      session          - Full session object from Redis
   * @param {object}      coverageAnalysis - Output of CoverageAnalysisAI (weakest areas etc.)
   * @param {object}      memoryAnalysis   - { previousQuestions: [...] }
   * @param {object|null} questionStrategy - { mode, targetArea, context } from decideQuestionStrategy
   * @param {object|null} questionStyle    - { id, instruction } from selectQuestionStyle
   */
  async generateIntelligentQuestion(session, coverageAnalysis, memoryAnalysis, questionStrategy = null, questionStyle = null) {
    try {
      const persona          = session.agentPersona || {};
      const candidateProfile = session.candidateProfile || {};

      // ── Persona block ────────────────────────────────────────────────────
      let personaBlock = '';
      if (persona.job) {
        personaBlock = `
=== AGENT PERSONA ===
Role: ${persona.job.title} at ${persona.job.company}
Category: ${persona.jobCategory} | Interview: ${persona.interviewType}
Must-Have Skills: ${persona.idealCandidate?.mustHaveSkills?.join(', ') || 'N/A'}
Nice-to-Have: ${persona.idealCandidate?.niceToHaveSkills?.join(', ') || 'N/A'}
Red Flags: ${persona.idealCandidate?.redFlags?.join(', ') || 'N/A'}
Tone: ${persona.agentBehavior?.tone || 'professional'}
Domain Topics: ${persona.agentBehavior?.domainTopics?.join(', ') || 'N/A'}
Experience Level: ${persona.job.experienceLevel || 'mid'}
Seniority Expectations: ${persona.idealCandidate?.seniorityExpectations || 'N/A'}

=== JOB REQUIREMENTS (questions MUST align with these) ===
${(persona.job.requirements || []).slice(0, 10).join('\n') || 'N/A'}

=== JOB RESPONSIBILITIES ===
${(persona.job.responsibilities || []).slice(0, 10).join('\n') || 'N/A'}`;
      }

      // ── Candidate profile block ──────────────────────────────────────────
      let profileBlock = '';
      if (candidateProfile.responseQualities?.length > 0) {
        profileBlock = `
=== CANDIDATE PROFILE ===
Style: ${candidateProfile.communicationStyle?.verbosity || 'unknown'} speaker, ${candidateProfile.communicationStyle?.confidenceLevel || 'unknown'} confidence
Uses Examples: ${candidateProfile.communicationStyle?.usesExamples ? 'yes' : 'not yet'}
Expertise Shown: ${candidateProfile.revealedExpertise?.slice(-5).join(', ') || 'none yet'}
Gaps Identified: ${candidateProfile.revealedGaps?.slice(-3).join(', ') || 'none yet'}
Current Difficulty: ${candidateProfile.currentDifficulty || 'intermediate'}`;
      }

      // ── Strategy block ───────────────────────────────────────────────────
      let strategyBlock = '';
      if (questionStrategy) {
        const modeInstructions = {
          bridge:     `BRIDGE MODE: The candidate just mentioned "${questionStrategy.context}". Naturally bridge from that topic to explore ${questionStrategy.targetArea}. Use what they said as a springboard.`,
          probe:      `PROBE MODE: ${questionStrategy.context}. Ask for a specific, concrete example or deeper technical detail about ${questionStrategy.targetArea}.`,
          transition: `TRANSITION MODE: ${questionStrategy.context}. Smoothly transition to ${questionStrategy.targetArea} — connect it to something already discussed if possible.`,
          validate:   `VALIDATE MODE: ${questionStrategy.context}. Ask a quick validation question for ${questionStrategy.targetArea} to confirm the candidate's strength.`,
        };
        strategyBlock = `\n=== QUESTION STRATEGY ===\n${modeInstructions[questionStrategy.mode] || `Target: ${questionStrategy.targetArea}`}`;
      }

      // ── Interview-type guidelines ────────────────────────────────────────
      const experienceLevel = persona.job?.experienceLevel || session.config.context?.experienceLevel || 'mid';
      let questionGuidelines = '';
      if (session.config.interviewType === 'TECHNICAL_SKILL') {
        const focusAreaNames = Object.keys(session.coverage?.areas || {});
        questionGuidelines = `
TECHNICAL SKILL interview for "${session.config.context.targetRole}".
Focus areas: ${focusAreaNames.join(', ')}
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'HR_INTERVIEW') {
        questionGuidelines = `HR/BEHAVIORAL interview — focus on soft skills, teamwork, cultural fit.
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'SOFT_SKILL') {
        questionGuidelines = `SOFT SKILLS interview — focus on communication, EQ, collaboration.
Experience Level: ${experienceLevel} — calibrate question complexity accordingly.`;
      }

      // ── Style instruction ────────────────────────────────────────────────
      let styleInstruction = '';
      if (candidateProfile.communicationStyle?.verbosity === 'concise') {
        styleInstruction = 'Candidate is concise — ask open-ended questions that invite elaboration.';
      } else if (candidateProfile.communicationStyle?.verbosity === 'rambling') {
        styleInstruction = 'Candidate tends to ramble — ask focused, specific questions.';
      }

      let questionStyleBlock = '';
      if (questionStyle?.instruction) {
        questionStyleBlock = `
=== QUESTION STYLE ===
${questionStyle.instruction}
IMPORTANT: Follow this style while respecting the strategy mode above. The style dictates HOW to phrase the question; the strategy dictates WHAT area to target.`;
      }

      // ── Build user prompt ────────────────────────────────────────────────
      const coverageSummary = Object.fromEntries(
        Object.entries(session.coverage?.areas || {}).map(([a, d]) => [a, `${d.percentage}% (${d.questionsAsked || 0}q)`])
      );

      const exploredTopicsSummary = Object.entries(session.coverage?.areas || {})
        .filter(([, d]) => d.topicsExplored?.length > 0)
        .map(([area, d]) => `${area}: ${d.topicsExplored.join(', ')}`)
        .join('\n') || 'none yet';

      // Detect overused bigrams across all asked questions
      const allQuestionTexts = session.conversation
        .filter(e => e.type === 'interviewer')
        .map(e => e.content.toLowerCase());
      const themeFrequency = {};
      for (const q of allQuestionTexts) {
        const words = q.split(/\s+/).filter(w => w.length > 3);
        for (let i = 0; i < words.length - 1; i++) {
          const bigram = `${words[i]} ${words[i + 1]}`;
          themeFrequency[bigram] = (themeFrequency[bigram] || 0) + 1;
        }
      }
      const overusedThemes = Object.entries(themeFrequency)
        .filter(([, count]) => count >= 2)
        .map(([theme]) => theme);

      const ragBlock = session.ragContext
        ? `\nRELEVANT JD CONTEXT (use this to align questions with job requirements):\n${session.ragContext}`
        : '';

      const checklist      = session.jdSkillsChecklist || [];
      const uncoveredSkills = checklist.filter(s => !s.asked).map(s => s.skill);
      const coveredSkills   = checklist.filter(s => s.asked).map(s =>
        `${s.skill} ${s.covered ? '(demonstrated)' : '(asked, not demonstrated)'}`
      );
      const skillTrackingBlock = checklist.length > 0 ? `
JD SKILLS NOT YET ASKED ABOUT (PRIORITIZE these — ask about a different skill each question):
${uncoveredSkills.join(', ') || 'all skills covered'}

JD SKILLS ALREADY EXPLORED:
${coveredSkills.join(', ') || 'none yet'}` : '';

      const recentContext    = session.conversation.slice(-6).map(e => `${e.type}: ${e.content}`).join('\n');
      const allAskedQuestions = session.conversation.filter(e => e.type === 'interviewer').map(e => `- ${e.content}`).join('\n');

      const userPrompt = `Role: ${session.config.context.targetRole} at ${session.config.context.targetCompany}

COVERAGE: ${JSON.stringify(coverageSummary)}
WEAKEST: ${JSON.stringify(
        coverageAnalysis?.overallAssessment?.weakestAreas ||
        Object.entries(session.coverage?.areas || {}).filter(([, d]) => d.percentage < 50).map(([a]) => a)
      )}
${skillTrackingBlock}

TOPICS ALREADY EXPLORED (do NOT revisit these — pick a DIFFERENT sub-topic):
${exploredTopicsSummary}
${overusedThemes.length > 0 ? `\nOVERUSED THEMES (AVOID these completely — pick a fresh topic):\n${overusedThemes.join(', ')}` : ''}
${ragBlock}

ALREADY ASKED (DO NOT repeat or rephrase these):
${allAskedQuestions || '(none yet)'}

RECENT CONVERSATION:
${recentContext}

Generate the next question.`;

      const systemPrompt = buildQuestionGeneratorSystem({
        langInstruction: getLanguageInstruction(session.config),
        personaBlock,
        profileBlock,
        strategyBlock,
        questionGuidelines,
        styleInstruction,
        questionStyleBlock,
        questionStyleId: questionStyle?.id,
      });

      const response = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.7,
        maxTokens: 300,
        timeout: 30000,
        useFastModel: true,
      });

      return AIUtils.parseJSONResponse(response.content, 'generateIntelligentQuestion');
    } catch (error) {
      console.error('Error generating intelligent question:', error);
      throw error;
    }
  }

  /**
   * Generate a targeted question for a specific area — used as a dedup fallback
   * when the proposed question is too similar to a previous one.
   */
  async generateTargetedQuestionForArea(areaName, areaData, candidateHistory, roleContext, language = 'en') {
    try {
      const relevantHistory = candidateHistory.filter(e =>
        e.type === 'candidate' &&
        (e.content.toLowerCase().includes(areaName.toLowerCase()) ||
         e.aiAnalysis?.topicsDiscussed?.includes(areaName))
      );

      const askedQuestions = candidateHistory
        .filter(e => e.type === 'interviewer')
        .map(e => `- ${e.content}`)
        .join('\n');

      const userPrompt = `TARGET COMPETENCY AREA: ${areaName}

AREA COVERAGE DATA:
${JSON.stringify(areaData, null, 2)}

ROLE CONTEXT:
${JSON.stringify(roleContext, null, 2)}

ALREADY ASKED (generate something COMPLETELY DIFFERENT):
${askedQuestions || '(none yet)'}

CANDIDATE'S PREVIOUS RESPONSES ABOUT THIS AREA:
${relevantHistory.map(e => e.content).join('\n---\n')}

Generate a targeted question to explore this competency area more deeply. Respond with ONLY valid JSON.`;

      const aiResponse = await bedrock.callLLM({
        systemPrompt: buildTargetedQuestionSystem(language),
        messages: [{ role: 'user', content: userPrompt }],
        temperature: 0.6,
        maxTokens: 600,
        timeout: 30000,
        useFastModel: true,
      });

      const responseContent = aiResponse.content;
      if (responseContent.length < 10 || !responseContent.includes('{')) {
        throw new Error(`AI returned malformed response: "${responseContent}"`);
      }

      const parsed = AIUtils.parseJSONResponse(responseContent, 'generateTargetedQuestionForArea');
      if (!parsed.question || parsed.question.length < 5) {
        throw new Error('AI response missing valid question field');
      }

      return parsed;
    } catch (error) {
      console.error(`❌ Error generating targeted question for area: ${areaName} — ${error.message}`);
      throw error;
    }
  }
}

module.exports = QuestionGeneratorAI;
