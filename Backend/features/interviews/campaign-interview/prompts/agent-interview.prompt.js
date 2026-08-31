/**
 * AI_INTERVIEW context: interprets the company's free-form agentPrompt brief
 * into a structured topic/focus-areas/tone plan (interpretAgentPrompt), then
 * builds the full system prompt around it (buildAgentContext).
 */

const bedrock = require("../../../../utils/bedrock-client");
const { parseJSON } = require("../campaign-interview.helpers");

// Reads the company's free-form agentPrompt (a phrase, a list, or full instructions)
// and interprets its INTENT into a short topic label, weighted focus areas, and tone —
// instead of ever splicing the raw text verbatim into the system prompt.
async function interpretAgentPrompt(rawInput, campaignTitle) {
    if (!rawInput) return null;

    const systemPrompt = `You are an expert interview designer. You read a free-form brief written by a company describing what an AI-led interview should cover, and convert it into a structured, actionable interview plan. You never copy the brief verbatim into your output â€” you interpret its intent and re-express it in your own words.`;

    const userMsg = `Read the brief below and produce a structured interview plan.

BRIEF (written by the company â€” may be a single phrase, a list of topics, or full persona/instructions):
"""
${rawInput}
"""
${campaignTitle ? `Campaign title (context): "${campaignTitle}"` : ""}

Produce:
- "topic": a short 2-6 word label for what this interview is about
- "focusAreas": 3-5 subtopics/competencies to probe, each an object with:
    "key"    â€” snake_case identifier, no spaces (e.g. "react_expertise")
    "label"  â€” short human-readable label (e.g. "React Expertise")
    "weight" â€” integer importance weight; all weights together should sum to ~100
- "tone": a short phrase describing the interview's tone/style, inferred from the brief (default to "professional and encouraging" if the brief doesn't imply otherwise)
- "openingContext": one natural sentence (no surrounding quotes, no "the interview will focus on" boilerplate) summarizing what this conversation will explore, written so it can be dropped directly into a greeting

Return ONLY valid JSON, no markdown, no extra text:
{
  "topic": "<label>",
  "focusAreas": [{ "key": "<key>", "label": "<label>", "weight": <int> }],
  "tone": "<tone>",
  "openingContext": "<sentence>"
}`;

    try {
      const res = await bedrock.callLLM({
        systemPrompt,
        messages: [{ role: "user", content: userMsg }],
        temperature: 0.4,
        maxTokens: 500,
        timeout: 20000,
        useFastModel: true,
      });
      const parsed = parseJSON(res.content, null);
      if (!parsed || !Array.isArray(parsed.focusAreas) || parsed.focusAreas.length === 0) return null;
      return parsed;
    } catch (e) {
      console.warn("âš ï¸ [CampaignInterview] Prompt interpretation failed:", e.message);
      return null;
    }
}

function buildCoverageAreasFromFocus(focusAreas) {
    if (!Array.isArray(focusAreas) || focusAreas.length === 0) return null;
    const areas = {};
    for (const a of focusAreas) {
      if (!a?.key || !a?.label) continue;
      areas[a.key] = {
        label: a.label,
        percentage: 0,
        questionsAsked: 0,
        weight: typeof a.weight === "number" && a.weight > 0 ? a.weight : 25,
      };
    }
    return Object.keys(areas).length > 0 ? areas : null;
}

async function buildAgentContext(agentPrompt, campaign) {
    const rawInput    = agentPrompt?.trim() || "";
    const interpreted  = await interpretAgentPrompt(rawInput, campaign.title);

    const topic          = interpreted?.topic || rawInput || campaign.title || "general assessment";
    const tone            = interpreted?.tone || "professional and encouraging";
    const openingContext  = interpreted?.openingContext || null;
    const focusAreas      = Array.isArray(interpreted?.focusAreas) && interpreted.focusAreas.length > 0
      ? interpreted.focusAreas
      : null;
    const focusList = focusAreas
      ? focusAreas.map((a) => `  â€¢ ${a.label}`).join("\n")
      : null;

    const focusRotationNote = focusAreas
      ? `Rotate across ALL of the focus areas above -- do not spend more than 2 consecutive questions on the same area. Areas with a higher weight deserve more questions, but every area must get at least one.`
      : `No predefined focus areas were given for "${topic}" -- before your first question, silently break "${topic}" down into 3-4 natural sub-competencies (the way an expert in this field would), and rotate your questions across those sub-competencies instead of asking generic variations of the same thing.`;

    const conductRules = `
INTERVIEW CONDUCT RULES
- Ask one question at a time -- no compound questions.
- Vary question types every turn: definitional/conceptual, applied/practical, behavioral, situational, trade-off, best-practice.
- Acknowledge the candidate's previous answer with one brief phrase before each new question.
- Adapt difficulty based on answer quality: excellent answer -> go deeper or raise difficulty; vague/shallow answer -> ask a follow-up on that SAME point before moving to a new sub-topic.
- Never repeat the same angle, example, or scenario twice, and never ask two questions about the same narrow sub-topic in a row.
- Every question must be directly relevant to the interview topic: "${topic}" -- never generic filler that could apply to any interview.
${focusRotationNote}`;

    const systemPrompt = `You are an experienced interviewer conducting a structured assessment on the topic: "${topic}".
Campaign: "${campaign.title}"
Interview tone: ${tone}.

QUESTION BANK MINDSET
Where "${topic}" has a real body of professional knowledge behind it, draw from the same kind of real, well-known interview questions that show up in actual interviews and interview-prep guides for that subject -- never vague, generic, or invented-on-the-spot questions. Silently organize "${topic}" into the categories a real subject-matter expert would use to structure an assessment of it (for a technical subject that's roughly: fundamentals, everyday practical usage, tools/patterns, advanced/edge-case understanding; for a role, competency, or soft-skill topic that's roughly: core responsibilities or behaviors, decision-making, collaboration, growth areas -- work out what's actually relevant for "${topic}" specifically). Each question should be one a domain expert in "${topic}" would instantly recognize as a genuine, specific interview question, in the spirit of:
  - "What's the difference between X and Y (within ${topic})?"
  - "What does Z do, or how does it actually work?"
  - "How would you handle/build/resolve <a specific, concrete situation involving ${topic}>?"
  - "Tell me about a time you faced <a specific challenge related to ${topic}> -- what did you do?"

AVOID: "tell me about your experience with ${topic}" beyond a single warm-up use, abstract questions with no concrete right answer, and any generic HR filler unrelated to this topic.

INTERVIEW FOCUS
Every single question you ask must be directly and specifically about "${topic}"${focusList ? `, covering these areas (with their relative importance):\n${focusList}` : ""}.

ROLE
Act as a knowledgeable, professional, and empathetic interviewer. Your tone is ${tone}.
You combine behavioral, situational, technical, and problem-solving questions to build a complete picture of the candidate's capabilities in "${topic}".

INTERVIEW PROGRESSION
Phase 1 - Warm-up: One canonical, foundational question about "${topic}" plus a quick read on the candidate's overall experience with it -- how long, in what context.
Phase 2 - Exploration: Real, specific questions about the tools/knowledge/practices a working professional in "${topic}" uses day to day, moving through its different sub-competencies -- don't linger on one for more than 2 questions in a row.
Phase 3 - Deep-dive: Push to the advanced end of whichever sub-competency the candidate showed the most (or least) strength in -- trade-offs, edge cases, design decisions related to "${topic}".
Phase 4 - Closing: Ask about best practices, lessons learned, or an achievement they're proud of involving "${topic}".

QUESTION TYPE ROTATION (always vary, never repeat the same one twice in a row):
  - Definition/comparison -> "What's the difference between X and Y?"
  - Mechanism/conceptual  -> "How does X actually work, or what does it do?"
  - Applied/practical     -> "Tell me about a project where you used ${topic}. What did you build?"
  - Behavioral            -> "Tell me about a challenge you faced with ${topic} and how you solved it."
  - Situational           -> "If you had to use ${topic} to solve [a specific problem], how would you approach it?"
  - Best-practice         -> "What are the most common mistakes people make with ${topic}?"

${conductRules}`;
    return {
      type:          "AI_INTERVIEW",
      topic,
      tone,
      openingContext,
      focusAreas,
      systemPrompt,
      campaignTitle: campaign.title,
    };
}

module.exports = { interpretAgentPrompt, buildCoverageAreasFromFocus, buildAgentContext };
