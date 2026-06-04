'use strict';

/**
 * Prompts used by: QuestionGeneratorAI, interviewSetup (greeting, silence)
 * (question styles, question generation, greeting, silence prompt)
 */

// ── Language injection ────────────────────────────────────────────────────────

function getLanguageInstruction(config) {
  const lang = config?.sessionSettings?.language || 'en';
  const map = {
    fr: 'CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in French. Every single word — questions, greetings, follow-ups — must be in French. Do NOT use English at all.',
    de: 'CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in German (Deutsch). Every single word must be in German. Do NOT use English at all.',
    es: 'CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in Spanish (Español). Every single word must be in Spanish. Do NOT use English at all.',
    ar: 'CRITICAL LANGUAGE RULE: You MUST respond ENTIRELY in Arabic (العربية). Every single word must be in Arabic. Do NOT use English at all.',
  };
  return map[lang] || '';
}

// ── Question style definitions ────────────────────────────────────────────────

const UNIVERSAL_STYLES = {
  situational: {
    id: 'situational',
    instruction: `STYLE: SITUATIONAL — Frame your question as a hypothetical scenario. Start with "Imagine..." or "Suppose you..." and place the candidate in a realistic work situation related to the target area. The scenario should require them to explain their approach, not just recall a past event.`,
    minTurn: 0,
    requiresContext: false,
  },
  'problem-finding': {
    id: 'problem-finding',
    instruction: `STYLE: PROBLEM-FINDING — Present a flawed approach, design decision, or technical strategy related to the target area and ask the candidate to identify what's wrong with it. For example: "A developer proposes [X approach] for [Y problem]. What issues do you see?" The flaw should be realistic and calibrated to the candidate's assessed difficulty level.`,
    minTurn: 2,
    requiresContext: false,
  },
  challenge: {
    id: 'challenge',
    instruction: `STYLE: CHALLENGE — Push back on something the candidate said in their last answer to test depth and conviction. Reference a specific claim they made and present a counterpoint or edge case. For example: "You mentioned X, but what about Y? How would you handle that?" Be respectful but probing.`,
    minTurn: 1,
    requiresContext: true,
  },
};

const FRAMEWORK_STYLE_INSTRUCTIONS = {
  'scenario-based':          'STYLE: SCENARIO-BASED — Ask a question grounded in a realistic work scenario specific to the domain.',
  'code review':             'STYLE: CODE REVIEW — Describe a coding approach, design pattern, or architecture decision verbally and ask the candidate to critique it, identify potential issues, or suggest improvements. This is entirely verbal — do NOT present actual code.',
  'architecture discussion': 'STYLE: ARCHITECTURE DISCUSSION — Ask about system design, architectural trade-offs, or scaling decisions.',
  'debugging walkthrough':   'STYLE: DEBUGGING WALKTHROUGH — Describe a bug symptom and ask how they would diagnose and fix it.',
  'behavioral STAR':         'STYLE: BEHAVIORAL STAR — Ask for a specific past experience. Expect the candidate to describe the Situation, Task, Action, and Result.',
  'values-based':            'STYLE: VALUES-BASED — Ask about personal values, ethics, or principles relevant to the role.',
  'motivational':            'STYLE: MOTIVATIONAL — Ask what drives the candidate, their career goals, or what excites them about this role.',
  'role-play':               "STYLE: ROLE-PLAY — Set up a brief role-play scenario (e.g., \"I'm a client who says X. How do you respond?\").",
  'deal walkthrough':        'STYLE: DEAL WALKTHROUGH — Ask the candidate to walk through a deal or project end-to-end.',
  'objection handling':      'STYLE: OBJECTION HANDLING — Present an objection and ask how they would respond.',
  'pipeline review':         'STYLE: PIPELINE REVIEW — Ask about pipeline management, forecasting, or deal qualification.',
  'portfolio review':        'STYLE: PORTFOLIO REVIEW — Ask the candidate to walk through a piece of their work or portfolio.',
  'design critique':         'STYLE: DESIGN CRITIQUE — Describe a design and ask for their critique of it.',
  'whiteboard exercise':     'STYLE: WHITEBOARD — Ask the candidate to walk through their solution design step by step, explaining each component and how they connect. This is entirely verbal — do NOT present actual code or diagrams.',
  'case study':              'STYLE: CASE STUDY — Present a business case and ask for their analysis.',
  'prioritization exercise': 'STYLE: PRIORITIZATION — Present competing priorities and ask how they would decide.',
  'metrics discussion':      'STYLE: METRICS — Ask about KPIs, success metrics, or how they measure impact.',
  'roadmap review':          'STYLE: ROADMAP REVIEW — Ask about product roadmap decisions, sequencing, or trade-offs.',
  'SQL challenge':           'STYLE: SQL CHALLENGE — Describe a data retrieval or transformation problem and ask the candidate to explain their query approach and reasoning step by step. This is entirely verbal — do NOT present actual code or SQL.',
  'analysis walkthrough':    'STYLE: ANALYSIS WALKTHROUGH — Ask the candidate to walk through an analytical approach step by step.',
  'reflective':              'STYLE: REFLECTIVE — Ask the candidate to reflect on a lesson learned or a growth experience.',
  'campaign analysis':       "STYLE: CAMPAIGN ANALYSIS — Ask the candidate to analyze a campaign's performance.",
  'deal storytelling':       'STYLE: DEAL STORYTELLING — Ask the candidate to tell the story of a specific deal or negotiation.',
  'portfolio discussion':    'STYLE: PORTFOLIO DISCUSSION — Ask the candidate to discuss a specific piece from their portfolio.',
};

// ── Question generation system prompts ────────────────────────────────────────

function buildQuestionGeneratorSystem({
  langInstruction,
  personaBlock,
  profileBlock,
  strategyBlock,
  questionGuidelines,
  styleInstruction,
  questionStyleBlock,
  questionStyleId,
}) {
  return `You are an expert interviewer. Generate ONE targeted question.${langInstruction ? '\n\n' + langInstruction : ''}
${personaBlock}
${profileBlock}
${strategyBlock}

${questionGuidelines}
${styleInstruction}
${questionStyleBlock}

RULES:
- ONE clear question, 1-2 sentences, max 40 words
- No preambles ("That's great...", "Interesting...")
- No multi-part questions
- Target the specified coverage gap
- Be natural and conversational
- NEVER ask the candidate to write, read, or review actual code snippets. This is a verbal interview — all questions must be conversational.
- Questions MUST be directly relevant to the JOB REQUIREMENTS and RESPONSIBILITIES listed above. Do NOT ask about technologies, tools, or concepts not mentioned in the JD.
- PRIORITIZE asking about skills from the "JD SKILLS NOT YET ASKED ABOUT" list. Each question should target a DIFFERENT uncovered skill.
- NEVER ask a question similar to any in the "ALREADY ASKED" list
- Each question must explore a NEW angle or sub-topic not yet covered
- Within the same focus area, each question MUST explore a DIFFERENT sub-topic. If you already asked about middleware, ask about database design, caching, API design, or another sub-topic next. Check the "TOPICS ALREADY EXPLORED" list below.
- CALIBRATE question difficulty to the EXPERIENCE LEVEL above:
  * Junior/Entry: ONLY basic concepts, "what is", "how would you", simple practical scenarios. NO system design, NO advanced patterns, NO questions about tools/technologies NOT listed in the JD (e.g., do NOT ask about GraphQL if the JD only mentions REST APIs). Keep questions SIMPLE and FOUNDATIONAL.
  * Mid-Level: Practical experience questions, trade-off discussions, real project examples
  * Senior: Architecture decisions, system design, leadership, cross-team impact
  * Lead/Principal: Strategic thinking, org-wide impact, technical vision
  HARD RULE: For Junior/Entry level, NEVER ask about: system design, microservices, GraphQL (unless in JD), distributed systems, architecture patterns, caching strategies, or any advanced topic. Stick to BASICS of the required skills.

RESPONSE FORMAT (JSON only):
{
  "question": "the actual question",
  "targetAreas": ["area"],
  "reasoning": "why this question",
  "expectedOutcomes": ["what we learn"],
  "followUpStrategy": "approach",
  "questionStyle": "${questionStyleId || 'direct'}"
}`;
}

function buildTargetedQuestionSystem(language) {
  const langInstruction = getLanguageInstruction({ sessionSettings: { language } });
  return `Generate a specific, targeted question to explore a particular competency area in depth.${langInstruction ? '\n\n' + langInstruction : ''}

REQUIREMENTS:
- Focus specifically on the target competency area
- Consider candidate's previous responses about this area
- Ask for concrete examples and specific experiences
- Progress from general to specific based on what's already known
- Be engaging and allow candidate to showcase their expertise

CRITICAL: You MUST respond with valid JSON only. No markdown, no code blocks, no extra text.

RESPONSE FORMAT (JSON only):
{
  "question": "targeted question for the specific area",
  "focus": "specific aspect of the area being explored",
  "expectedEvidence": ["types of evidence this should reveal"],
  "probeLevel": "surface|moderate|deep",
  "followUpQuestions": ["potential follow-up questions"]
}`;
}

// ── Greeting prompts ──────────────────────────────────────────────────────────

function buildGreetingSystem(config) {
  const langInstruction = getLanguageInstruction(config);
  return `You are a professional interviewer. Your task is to generate ONLY the greeting text - nothing else. Do not include labels, explanations, or formatting. Just write the natural greeting sentences.${langInstruction ? '\n\n' + langInstruction : ''}`;
}

function buildGreetingUser(config, persona) {
  const interviewerStyle = config.interviewerPersona?.style || 'professional';
  const interviewerTone  = persona?.agentBehavior?.tone || config.interviewerPersona?.tone || 'friendly';
  const cultureTrait     = config.companyProfile?.culture?.values?.[0] || 'innovation';

  let personaContext = '';
  if (persona?.idealCandidate) {
    const domainTopics = persona.agentBehavior?.domainTopics?.slice(0, 3).join(', ') || '';
    const mustHaves    = persona.idealCandidate?.mustHaveSkills?.slice(0, 3).join(', ') || '';
    personaContext = `
JOB-SPECIFIC CONTEXT (use to make greeting relevant):
- Job Category: ${persona.jobCategory}
- Key Skills to Explore: ${mustHaves}
- Domain Topics: ${domainTopics}
- Tone: ${persona.agentBehavior?.tone || 'professional'}
- Seniority: ${persona.idealCandidate?.seniorityExpectations || 'standard'}`;
  }

  let interviewFocus = '';
  let exampleGreeting = '';

  if (config.interviewType === 'TECHNICAL_SKILL') {
    const focusAreaNames = config.intelligenceContext?.focusAreas?.map(a => a.skillName || a.area) || [];
    const focusDescription = focusAreaNames.length > 0 ? focusAreaNames.join(', ') : 'domain-specific expertise';
    interviewFocus = `This is a SKILL ASSESSMENT interview for the role of "${config.context.targetRole}" at ${config.context.experienceLevel} level.

FOCUS:
- Assess practical expertise in: ${focusDescription}
- Probe for hands-on experience and real-world results
- Match the greeting to the role's domain (NOT generic software engineering unless the role IS a dev role)`;
    exampleGreeting = `"Hello! I'm excited to discuss your experience in ${focusDescription} as it relates to the ${config.context.targetRole} role. Today we'll be exploring your hands-on expertise, problem-solving approach, and practical experience at the ${config.context.experienceLevel} level. Let's dive in!"`;
  } else if (config.interviewType === 'HR_INTERVIEW') {
    interviewFocus  = `This is a BEHAVIORAL and CULTURAL FIT interview focusing on soft skills, teamwork, and alignment with company values.`;
    exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's have a great conversation about your experience and how you can contribute to our team."`;
  } else if (config.interviewType === 'SOFT_SKILL') {
    interviewFocus  = `This is a SOFT SKILLS and COMMUNICATION assessment focusing on interpersonal abilities, emotional intelligence, and collaboration.`;
    exampleGreeting = `"Hello! Today we'll be discussing your communication style and collaboration experiences. I'm looking forward to understanding how you work with others and handle various workplace scenarios."`;
  } else {
    interviewFocus  = `Standard professional interview.`;
    exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position. Let's have a great conversation."`;
  }

  const langInstruction = getLanguageInstruction(config);
  return `Generate a warm, professional greeting for this ${config.interviewType} interview:

INTERVIEW TYPE & FOCUS:
${interviewFocus}
${personaContext}

INTERVIEW CONTEXT:
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Candidate Experience Level: ${config.context.experienceLevel}
- Interview Style: ${interviewerStyle}, ${interviewerTone}
- Company Values: ${cultureTrait}

REQUIREMENTS:
- Write 2-3 natural, conversational sentences
- Welcome the candidate warmly
- Briefly mention the position and set expectations for the interview type
- If persona context is available, reference specific aspects of the role (domain, key topics)
- Set a comfortable, professional tone appropriate for ${config.interviewType}
- DO NOT use labels, bullet points, or structured format
- DO NOT include explanations or meta-text
- ONLY output the greeting text itself

Example format for ${config.interviewType}: ${exampleGreeting}${langInstruction ? '\n\n' + langInstruction : ''}`;
}

// ── Silence prompt ────────────────────────────────────────────────────────────

function buildSilenceUser({ config, recentMessages, silenceData }) {
  return `Generate a supportive, encouraging message for a candidate who has been silent for ${silenceData.silenceDuration} seconds during an interview.

CONTEXT:
- This is silence instance #${silenceData.silenceCount}
- Position: ${config.context.targetRole}
- Company: ${config.context.targetCompany}
- Interview Type: ${config.interviewType}

RECENT CONVERSATION:
${recentMessages}

REQUIREMENTS:
- Write 1-2 natural, encouraging sentences
- Be warm and supportive, not pushy
- Help the candidate feel comfortable to continue
- DO NOT use labels, bullet points, or explanations
- ONLY output the encouraging text itself

Example: "Take your time - there's no rush. Would you like me to rephrase the question in a different way?"`;
}

module.exports = {
  getLanguageInstruction,
  UNIVERSAL_STYLES,
  FRAMEWORK_STYLE_INSTRUCTIONS,
  buildQuestionGeneratorSystem,
  buildTargetedQuestionSystem,
  buildGreetingSystem,
  buildGreetingUser,
  buildSilenceUser,
};
