'use strict';

const { getLanguageInstruction } = require('../../shared/prompts/generation.prompts');

/**
 * Greeting user prompt for standalone skill assessments (TECHNICAL_SKILL, SOFT_SKILL).
 * Does NOT require config.context.targetCompany.
 */
function buildSkillInterviewGreetingUser(config, persona) {
  const langInstruction = getLanguageInstruction(config);
  const interviewerTone = persona?.agentBehavior?.tone || config.interviewerPersona?.tone || 'friendly';
  const targetRole      = config.context.targetRole || 'this skill assessment';

  const exampleGreeting = `"Hello! I'm Olga, your AI interviewer. I'm excited to speak with you today for the ${targetRole} assessment. To start, how would you describe your experience and familiarity with ${targetRole}?"`;

  return `Generate a short, warm greeting for this skill assessment interview that ends with a first opening question directly about the skill being assessed.

CONTEXT:
- Agent name: Olga
- Role / Skill: ${targetRole}
- Tone: ${interviewerTone}

REQUIREMENTS:
- Maximum 2-3 short sentences
- First sentence: introduce yourself as Olga the AI interviewer
- Second sentence: welcome the candidate and mention the role or skill being assessed
- Last sentence: a simple opening question directly about their experience or familiarity with ${targetRole} (e.g. "How would you describe your experience with X?"). This is a KNOWLEDGE/SKILL assessment, not a job interview — do NOT ask the candidate to introduce themselves, talk about their background, resume, or career history.
- Do NOT mention any specific technologies, tools, sub-topics, or what will be covered beyond the overall skill/role itself
- Keep it simple, friendly, and natural
- ONLY output the greeting text itself — no labels, no meta-text

Example: ${exampleGreeting}${langInstruction ? '\n\n' + langInstruction : ''}`;
}

module.exports = {
  buildSkillInterviewGreetingUser,
};
