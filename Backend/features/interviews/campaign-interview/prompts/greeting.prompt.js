/**
 * Opening-greeting prompt construction for both module types, plus the
 * static fallback greeting used if the LLM call fails.
 */

function buildGreetingUserMessage(context, moduleType, skill) {
    const systemPrompt   = context.systemPrompt;
    const topic          = context.topic || skill || "this subject";
    const tone           = context.tone || "warm, welcoming, professional";
    const openingContext = context.openingContext;
    const userMsg =
      moduleType === "SKILL_TEST"
        ? `Generate a warm, professional opening message to start a ${topic} KNOWLEDGE assessment.
The message must:
1. Greet the candidate using "I" — do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Set expectations briefly — this is a knowledge check on ${topic}: definitions, concepts, mechanics, best practices. NOT an interview about their experience, projects, or background.
3. End with a direct opening knowledge question — for example, asking them to explain what ${topic} is in their own words, or to describe one of its core building blocks. Do NOT ask about experience, projects, or how long they've used it.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets.
Never ask about experience, seniority, employers, or past projects — this is a knowledge test, not a job interview.
Tone: encouraging, professional, human. Not robotic.
Length: 3â€“4 sentences maximum. No bullet points, no headers.`
        : `Generate a warm, professional opening message to start an interview${openingContext ? ` covering: ${openingContext}` : ` on the topic: "${topic}"`}.
The message must:
1. Greet the candidate using "I" â€” do NOT include any name, placeholder, or bracket like [Your Name]. Just say "I" or "I'm your interviewer today".
2. Briefly and naturally mention what this conversation will explore${openingContext ? "" : ` â€” "${topic}"`} and that it's a conversation, not a test.
3. End with an open warm-up question related to "${topic}" â€” for example, asking about their overall experience with it or how they've worked with it in the past.

IMPORTANT: Never output placeholders like [Your Name], [Name], or any text in square brackets. Speak naturally in your own words â€” never quote or copy any source brief verbatim.
Tone: ${tone}. Not robotic.
Length: 3â€“4 sentences maximum. No bullet points, no headers.`;
  return { systemPrompt, userMsg };
}

function fallbackGreeting(moduleType, skill) {
    const topic = skill || "technical";
    return moduleType === "SKILL_TEST"
      ? `Welcome! I'm your interviewer today and I'll be guiding you through a ${topic} knowledge assessment. This is a knowledge check — we'll cover core concepts, mechanics, and best practices of ${topic}, not your work history. To start us off, in your own words, what is ${topic} and what problem does it solve?`
      : `Welcome! I'm your interviewer today. This will be a relaxed conversation â€” not a test â€” so feel free to speak freely. To kick things off, could you give me a quick overview of your background and what you've been working on recently?`;
}

module.exports = { buildGreetingUserMessage, fallbackGreeting };
