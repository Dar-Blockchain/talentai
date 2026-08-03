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
  const exampleGreeting = `"Hello! I'm excited to speak with you today for the ${targetRole} assessment. Let's get started!"`;

  const exampleWithIntro = `"Hello! I'm Olga, your AI interviewer. I'm excited to speak with you today for the ${targetRole} assessment. To get started, could you please introduce yourself?"`;

  return `Generate a short, warm greeting for this skill assessment interview that ends with asking the candidate to introduce themselves.

CONTEXT:
- Agent name: Olga
- Role / Skill: ${targetRole}
- Tone: ${interviewerTone}

REQUIREMENTS:
- Maximum 2-3 short sentences
- First sentence: introduce yourself as Olga the AI interviewer
- Second sentence: welcome the candidate and mention the role or skill being assessed
- Last sentence: ask the candidate to introduce themselves
- Do NOT mention any specific technologies, tools, topics, or what will be covered
- Keep it simple, friendly, and natural
- ONLY output the greeting text itself — no labels, no meta-text

Example: ${exampleWithIntro}${langInstruction ? '\n\n' + langInstruction : ''}`;
}

module.exports = {
  buildSkillInterviewGreetingUser,
};
