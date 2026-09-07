/**
 * Per-turn interview prompt: phase-aware, diversity-enforcing, and
 * differentiated between SKILL_TEST (knowledge-only) and AI_INTERVIEW
 * (blends behavioral/situational with technical). See campaign-interview.service.js
 * for how this is wired into the combined analyze+decide+generate LLM call.
 */

function buildMixedQuestionPrompt({
  transcript,
  conversationSummary,
  lastQuestion,
  coverage,
  shouldEnd,
  questionsAsked,
  maxQuestions,
  usedQuestionTypes = [],
  moduleType,
  interviewTopic,
  isSkipped = false,
  followUpStreak = 0,
}) {
  const totalProgress   = Math.round((questionsAsked / Math.max(maxQuestions, 1)) * 100);
  const phase =
    totalProgress < 25 ? "warm-up"
    : totalProgress < 60 ? "exploration"
    : totalProgress < 85 ? "deep-dive"
    : "closing";

  const remainingTopics = Object.entries(coverage.areas)
    .filter(([_, v]) => v.percentage < 75)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .map(([k, v]) => `${k} (${Math.round(v.percentage)}% covered)`);

  const topicsCovered = Object.entries(coverage.areas)
    .filter(([_, v]) => v.questionsAsked > 0)
    .map(([k, v]) => `${k}: ${Math.round(v.percentage)}% (${v.questionsAsked}q)`);

  const coverageLine = Object.entries(coverage.areas)
    .map(([k, v]) => `${k}=${Math.round(v.percentage)}%`)
    .join(" | ");

  const isSkillTest = moduleType === "SKILL_TEST";

  const allTypes = isSkillTest
    ? ["conceptual", "mechanics", "comparison", "edge-case", "best-practice", "problem-solving"]
    : ["behavioral", "situational", "technical", "problem-solving", "motivational"];
  const recentTypes = usedQuestionTypes.slice(-2);
  // AI_INTERVIEW converges on SKILL_TEST-style knowledge trivia when "technical"
  // dominates the mix — force a swing back to experience-based types (this is
  // what actually distinguishes a job interview from a knowledge test) once
  // technical questions cross half of everything asked so far.
  const humanTypes = ["behavioral", "situational", "motivational"];
  const technicalShare = usedQuestionTypes.length > 0
    ? usedQuestionTypes.filter(t => t === "technical" || t === "conceptual").length / usedQuestionTypes.length
    : 0;
  const forceHumanType = !isSkillTest && usedQuestionTypes.length >= 2 && technicalShare >= 0.5;
  const recommendedType = forceHumanType
    ? (humanTypes.find(t => !recentTypes.includes(t)) || "behavioral")
    : (allTypes.find(t => !recentTypes.includes(t)) || (isSkillTest ? "conceptual" : "situational"));

  const phaseGuide = isSkillTest
    ? {
        "warm-up":     "Open with ONE direct, low-pressure knowledge question that names a specific core concept, keyword, or mechanic of this skill (a 'difference between X and Y', a 'what does Z do'). NOT 'how would you describe your experience/familiarity with it', NOT years of experience or past projects. Start testing knowledge from question one.",
        "exploration": "Probe understanding of core mechanics, syntax, and standard patterns. Every question must name a specific function/API/keyword/setting — if it could apply to any skill, it's too general. Ask HOW and WHY things work, not whether they have used them. Vary conceptual, mechanics, and comparison questions.",
        "deep-dive":   "Test advanced knowledge: edge cases, trade-offs between approaches, common pitfalls, performance characteristics. Push for precision — probe if answers are vague.",
        "closing":     "One final knowledge probe on a still-uncovered area, then close warmly. No behavioral or resume-style questions.",
      }
    : {
        "warm-up":     "Build rapport. Keep questions broad and welcoming. Ask about background and overall experience. No pressure.",
        "exploration": "Dig into specific skills and past experiences. Mix behavioral (STAR method) and situational questions. Introduce topic variety.",
        "deep-dive":   "Push for depth. Explore trade-offs, challenges, and advanced knowledge. Connect to specific points from earlier answers.",
        "closing":     "Wrap up gracefully. Cover any significant coverage gaps. One final meaningful question, then prepare to close.",
      };

  const modeBanner = isSkillTest
    ? `\n╔══ ASSESSMENT MODE ══╗\nThis is a KNOWLEDGE assessment, not an experience interview.\nAsk direct questions about the skill itself — definitions, mechanics, comparisons, edge cases, best practices.\nDO NOT ask about years of experience, past projects, teams, or "tell me about a time…" style questions.\n`
    : "";
  const questionTypeEnum = isSkillTest
    ? "conceptual|mechanics|comparison|edge-case|best-practice|problem-solving|closing"
    : "behavioral|situational|technical|problem-solving|motivational|closing";

  return `
You are a warm, sharp interviewer having a real conversation — engaged and genuinely curious, not a script reading down a list. Use the full context below to generate your next move.
${modeBanner}

â•â•â•â• INTERVIEW TOPIC â•â•â•â•
${interviewTopic || "General assessment"}
Every question you ask MUST be directly relevant to this topic. Do not ask generic questions unrelated to it.

â•â•â•â• CONVERSATION HISTORY (last 4 turns) â•â•â•â•
${conversationSummary || "(interview just started â€” this is the first question after the greeting)"}

â•â•â•â• CANDIDATE'S LATEST ANSWER â•â•â•â•
${isSkipped ? "(The candidate chose to SKIP this question — no answer was given. Do not evaluate or reference an answer that does not exist.)" : `\"${transcript}\"`}

â•â•â•â• LAST QUESTION YOU ASKED â•â•â•â•
${lastQuestion ? `"${lastQuestion}"` : "(none yet â€” you just gave the opening greeting)"}

â•â•â•â• INTERVIEW PROGRESS â•â•â•â•
Questions asked: ${questionsAsked} / ${maxQuestions} | Phase: ${phase.toUpperCase()} (${totalProgress}% through)
Coverage: ${coverageLine}
Topics explored so far: ${topicsCovered.join(", ") || "none yet"}
Topics still needed (priority order): ${remainingTopics.join(", ") || "all areas sufficiently covered"}
Question types recently used: ${recentTypes.join(", ") || "none"}
Recommended next type (for variety): ${recommendedType}${forceHumanType ? `\nMANDATORY: technical/conceptual questions have dominated this interview so far — your next questionType MUST be "${recommendedType}" (behavioral, situational, or motivational), not another knowledge-trivia question.` : ""}

â•â•â•â• PHASE STRATEGY â•â•â•â•
${phaseGuide[phase]}

â•â•â•â• YOUR TASK â•â•â•â•
Step 1 â€” Evaluate the candidate's latest answer honestly.
Step 2 â€” Decide your next move:
  â€¢ "follow_up"      â†’ if the answer was vague, incomplete, or skipped a key detail that needs probing
  â€¢ "next_question"  â†’ if the answer was sufficient and you should move to a new topic or angle
  â€¢ "end_interview"  â†’ ONLY if SHOULD_END is true OR overall coverage across all areas â‰¥ 75%
${isSkipped ? `NOTE: the candidate SKIPPED this question without answering. decision MUST be "next_question" (never "follow_up" — there is nothing to probe), every coverageUpdates increase MUST be 0, and analysis.quality should be "avoided". Move on to a fresh topic or angle and do not reference or evaluate a nonexistent answer.` : ""}
NOTE: if the candidate's answer itself states or clearly implies they don't know, have no experience/knowledge of this, or cannot answer (e.g. "I don't know", "no idea", "I'm not familiar with this", "I don't have an answer for this") — treat this exactly like a skip, even though they didn't press the skip button: decision MUST be "next_question" (never "follow_up"), coverageUpdates MUST be 0 for that area, and analysis.completeness should be "avoided". Do NOT ask them to "give a real example", "describe a situation", or otherwise elaborate on something they just told you they don't know — pivot to a different topic or area instead.
NOTE: this is DIFFERENT from the candidate saying they don't UNDERSTAND the question (e.g. "explain more", "I don't understand the question", "can you clarify?", "what do you mean?", "can you rephrase that?"). This is a request for clarification, not a non-answer — do NOT treat it like a skip and do NOT pivot to a different topic. decision MUST be "follow_up", coverageUpdates MUST be 0 (nothing was answered yet), and analysis.completeness should be "avoided". Your nextQuestion must rephrase the SAME underlying question in simpler, more concrete terms — shorter sentences, a plain-language explanation of any jargon, or a small concrete example/scenario to anchor it. Do not repeat the original wording verbatim, and do not change the topic.
${followUpStreak >= 2 ? `MANDATORY: you have already followed up on this exact point ${followUpStreak} times in a row without landing a satisfactory answer. decision MUST be "next_question" this turn, no exceptions — pivot to a completely different topic or area. Do not ask for another example, situation, or clarification on the same point again.` : ""}

Step 3 â€” Generate the next question or closing statement following ALL of these rules:
  âœ“ You MAY open with a SHORT reaction, but ONLY referencing what the candidate LITERALLY said in "CANDIDATE'S LATEST ANSWER" above. Never say "you mentioned X" / "you said X" unless those exact words or ideas are in that answer — do not invent, paraphrase into something more specific, or attribute a claim they didn't make.
  âœ“ If their latest answer was short, vague, empty, off-topic, or skipped: DO NOT fake a callback. Go straight to the question, or use a bare "Okay.". Never hollow filler ("That's great", "Interesting", "Thanks for sharing", "Good answer").
  âœ“ When they genuinely nailed a specific point, you may name that exact point before going deeper. When they were thin, stay neutral and let the next question test the gap, don't call it out.
  âœ“ Vary your opening and rhythm every turn, never the same lead-in twice in a row.
  âœ“ Ask what a genuinely curious interviewer would want to know next given what they just said, follow the thread rather than jumping to the next checklist item.
  âœ“ Use a DIFFERENT question type than the last 2 (avoid: ${recentTypes.join(", ") || "none"})
  âœ“ One question only â€” never compound questions or sub-questions
  âœ“ For "follow_up" ON A CLARIFICATION REQUEST: don't probe deeper — rephrase the SAME question in simpler/more concrete terms instead
  âœ“ For "follow_up" otherwise: name the specific point, then probe deeper on exactly that
  âœ“ For "next_question": one natural transition, then the question
  âœ“ For "end_interview": warm, professional closing statement â€” not a question
  âœ“ Match the tone and depth to the "${phase}" phase

SHOULD END: ${shouldEnd}

Return ONLY valid JSON â€” no extra text, no markdown:
{
  "analysis": {
    "quality": "poor|fair|good|excellent",
    "score": <0-100>,
    "completeness": "complete|partial|minimal|avoided",
    "keyPoints": ["<key observation 1>", "<key observation 2>"]
  },
  "coverageUpdates": [
    { "area": "<area_key>", "increase": <0-25> }
  ],
  "decision": "next_question|follow_up|end_interview",
  "questionType": "${questionTypeEnum}",
  "nextQuestion": "<next question or closing statement>",
  "report": {
    "strengths": ["<strength observed>"],
    "areasForImprovement": ["<area to develop>"],
    "overallProgress": <0-100>
  }
}

Coverage increase guide:
  0     = answer was off-topic, avoided, or empty
  5â€“10  = partial or shallow answer â€” touched the area but lacked depth
  10â€“15 = reasonable answer with some substance
  15â€“20 = solid, well-articulated answer
  20â€“25 = expert-level, detailed, insightful answer

If SHOULD END is true OR all areas have coverage â‰¥ 75%, decision MUST be "end_interview".
`;
}

// Rotate the last-resort question so a run of failures doesn't read as
// the interview being stuck on one literal sentence -- only ever seen if
// BOTH LLM attempts in campaign-interview.service.js fail.
const FALLBACK_QUESTIONS = [
  "That's helpful, thank you. Let's shift gears -- what's an area you'd like to grow in next?",
  "Got it, thanks for sharing. Moving on -- what draws you to this kind of work?",
  "Appreciate that. Let's talk about something different -- how do you usually approach a new challenge?",
];

function buildTurnFallback({ shouldEnd, isSkipped, questionsAsked }) {
  return {
    analysis: { quality: "fair", score: 50, completeness: "partial", keyPoints: [] },
    coverageUpdates: [],
    decision: shouldEnd ? "end_interview" : "next_question",
    questionType: "situational",
    nextQuestion: shouldEnd
      ? "Thank you so much for your time today — I really enjoyed our conversation. That brings us to the end of this session."
      : isSkipped
        ? "No problem, let's move on. Could you tell me about a different experience relevant to this role?"
        : FALLBACK_QUESTIONS[questionsAsked % FALLBACK_QUESTIONS.length],
    report: { strengths: [], areasForImprovement: [], overallProgress: 30 },
  };
}

module.exports = { buildMixedQuestionPrompt, buildTurnFallback };
