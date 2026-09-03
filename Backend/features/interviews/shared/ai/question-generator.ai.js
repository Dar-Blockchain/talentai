'use strict';

const bedrock  = require('../../../../utils/bedrock-client');
const AIUtils  = require('./ai.utils');
const {
  getLanguageInstruction,
  buildQuestionGeneratorSystem,
  buildTargetedQuestionSystem,
} = require('../prompts/generation.prompts');

/**
 * QuestionGeneratorAI â€” generates the next interview question.
 *
 * Methods:
 *   generateIntelligentQuestion   â€” main pipeline question (strategy + style aware)
 *   generateTargetedQuestionForArea â€” dedup fallback for a specific area
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

      // â”€â”€ Persona block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Candidate profile block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

      // â”€â”€ Strategy block â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      let strategyBlock = '';
      if (questionStrategy) {
        const modeInstructions = {
          bridge:     `BRIDGE MODE: The candidate just mentioned "${questionStrategy.context}". Naturally bridge from that topic to explore ${questionStrategy.targetArea}. Use what they said as a springboard.`,
          probe:      `PROBE MODE: ${questionStrategy.context}. Ask for a specific, concrete example or deeper technical detail about ${questionStrategy.targetArea}.`,
          transition: `TRANSITION MODE: ${questionStrategy.context}. Smoothly transition to ${questionStrategy.targetArea} â€” connect it to something already discussed if possible.`,
          validate:   `VALIDATE MODE: ${questionStrategy.context}. Ask a quick validation question for ${questionStrategy.targetArea} to confirm the candidate's strength.`,
        };
        strategyBlock = `\n=== QUESTION STRATEGY ===\n${modeInstructions[questionStrategy.mode] || `Target: ${questionStrategy.targetArea}`}`;
      }

      // â”€â”€ Interview-type guidelines â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
      const experienceLevel = persona.job?.experienceLevel || session.config.context?.experienceLevel || 'mid';
      const isSkillAssessment = session.config.interviewType === 'TECHNICAL_SKILL' || session.config.interviewType === 'SOFT_SKILL';
      const skillQuestionsAsked = session.conversation.filter(e => e.type === 'interviewer').length;
      let questionGuidelines = '';
      if (session.config.interviewType === 'TECHNICAL_SKILL') {
        const targetRole = session.config.context.targetRole;
        const focusAreaNames = Object.keys(session.coverage?.areas || {});
        // Phase thresholds mirror campaign-interview's SKILL_TEST prompt
        // (Backend/features/interviews/campaign-interview/prompts/skill-test.prompt.js)
        const phase = skillQuestionsAsked < 2 ? 'fundamentals'
          : skillQuestionsAsked < 5 ? 'practical mechanics'
          : skillQuestionsAsked < 8 ? 'depth'
          : 'reflection';
        const phaseGuide = {
          'fundamentals':        'Ask a canonical, foundational question -- a core definition or mechanic. Do NOT ask about years of experience or past projects.',
          'practical mechanics': 'Real, specific questions about the tools/APIs/patterns a working professional in this skill uses day to day -- move across DIFFERENT categories, do not linger on one for more than 2 questions in a row.',
          'depth':               'Push to the advanced end of whichever sub-topic the candidate showed the most (or least) strength in: internals, trade-offs, performance, edge cases, "what happens when...".',
          'reflection':          'Ask about a mistake they learned from, or advice they would give someone newer to this skill.',
        };
        questionGuidelines = `
TECHNICAL SKILL ASSESSMENT for "${targetRole}".
This is a standalone KNOWLEDGE assessment -- there is usually no job description to anchor on, so YOU must decide what to probe based on how "${targetRole}" is actually used in real work: core concepts, common patterns and idioms, tooling, debugging, performance/trade-offs, and best practices.
${focusAreaNames.length ? `Focus areas being tracked: ${focusAreaNames.join(', ')}. Spread your questions across these -- do not stay on one area for more than 2 consecutive questions.` : ''}

ROLE: Act as a knowledgeable, professional, and empathetic interviewer -- like a senior engineer interviewing a peer. Encouraging yet evaluative: put the candidate at ease while genuinely testing depth.

CURRENT PHASE (question ${skillQuestionsAsked + 1}): ${phase.toUpperCase()} -- ${phaseGuide[phase]}

QUESTION BANK MINDSET:
Draw from the same pool of real, well-known "${targetRole}" interview questions that show up in actual technical interviews and interview-prep guides for this skill -- never vague, generic, or invented-on-the-spot questions. Silently organize "${targetRole}" into the categories a real interview guide for it would use, then pick from across them. Every question should be one an expert in "${targetRole}" would instantly recognize as a genuine, commonly-asked interview question, in the spirit of:
  - "What's the difference between X and Y?"
  - "What does Z do, and when would you reach for it over W?"
  - "How would you implement / debug / optimize <a specific, concrete situation>?"
  - "What happens when..." / "Walk me through what happens if..."

AVOID:
  - "Tell me about your experience with ${targetRole}" -- NEVER, not even as a warm-up.
  - Abstract questions with no concrete right answer, or ones a non-expert could bluff through.
  - Anything not tied to how "${targetRole}" is actually used and discussed in real ${targetRole} work.

QUESTION SUBSTANCE RULES:
- Every question must target a concrete, real-world aspect of "${targetRole}" -- never a vague "tell me about your experience" restated in different words.
- Prefer applied and scenario framing ("How would you handle X", "What would you do if Y broke in production") over pure definitions -- definitions are easy to memorize and reveal little.
- Vary the ANGLE each turn: if the previous question was conceptual, make this one applied, a debugging scenario, or a trade-off/design decision -- never two questions of the same angle back to back.
- If the candidate's last answer was strong, go one level deeper on that same sub-topic (edge cases, scale, failure modes) before moving on; if it was weak or shallow, pivot to a different, more concrete sub-topic rather than re-asking the same thing.
- Do NOT ask about the candidate's experience, background, projects, or "tell me about a time..." -- this is a knowledge test, not a job interview.

HARD RULES:
- Never reuse the same example, snippet, or scenario twice.
- Acknowledge the previous answer in one short phrase before asking the next question.
- Professional but conversational -- never cold or robotic.

Experience Level: ${experienceLevel} -- calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'HR_INTERVIEW') {
        questionGuidelines = `HR/BEHAVIORAL interview -- focus on soft skills, teamwork, cultural fit.
Experience Level: ${experienceLevel} -- calibrate question complexity accordingly.`;
      } else if (session.config.interviewType === 'SOFT_SKILL') {
        const targetRole = session.config.context.targetRole;
        const softPhase = skillQuestionsAsked < 2 ? 'warm-up'
          : skillQuestionsAsked < 5 ? 'exploration'
          : skillQuestionsAsked < 8 ? 'deep-dive'
          : 'closing';
        const softPhaseGuide = {
          'warm-up':    'Build rapport. Ask for a first, broad story related to this competency. No pressure.',
          'exploration': 'Dig into a different sub-theme with a fresh STAR-style story. Introduce variety across sub-themes.',
          'deep-dive':  'Push for depth on the sub-theme where the candidate showed the most -- or least -- strength: outcome, the other person\'s reaction, what they would do differently.',
          'closing':    'One final meaningful story, then prepare to close warmly.',
        };
        questionGuidelines = `
SOFT SKILLS ASSESSMENT${targetRole ? ` for "${targetRole}"` : ''}.
Evaluate communication, emotional intelligence, collaboration, adaptability, and conflict handling -- through concrete stories, not abstract self-description.

ROLE: Act as a knowledgeable, professional, and empathetic interviewer -- like a senior peer conducting a genuine competency interview. Encouraging yet evaluative.

CURRENT PHASE (question ${skillQuestionsAsked + 1}): ${softPhase.toUpperCase()} -- ${softPhaseGuide[softPhase]}

QUESTION BANK MINDSET:
Draw from the same kind of real, well-known behavioral interview questions that show up in actual interview-prep guides for this competency -- never vague or invented-on-the-spot. Silently organize the competency into the sub-themes a real interview guide would use (teamwork, feedback, conflict, adaptability, ownership, communicating under pressure), then rotate across them.

QUESTION SUBSTANCE RULES:
- Use behavioral/STAR-style prompts ("Tell me about a time when...", "Describe a situation where...") that force a specific real example, not a self-rating like "how good are you at teamwork".
- Rotate across sub-themes every question -- teamwork, giving/receiving feedback, handling disagreement, adapting to change, communicating under pressure, ownership and accountability. Never repeat a sub-theme already covered (see TOPICS ALREADY EXPLORED below).
- If an answer stays vague or generic, the next question should push for a concrete outcome or the other person's reaction on that SAME story -- not jump to a brand-new topic.

HARD RULES:
- Never reuse the same example, scenario, or prompt phrasing twice.
- Acknowledge the previous answer in one short phrase before asking the next question.
- Professional but conversational -- never cold or robotic.

Experience Level: ${experienceLevel} -- calibrate question complexity accordingly.`;
      }

      // -- Style instruction --
      let styleInstruction = '';
      if (candidateProfile.communicationStyle?.verbosity === 'concise') {
        styleInstruction = 'Candidate is concise â€” ask open-ended questions that invite elaboration.';
      } else if (candidateProfile.communicationStyle?.verbosity === 'rambling') {
        styleInstruction = 'Candidate tends to ramble â€” ask focused, specific questions.';
      }

      let questionStyleBlock = '';
      if (questionStyle?.instruction) {
        questionStyleBlock = `
=== QUESTION STYLE ===
${questionStyle.instruction}
IMPORTANT: Follow this style while respecting the strategy mode above. The style dictates HOW to phrase the question; the strategy dictates WHAT area to target.`;
      }

      // â”€â”€ Build user prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
JD SKILLS NOT YET ASKED ABOUT (PRIORITIZE these â€” ask about a different skill each question):
${uncoveredSkills.join(', ') || 'all skills covered'}

JD SKILLS ALREADY EXPLORED:
${coveredSkills.join(', ') || 'none yet'}` : '';

      const recentContext    = session.conversation.slice(-6).map(e => `${e.type}: ${e.content}`).join('\n');
      const allAskedQuestions = session.conversation.filter(e => e.type === 'interviewer').map(e => `- ${e.content}`).join('\n');

      // Collect all skipped questions across all areas (session-wide avoidance)
      const allSkippedQuestions = Object.values(session.coverage?.areas || {})
        .flatMap(a => a.skippedQuestions || []);
      const skippedBlock = allSkippedQuestions.length > 0
        ? `\nSKIPPED QUESTIONS â€” Do NOT ask anything similar to these (candidate passed on them):\n${allSkippedQuestions.map(q => `- ${q}`).join('\n')}\n`
        : '';

      // Build disqualified areas / sub-topics block
      const disqualifiedAreaNames = Object.entries(session.coverage?.areas || {})
        .filter(([, d]) => d.disqualified)
        .map(([name]) => name);
      const disqualifiedSubtopics = Object.entries(session.coverage?.areas || {})
        .filter(([, d]) => d.disqualifiedSubtopics?.length > 0)
        .flatMap(([area, d]) => d.disqualifiedSubtopics.map(st => `${st} (in ${area})`));
      const disqualifiedBlock = (disqualifiedAreaNames.length > 0 || disqualifiedSubtopics.length > 0)
        ? `\nCANDIDATE'S EXPLICIT KNOWLEDGE GAPS â€” NEVER ASK ABOUT THESE:\n${disqualifiedAreaNames.length > 0 ? `Completely off-limits areas (candidate has zero experience): ${disqualifiedAreaNames.join(', ')}\n` : ''}${disqualifiedSubtopics.length > 0 ? `Specific off-limits sub-topics: ${disqualifiedSubtopics.join(', ')}\n` : ''}`
        : '';

      const roleLine = isSkillAssessment
        ? `Skill/Role being assessed: ${session.config.context.targetRole}`
        : `Role: ${session.config.context.targetRole} at ${session.config.context.targetCompany}`;

      const userPrompt = `${roleLine}
${disqualifiedBlock}
COVERAGE: ${JSON.stringify(coverageSummary)}
WEAKEST: ${JSON.stringify(
        coverageAnalysis?.overallAssessment?.weakestAreas ||
        Object.entries(session.coverage?.areas || {}).filter(([, d]) => d.percentage < 50).map(([a]) => a)
      )}
${skillTrackingBlock}

TOPICS ALREADY EXPLORED (do NOT revisit these â€” pick a DIFFERENT sub-topic):
${exploredTopicsSummary}
${overusedThemes.length > 0 ? `\nOVERUSED THEMES (AVOID these completely â€” pick a fresh topic):\n${overusedThemes.join(', ')}` : ''}
${ragBlock}

ALREADY ASKED (DO NOT repeat or rephrase these):
${allAskedQuestions || '(none yet)'}

RECENT CONVERSATION:
${recentContext}

${skippedBlock}
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
        isSkillAssessment,
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
   * Generate a targeted question for a specific area â€” used as a dedup fallback
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
      console.error(`Error generating targeted question for area: ${areaName} â€” ${error.message}`);
      throw error;
    }
  }
}

module.exports = QuestionGeneratorAI;
