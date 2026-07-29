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

  const exampleWithIntro = `"Hello! I'm Olga, your AI interviewer. I'm excited to speak with you today for the ${targetRole} assessment. To get started, could you tell me a bit about your familiarity with ${targetRole}?"`;

  return `Generate a short, warm greeting for this skill assessment interview that ends by asking the candidate about their familiarity/comfort level with the skill itself.

CONTEXT:
- Agent name: Olga
- Role / Skill: ${targetRole}
- Tone: ${interviewerTone}

REQUIREMENTS:
- Maximum 2-3 short sentences
- First sentence: introduce yourself as Olga the AI interviewer
- Second sentence: welcome the candidate and mention the role or skill being assessed
- Last sentence: ask about their familiarity, comfort level, or general exposure to the SKILL itself (e.g. "how familiar are you with X" / "how comfortable are you with X") -- NOT a generic "tell me about yourself", and NOT anything about their job, employer, employment status, or years of professional experience
- Do NOT mention any specific technologies, tools, topics, or what will be covered
- Keep it simple, friendly, and natural
- Vary the phrasing/wording each time -- do not default to the exact example below
- ONLY output the greeting text itself — no labels, no meta-text

Example (for tone/structure reference only, do not copy verbatim): ${exampleWithIntro}${langInstruction ? '\n\n' + langInstruction : ''}`;
}

/**
 * Question-generation guidelines for a standalone TECHNICAL_SKILL assessment.
 * Surfaces each tracked coverage area's concrete indicators (not just its bare
 * name) so questions target specific, real-world angles instead of defaulting
 * to generic definitions.
 *
 * @param {string} targetRole    - the skill being assessed (e.g. "React")
 * @param {object} coverageAreas - session.coverage.areas
 * @param {string} experienceLevel
 * @param {string[]} askedQuestions - (optional) questions already asked this session
 */
function buildTechnicalSkillGuidelines(targetRole, coverageAreas, experienceLevel, askedQuestions = []) {
  const focusAreaEntries = Object.entries(coverageAreas || {});
  const focusAreaBlock = focusAreaEntries.length
    ? `\nSUB-TOPICS TO PROBE (spread across these -- do not stay on one for more than 2 consecutive questions):\n` +
      focusAreaEntries.map(([area, d]) => {
        const indicatorLine = d.indicators?.length ? `\n  concrete angles: ${d.indicators.join('; ')}` : '';
        return `- ${area}${d.description ? ` -- ${d.description}` : ''}${indicatorLine}`;
      }).join('\n')
    : '';

  const askedBlock = askedQuestions.length
    ? `\nQUESTIONS ALREADY ASKED THIS SESSION (do not repeat, rephrase, or ask a near-duplicate of any of these -- and do not ask another question centered on the same broad theme, e.g. if one was about migration, do not ask another migration question):\n` +
      askedQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : '';

  return `
TECHNICAL SKILL ASSESSMENT for "${targetRole}".
This is a standalone skill assessment -- there is usually no job description to anchor on, so YOU must decide what to probe based on how "${targetRole}" is actually used in real work: core concepts, common patterns and idioms, tooling, debugging, performance/trade-offs, and best practices.
${focusAreaBlock}${askedBlock}

QUESTION SUBSTANCE RULES:
- Every question must target a concrete, real-world aspect of "${targetRole}" -- never a vague "tell me about your experience" restated in different words.
- Pull from the "concrete angles" listed under each sub-topic above -- turn one of those angles into a specific applied question, don't just restate the area name as a question.
- Ask exactly ONE question per turn. Never stack multiple sub-questions in the same message ("Explain X. Also, what about Y?") -- pick the single sharpest angle and ask only that. Output ONLY that one question -- one or two sentences at most, no compound questions joined by "and", no numbered lists, no follow-up appended in the same turn.
- BANNED PATTERNS -- never ask: "What is ${targetRole}?", "What do you know about ${targetRole}?", "Can you explain ${targetRole}?", "What are the benefits/features of ${targetRole}?", or any other bare definition/textbook-recall question. These are too generic to differentiate skill level.
- ADDITIONAL BANNED PATTERNS -- never ask:
  - "Can you describe a time when you used ${targetRole}..." / "Tell me about a time when..." -- this is a behavioral/soft-skill format, not a technical depth question. Ask about the MECHANISM directly instead ("What happens when X" / "How would you solve Y"), not about the candidate's personal history using it.
  - "What steps would you take to migrate/transition/set up X?" or any open-ended process/checklist question -- these test project-management instinct, not knowledge of "${targetRole}" itself, and any candidate can list generic steps without demonstrating real depth.
  - "Imagine you're tasked with [broad multi-step project]. What would you do?" -- too broad to differentiate skill level; if using a scenario, anchor it on ONE specific technical decision point, not a whole project plan.
- Do not center more than one question in the session around migration, project setup, or general tooling choices -- these produce process-y answers, not depth. If migration/adoption of "${targetRole}" is relevant, ask about ONE concrete technical trade-off within it (e.g. a specific incompatibility, a specific error, a specific design choice), never "what steps would you take" as a whole.

GOOD QUESTION SHAPES -- apply this PATTERN and DEPTH to "${targetRole}" (these are structural templates, not React-specific facts -- adapt the underlying mechanism to whatever "${targetRole}" actually involves):
- COMPARE + WHEN (any level): "What's the difference between [concept A] and [concept B] in ${targetRole}, and when would you use one over the other?"
- DIAGNOSE A SYMPTOM (intermediate+): "[A common failure/inefficiency in ${targetRole}] is happening. How would you identify the cause, and what would you check first?"
- INTERNALS / "WHAT ACTUALLY HAPPENS" (intermediate+): "What actually happens internally when [a core operation in ${targetRole}] is triggered?"
- OPTIMIZE UNDER A CONSTRAINT (advanced): "[A realistic scale/performance constraint relevant to ${targetRole}] -- what approach would you take and why?"
- OPEN SYSTEM-DESIGN SCENARIO (advanced/senior only, use sparingly -- at most 1-2 per interview): a multi-requirement scenario plausible for ${targetRole} that forces the candidate to justify a structural choice, not just name a tool.
Every one of these carries a WHY, a WHEN, a symptom to diagnose, or a constraint to design around -- even the simplest, most beginner-appropriate version of a question is never a bare "what is X".
- Prefer applied and scenario framing ("How would you handle X", "What would you do if Y broke in production") over pure definitions -- definitions are easy to memorize and reveal little. This is different from a behavioral "tell me about a time" question: the scenario should be generic/hypothetical-technical ("if a system did Y"), not a request for the candidate's personal history.
- Vary the ANGLE each turn: if the previous question was conceptual, make this one applied, a debugging scenario, or a trade-off/design decision -- never two questions of the same angle back to back.
- If the candidate's last answer was strong, go one level deeper on that same sub-topic (edge cases, scale, failure modes) before moving on. If it was weak, shallow, or off-topic, ask ONE follow-up to confirm before pivoting -- don't abandon a sub-topic on a single weak signal, but don't loop on it past two follow-ups either.
- NEVER ask about the candidate's employment status, current job or company, years of professional experience, resume, or career history. This is a skills-only assessment -- probe knowledge and ability directly (what they know, how they'd approach a problem), not their work background. Phrase scenarios generically ("if you were building X" / "if a system did Y"), not "in your current job" or "at your company".

Experience Level: ${experienceLevel} -- calibrate question complexity accordingly:
- beginner: core mechanics, common single-concept comparisons, everyday debugging
- intermediate: trade-offs, less obvious internals, multi-concept interactions
- advanced/senior: performance under constraints, architectural decisions, failure modes at scale
(this is about depth/difficulty only, never ask the candidate to state their experience level or employment status directly).`;
}

/**
 * Question-generation guidelines for a standalone SOFT_SKILL assessment.
 *
 * @param {string} targetRole - the soft skill being assessed (e.g. "Communication")
 * @param {string} experienceLevel
 * @param {string[]} exploredThemes - (optional) sub-themes already covered this session
 */
function buildSoftSkillGuidelines(targetRole, experienceLevel, exploredThemes = []) {
  const allThemes = [
    'teamwork and collaboration',
    'giving or receiving critical feedback',
    'handling disagreement or conflict',
    'adapting to unexpected change',
    'communicating under pressure or ambiguity',
    'ownership and accountability for a mistake',
    'prioritization when facing competing demands',
    'influencing others without formal authority',
  ];

  const remainingThemes = allThemes.filter(t => !exploredThemes.includes(t));
  const themeBlock = `\nSUB-THEMES TO ROTATE THROUGH (pick ONE not yet covered for this question):\n` +
    (remainingThemes.length ? remainingThemes : allThemes).map(t => `- ${t}`).join('\n') +
    (exploredThemes.length ? `\n\nALREADY COVERED THIS SESSION (do not repeat unless deepening the same story):\n` + exploredThemes.map(t => `- ${t}`).join('\n') : '');

  return `
SOFT SKILLS ASSESSMENT${targetRole ? ` for "${targetRole}"` : ''}.
Evaluate communication, emotional intelligence, collaboration, adaptability, and conflict handling -- through concrete stories, not abstract self-description.
${themeBlock}

QUESTION SUBSTANCE RULES:
- Use behavioral/STAR-style prompts ("Tell me about a time when...", "Describe a situation where...") that force a specific real example, not a self-rating like "how good are you at teamwork".
- NEVER ask purely hypothetical questions ("What would you do if..."). Always anchor on a real past experience -- hypotheticals let candidates describe an idealized response instead of revealing actual behavior.
- Ask exactly ONE question per turn -- don't combine two prompts into one message.
- Rotate to a new sub-theme each question, chosen from the list above -- never repeat a sub-theme already covered unless you are deliberately deepening the SAME story with a follow-up.
- If an answer stays vague or generic, ask ONE follow-up that pushes for a concrete outcome, a specific action taken, or the other person's reaction -- on that SAME story, not a new topic. After one such follow-up, move to a new sub-theme regardless of how the follow-up went.
- The example can come from ANY context -- work, school, volunteering, personal projects, group activities. Do NOT ask about employment status, job title, company, or years of professional experience; never require the story to be from a formal job.
- Avoid leading questions that hint at the "correct" answer (e.g. don't ask "Did you calmly resolve the conflict by listening first?" -- ask "How did you handle it?" and let the candidate reveal their actual approach).

Experience Level: ${experienceLevel} -- calibrate expectations accordingly:
- beginner: simpler group/peer scenarios, straightforward outcomes
- intermediate: scenarios involving ambiguity, multiple stakeholders, or unresolved tension
- advanced/senior: scenarios requiring influence without authority, mentoring, or navigating organizational-level conflict`;
}

module.exports = {
  buildSkillInterviewGreetingUser,
  buildTechnicalSkillGuidelines,
  buildSoftSkillGuidelines,
};