/**
 * Final-report generation prompt: builds the summarization userMsg from the
 * full conversation + coverage, and the deterministic fallback report used
 * if the LLM call fails.
 */

function buildFinalReportUserMessage(session) {
    const { context, conversation, coverage, moduleType } = session;
    const systemPrompt = context.systemPrompt;

    const conversationText = (conversation || [])
      .map(
        (e) =>
          `${e.type === "interviewer" ? "Interviewer" : "Candidate"}: ${e.content}`,
      )
      .join("\n");

    const coverageLines = Object.entries(coverage.areas)
      .map(([k, v]) => `  ${k}: ${Math.round(v.percentage || 0)}% (${v.questionsAsked || 0} questions)`)
      .join("\n");

    const userMsg = `
You are generating a final assessment report based on the completed interview below.
Be objective, evidence-based, and specific â€” reference actual things the candidate said, not generic observations.

â•â•â•â• INTERVIEW TYPE â•â•â•â•
${moduleType}

â•â•â•â• COVERAGE ACHIEVED â•â•â•â•
${coverageLines}
Overall: ${Math.round(coverage.overall || 0)}%

â•â•â•â• FULL CONVERSATION â•â•â•â•
${conversationText.slice(0, 4500)}

â•â•â•â• SCORING GUIDELINES â•â•â•â•
overallScore (0â€“100):
  90â€“100 = Exceptional â€” would hire immediately, clear standout
  75â€“89  = Strong â€” above expectations, recommend hire
  60â€“74  = Solid â€” meets expectations with some gaps
  45â€“59  = Mixed â€” some good areas but significant gaps
  0â€“44   = Below bar â€” does not meet expectations

communicationScore: clarity, structure, and effectiveness of expression
confidenceScore: how decisive and self-assured responses were (not arrogance)
clarityScore: how precise, focused, and well-organized answers were
engagementScore: enthusiasm, curiosity, and active participation

recommendation rules:
  strong_hire â†’ overallScore â‰¥ 85
  hire        â†’ overallScore 70â€“84
  consider    â†’ overallScore 50â€“69
  reject      â†’ overallScore < 50

Respond ONLY with valid JSON â€” no markdown, no extra text:
{
  "overallScore": <0-100>,
  "summary": "<2â€“3 sentences: what stood out most â€” both positive and developmental â€” grounded in specific answers they gave>",
  "strengths": ["<3â€“5 specific, evidence-based strengths observed during the interview>"],
  "areasForImprovement": ["<2â€“4 concrete, actionable areas to develop>"],
  "recommendation": "strong_hire|hire|consider|reject",
  "coverageSummary": { "<area_key>": <0-100> },
  "communicationScore": <0-100>,
  "confidenceScore": <0-100>,
  "clarityScore": <0-100>,
  "engagementScore": <0-100>
}
`;
  return { systemPrompt, userMsg };
}

function buildFinalReportFallback(coverage) {
const base = Math.round(coverage.overall || 50);
    return {
      overallScore: base,
      summary: "Interview completed. Detailed analysis is being processed.",
      strengths: ["Completed the full interview session"],
      areasForImprovement: [],
      recommendation: "consider",
      coverageSummary: Object.fromEntries(
        Object.entries(coverage.areas).map(([k, v]) => [
          k,
          Math.round(v.percentage || 0),
        ]),
      ),
      communicationScore: base,
      confidenceScore: Math.round(base * 0.92),
      clarityScore: Math.round(base * 1.05 > 100 ? 100 : base * 1.05),
      engagementScore: Math.round(base * 0.94),
    };
}

module.exports = { buildFinalReportUserMessage, buildFinalReportFallback };
