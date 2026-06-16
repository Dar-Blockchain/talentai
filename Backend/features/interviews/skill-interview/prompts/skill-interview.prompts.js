'use strict';

const { getLanguageInstruction } = require('../../shared/prompts/generation.prompts');

/**
 * Greeting user prompt for standalone skill assessments (TECHNICAL_SKILL, SOFT_SKILL).
 * Does NOT require config.context.targetCompany.
 */
function buildSkillInterviewGreetingUser(config, persona) {
  const langInstruction  = getLanguageInstruction(config);
  const interviewerStyle = config.interviewerPersona?.style || 'professional';
  const interviewerTone  = persona?.agentBehavior?.tone || config.interviewerPersona?.tone || 'friendly';

  const focusAreaNames   = config.intelligenceContext?.focusAreas?.map(a => a.skillName || a.area) || [];
  const focusDescription = focusAreaNames.length > 0 ? focusAreaNames.join(', ') : 'domain-specific expertise';

  let interviewFocus;
  let exampleGreeting;

  if (config.interviewType === 'SOFT_SKILL') {
    interviewFocus  = `This is a SOFT SKILLS and COMMUNICATION assessment focusing on interpersonal abilities, emotional intelligence, and collaboration.`;
    exampleGreeting = `"Hello! Today we'll be discussing your communication style and collaboration experiences. I'm looking forward to understanding how you work with others and handle various workplace scenarios."`;
  } else {
    interviewFocus = `This is a SKILL ASSESSMENT interview for the role of "${config.context.targetRole}" at ${config.context.experienceLevel} level.

FOCUS:
- Assess practical expertise in: ${focusDescription}
- Probe for hands-on experience and real-world results
- Match the greeting to the role's domain (NOT generic software engineering unless the role IS a dev role)`;
    exampleGreeting = `"Hello! I'm excited to discuss your experience in ${focusDescription} as it relates to the ${config.context.targetRole} role. Today we'll be exploring your hands-on expertise, problem-solving approach, and practical experience at the ${config.context.experienceLevel} level. Let's dive in!"`;
  }

  return `Generate a warm, professional greeting for this ${config.interviewType} interview:

INTERVIEW TYPE & FOCUS:
${interviewFocus}

INTERVIEW CONTEXT:
- Skill / Role: ${config.context.targetRole}
- Candidate Experience Level: ${config.context.experienceLevel}
- Interview Style: ${interviewerStyle}, ${interviewerTone}

REQUIREMENTS:
- Write 2-3 natural, conversational sentences
- Welcome the candidate warmly
- Briefly mention the skill being assessed and set expectations
- Set a comfortable, professional tone appropriate for a skill assessment
- DO NOT use labels, bullet points, or structured format
- DO NOT include explanations or meta-text
- ONLY output the greeting text itself

Example format: ${exampleGreeting}${langInstruction ? '\n\n' + langInstruction : ''}`;
}

module.exports = {
  buildSkillInterviewGreetingUser,
};
