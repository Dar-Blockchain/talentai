'use strict';

const { getLanguageInstruction } = require('../../shared/prompts/generation.prompts');

/**
 * Greeting user prompt for job-based interviews (HR_INTERVIEW, POST_INTERVIEW, etc.).
 * Requires config.context.targetCompany to be set.
 */
function buildPostInterviewGreetingUser(config, persona) {
  const langInstruction = getLanguageInstruction(config);
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

  let interviewFocus;
  let exampleGreeting;

  if (config.interviewType === 'HR_INTERVIEW') {
    interviewFocus  = `This is a BEHAVIORAL and CULTURAL FIT interview focusing on soft skills, teamwork, and alignment with company values.`;
    exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position at ${config.context.targetCompany}. Let's have a great conversation about your experience and how you can contribute to our team."`;
  } else {
    interviewFocus  = `Standard professional interview.`;
    exampleGreeting = `"Hello! I'm excited to speak with you today about the ${config.context.targetRole} position. Let's have a great conversation."`;
  }

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

/**
 * User prompt for buildAgentPersona — creates a job-aware AI profile from job data.
 */
function buildAgentPersonaUser({ title, company, description, skills, requirements, responsibilities, experienceLevel, jobCategory, interviewType }) {
  return `Title: ${title}
Company: ${company || ''}
Description: ${description || ''}
Required Skills: ${JSON.stringify(skills || [])}
Requirements: ${JSON.stringify(requirements || [])}
Responsibilities: ${JSON.stringify(responsibilities || [])}
Experience Level: ${experienceLevel || 'mid'}
Category: ${jobCategory}
Interview Type: ${interviewType}

Return JSON:
{
  "mustHaveSkills": ["3-5 SHORT skill/technology NAMES only (e.g., 'Next.js', 'Express.js', 'TypeScript') — extract ONLY the skill name, NOT the full requirement sentence"],
  "niceToHaveSkills": ["3-5 bonus skills inferred from the JD"],
  "keyBehaviors": ["3-5 needed behaviors"],
  "redFlags": ["3-5 disqualifying signs"],
  "seniorityExpectations": "one sentence",
  "domainSpecificTopics": ["3-5 industry topics to explore"],
  "agentTone": "description of interviewer tone for this role",
  "focusAreas": {
    "area_key_1": { "weight": 30, "description": "What this area evaluates — specific to JD", "indicators": ["3-4 specific indicators from JD"] },
    "area_key_2": { "weight": 25, "description": "...", "indicators": ["..."] },
    "area_key_3": { "weight": 25, "description": "...", "indicators": ["..."] },
    "area_key_4": { "weight": 20, "description": "...", "indicators": ["..."] }
  },
  "questionStyles": ["4 interview styles suited for this role"]
}

RULES for focusAreas:
- Focus areas MUST be derived from the REQUIRED SKILLS and REQUIREMENTS — NOT from responsibilities
- Required Skills are the PRIMARY driver: each focus area should cluster around 1-2 required skills/technologies
- Responsibilities are SECONDARY context — they show HOW skills are applied, not WHAT to test
- Do NOT create a separate focus area for something that is only a sub-task in one responsibility (e.g., "SEO" mentioned once in "optimizing for SEO and performance" should NOT become its own area — it belongs as a minor indicator under the relevant skill area)
- Generate 4 areas SPECIFIC to this JD — NOT generic areas like "technical_depth" or "problem_solving"
- Weights must sum to 100
- Example for JD with Required Skills [Next.js, Express.js, Node.js]: "nextjs_frontend" (30%), "expressjs_backend" (25%), "javascript_typescript" (25%), "testing_quality" (20%)
- Example for Android Developer JD: "kotlin_java" (30%), "android_platform" (25%), "architecture_patterns" (25%), "testing_devops" (20%)
- area_key must be lowercase with underscores, max 25 chars
- questionStyles: pick 4 from: scenario-based, code review, architecture discussion, debugging walkthrough, behavioral STAR, situational, values-based, role-play, case study, portfolio review, whiteboard exercise, prioritization exercise, metrics discussion, analysis walkthrough, reflective`;
}

/**
 * User prompt for generateFinalReport LLM summary call.
 */
function buildFinalReportUser({ persona, finalScore, qualityScore, responseQualities, coverageScore, demonstrated, gaps, areaScores, conversationSummary, mustHaveSkills, mustHavesCovered, mustHavesMissed, totalResponses }) {
  const mustHaveBlock = mustHaveSkills.length > 0
    ? `\nREQUIRED SKILLS AUDIT:\n- Role requires: ${mustHaveSkills.join(', ')}\n- Candidate demonstrated: ${mustHavesCovered.join(', ') || 'none'}\n- Not demonstrated: ${mustHavesMissed.join(', ') || 'none'}`
    : '';

  return `Role: ${persona.job?.title || 'Unknown'} at ${persona.job?.company || 'Unknown'}

PRE-COMPUTED DATA (use directly — do not re-score):
- Overall Score: ${finalScore}/100
- Response Quality: ${qualityScore}/100 (${totalResponses} candidate responses)
- Topic Coverage: ${coverageScore}%
- Demonstrated Skills: ${demonstrated.join(', ') || 'none identified'}
- Skill Gaps: ${gaps.join(', ') || 'none identified'}${mustHaveBlock}

COMPETENCY AREA BREAKDOWN:
${areaScores}

RECENT CONVERSATION (last 20 exchanges):
${conversationSummary}

Return ONLY valid JSON with ALL fields. Be specific and evidence-based — reference what the candidate actually said or demonstrated:
{
  "summary": "2-3 sentences describing what topics were discussed and how the candidate engaged. Reference specific subjects covered. Do NOT evaluate — only summarize.",
  "recommendation": "strong_hire | hire | maybe | no_hire",
  "reasoning": "3-5 sentences justifying the recommendation. Cite the pre-computed scores (quality=${qualityScore}, coverage=${coverageScore}, overall=${finalScore}) and concrete observations. Be honest about both strengths and gaps.",
  "keyDecisionFactors": ["2-3 specific, evidence-based observations that most influenced this recommendation. Each must reference something concrete from the interview — not generic statements."],
  "hiringRisks": ["1-3 concrete concerns a hiring manager should know, even for a hire recommendation — gaps in required skills, coverage blind spots, or behavioral concerns observed. Empty array if there are no meaningful risks."],
  "developmentAreas": ["2-3 specific, actionable development areas tied to this role if the candidate is hired. Role-specific and concrete — not generic advice like 'improve communication'."]
}`;
}

module.exports = {
  buildPostInterviewGreetingUser,
  buildAgentPersonaUser,
  buildFinalReportUser,
};
