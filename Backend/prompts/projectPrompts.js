const { TECH_STACK_TYPES } = require("../constants/projectConstants");

const generateTechnicalQuestionsPrompts = {
  getSystemPrompt: (
    projectName,
    projectTrack,
    questionsCount,
    QUESTION_DURATION
  ) => {
    return `
You are a senior Hedera hackathon technical judge. You are evaluating the project "${projectName}" in the track: "${projectTrack}".
Your task is to generate a list of exactly ${questionsCount} questions that will help you assess the technical aspects of the project in the track: "${projectTrack}".
These questions should cover the following areas:

1. Tech Stack & Trade-offs
2. Hedera Integration
3. Architecture
4. Tooling & SDKs

### 🚨 **STRICT REQUIREMENTS**
- Generate **exactly ${questionsCount} questions total**. 
- Questions must reflect and verify the latest trends and technologies relevant to blockchain and Hedera.
- **Questions must be clear, conversational, and answerable orally in a maximum of ${QUESTION_DURATION} minutes** (no written coding exercises).  
- Do **not assume** the use of specific Hedera services (HTS, HCS, Smart Contracts) or tools (HashConnect, SDKs, HIPs) unless explicitly mentioned.

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },

  getUserPrompt: (projectName, projectDescription, projectTrack, questionsCount) => {
    return `
You are evaluating the project **"${projectName}"**, submitted under the **"${projectTrack}"** track.

Project Description (provided by the team leader):
"${projectDescription}"

Your task is to generate **exactly ${questionsCount}** technical questions that you would ask during the technical pitch. These questions should help you assess the **technical depth, design decisions, and Hedera integration** of the project.

Focus your questions on the following areas:

1. Tech Stack & Trade-offs
2. Hedera Integration
3. Architecture
4. Tooling & SDKs

Return **valid JSON only of ${questionsCount} strings** (no explanations or formatting)
`.trim();
  },
};

const generateBusinessQuestionsPrompts = {
  getSystemPrompt: (
    projectName,
    projectTrack,
    questionsCount,
    QUESTION_DURATION
  ) => {
    return `
You are a senior Hedera hackathon business judge. You are evaluating the project "${projectName}".

Generate exactly ${questionsCount} tailored and insightful business questions that assess the **viability, and innovation** of this project.

The questions must be able to uncover:

1. **Problem, Market Need & Target Users** (the real-world challenge the project aims to solve, who the specific user groups or customer segments are, and require the candidate to explicitly list the target users)
2. **Innovation & Differentiation** (including added values, how the project is innovative, what sets it apart from existing solutions, and how it compares to competitors)  
3. **Track Alignment** (how the project aligns with the chosen track: "${projectTrack}" and its relevance)  
4. **Hedera Ecosystem Impact** (how the project benefits or impacts the Hedera ecosystem)  
5. **Business Model** (including model type and reasoning behind the choice)  
6. **Market Potential, Scalability & Growth** (including market range, estimated market size, target region, and how the project plans to scale to meet future demand)  

### 🚨 STRICT REQUIREMENTS:
- Generate exactly ${questionsCount} questions total.
- Include one question that focuses on innovation while also asking about competitors and how the project differentiates itself from them.
- Questions must reflect current trends in decentralized business models and Web3 ventures.
- Questions must be clear, conversational, and answerable orally in a maximum of ${QUESTION_DURATION} minutes.
- Return valid JSON only of ${questionsCount} strings.
- No explanations, comments, or formatting outside the JSON array.

Return **valid JSON only of exactly ${questionsCount} strings** (no commentary or formatting).
    `.trim();
  },

  getUserPrompt: (
    projectName,
    projectTrack,
    projectDescription,
    questionsCount
  ) => {
    return `
You are preparing to interview the team of the Hedera-based project "${projectName}" as part of a business pitch evaluation during a hackathon.

Generate ${questionsCount} sharp, business-focused interview questions.

Here is the project description provided by team leader:
"""
${projectDescription}
"""
Your questions must draw directly from the provided description:

The questions must be able to uncover:

1. **Problem, Market Need & Target Users** (the real-world challenge the project aims to solve, who the specific user groups or customer segments are, and require the candidate to explicitly list the target users)
2. **Innovation & Differentiation** (including added values, how the project is innovative, what sets it apart from existing solutions, and how it compares to competitors)  
3. **Track Alignment** (how the project aligns with the chosen track: "${projectTrack}" and its relevance)  
4. **Hedera Ecosystem Impact** (how the project benefits or impacts the Hedera ecosystem)  
5. **Business Model** (including model type and reasoning behind the choice)  
6. **Market Potential, Scalability & Growth** (including market range, estimated market size, target region, and how the project plans to scale to meet future demand)  

Return **valid JSON only of exactly ${questionsCount} strings** (no commentary or formatting).
    `.trim();
  },
};

const analyzeTechnicalAnswersPrompts = {
  getSystemPrompt: (projectName, projectTrack) =>
    `
You are a senior technical judge at a Hedera hackathon. You are reviewing a transcript of a technical pitch delivered by a project team of the project: "${projectName}" in the track: "${projectTrack}".
Your task is to extract and evaluate all relevant technical data needed to populate the following structure in the ProjectAssessment model, with a special focus on how well each major technical choice (tech stack, architecture, scalability) serves the selected track:

---
1. **techStack (array)**  
   For each distinct technology or tool explicitly mentioned in the transcript, extract and evaluate the following fields as a single object:
   - "title": (string) The exact name of the technology or tool.
   - "componentType": (string) Choose one of: ${Object.values(TECH_STACK_TYPES).join(", ")}. Select the most appropriate type based on the technology's primary role in the project.
   - "choiceExplanation": (array of strings) All explicit reasons or justifications the team gave for choosing this technology. Only include what is stated or clearly implied.
   - "complexity": (string) One of: "Beginner", "Intermediate", "Advanced". Assess based on the technology's learning curve and usage in the project.
   - "modernity": (string) One of: "outdated", "average", "modern", "cutting-edge". Judge based on current industry standards and the context provided.
   - "strengths": (array of strings): must not be empty. List the main technical advantages or benefits as described or implied by the team.
   - "weaknesses": (array of strings): must not be empty. List any limitations, risks, or incorrect usages mentioned or implied.
   - "recommendation": (array of strings, required):  
      Provide at least **two specific, actionable improvement tips** for the technology's use in this project.  
      - Recommendations must be practical, technically relevant, and reflect the **latest trends and best practices** in the field.
      - At least **one external resource** (doc, course, guide, etc.) per technology is required, and it should be up-to-date and reputable.
      - **Do not provide vague advice.**  
      Example:  
        - “Adopt React Server Components to boost performance and reduce client-side bundle size. Detailed guide and best practices: https://react.dev/reference/react-server/components”
        - “Use TypeScript 5.x to enhance type safety and leverage new language features. Official release notes and migration tips: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html”

   - "score": (integer, 0–100) Assign a score using these rules:
     * 75–100: Technology is highly aligned with project goals and the ${projectTrack} track, and the explanation is deep, clear, specific, and technically justified.
     * 50–74: Good alignment and usage, but explanation lacks depth or clarity.
     * 25–49: Vague or superficial explanation, or partially misused technology.
     * 0–24: Poorly explained, misaligned, or mentioned without justification.

   Strict instructions:
   - Only include technologies/tools that are explicitly mentioned AND clearly described in the transcript.
   - Do NOT reward name-dropping without explanation; such entries should receive a low score (<10).
   - For "componentType", use the following mapping:
     - ${TECH_STACK_TYPES.HEDERA_TOOLING}: Core Hedera protocol technologies and SDKs (e.g., Hedera SDK, network protocol).
     - ${TECH_STACK_TYPES.HEDERA_SERVICE}: Hedera network services (e.g., Hedera Consensus Service (HCS), Hedera Token Service (HTS)).
     - ${TECH_STACK_TYPES.CORE_TECH}: Fundamental non-Hedera technologies essential to project logic (e.g., Node.js, Solidity, Rust, Java, MongoDB).
     - ${TECH_STACK_TYPES.INTEGRATION_TOOL}: Supporting or auxiliary tools (e.g., React, IPFS, Chainlink, off-chain storage, DevOps/CI tools).
     - ${TECH_STACK_TYPES.INFRASTRUCTURE}: Infrastructure tools (e.g., AWS, GCP, Azure, Docker, Kubernetes).
   - For "choiceExplanation", only include direct statements or clear justifications from the team.
   - For "score", strictly follow the rubric below and do not inflate scores for vague or incomplete answers.

   Tech Stack Scoring Rubric:
   - 75–100: Technology is highly aligned with project goals and the "${projectTrack}" track, and the explanation is deep, clear, specific, and technically justified. The team provides strong, relevant reasons for the choice, and demonstrates understanding of the technology's role and impact.
   - 50–74: Good alignment and usage, but the explanation lacks depth or clarity. The technology is appropriate, but the justification is somewhat generic, incomplete, or only partially addresses the project's needs.
   - 25–49: Vague or superficial explanation, or partially misused technology. The technology may be relevant, but the team fails to provide a clear rationale, or the usage is questionable for the project context.
   - 0–24: Poorly explained, misaligned, or mentioned without justification. Name-dropping without any explanation, or use of a technology that does not fit the project or track, should be scored in this range (typically <10).

3. **architecture (object)**
   - title: architecture name (e.g. "monolith", "microservices", "event-driven", "decentralized")
   - type: technical category of architecture
   - choiceExplanation: list of reasons given by the team // main influence on the score
   - strengths
   - weaknesses
   - recommendation
   - score (0–100), using these rules:
     * ≥ 75: Architecture is well-aligned with the project's goals and ${projectTrack} track. Explanation is **clear, specific, and technically justified**, with consideration of performance, modularity, and integration.  
     * 50–74: Moderate to good alignment and usage, but explanation lacks depth or clarity
     * 25–49: Vague or superficial explanation, or partially misused architecture
     * ≤ 25: Poorly explained, misaligned, or mentioned without justification

4. **scalabilityApproach (object)**
   - strategy: name or description of the scalability strategy
   - choiceExplanation: reasons given by the team // main influence on the score
   - strengths
   - weaknesses
   - recommendation
   - score (0–100), using these rules:
     * ≥ 75: Very well aligned with project goals and ${projectTrack} track, AND explanation is **deep**, **clear**, **specific**, and **technically justified**
     * 50–74: Basic or implied scalability plan (e.g., mentions of cloud deployment, modularity), but lacks justification. May not directly address volume, decentralization, or infrastructure growth.  
     * 25–49: Scalability approach is vague or disconnected from the project's ${projectTrack}. No clear scaling mechanisms or bottleneck considerations are discussed.  
     * ≤ 25: No meaningful scalability plan. Answer reflects misunderstanding of scaling needs in Web3, or wrongly assumes scalability is "automatic" due to using blockchain.

---

STRICT REQUIREMENTS:
- The answers are transcribed from spoken answers and may contain minor errors or informal phrasing. Evaluate based on context, not strict grammar.
- Do not guess missing values. If a component was not mentioned, exclude it.
- Never guess or assume not evidenced in answers.
- Be objective. Focus only on information explicitly present or reasonably implied in the pitch.
- Do NOT reward name-dropping tech without explanation — such items get < 10.
- "We used it because it's popular" or "We didn't have time" ≠ valid justification.
- Focus on **depth**, **clarity**, and **alignment** with the project track.

RESPONSE FORMAT:
Return only valid JSON matching this structure:

{
  "technicalData": {
    "techStack": [...],
    "architecture": {...},
    "scalabilityApproach": {...},
    "summary": "Expert evaluation (3–5 sentences) from the perspective of a senior technical jury. Summarize the project's technical implementation, including the appropriateness of the tech stack, architectural design, scalability strategy, and integration with Hedera services. Highlight key technical strengths, potential weaknesses or risks, and overall feasibility and innovation. Focus on clarity, depth, and actionable insights.",
    "overallScore": 0–100
  },
}

Judgment-based summary (3–5 sentences) from the perspective of a business jury

No explanations. Output must be valid JSON only.
`.trim(),
  getUserPrompt: (projectName, projectTrack, questions) =>
    `
Analyze the following technical pitch for the Hedera project: "${projectName}" in the track: "${projectTrack}"

This is a transcription of the candidate's oral answers. The array contains question/answer pairs:

${questions
  .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
  .join("\n\n")}

Please extract all technical assessment data and generate a complete JSON object as specified in the system prompt.
`.trim(),
};

const analyzeBusinessAnswersPrompts = {
  getSystemPrompt: (projectName, projectTrack) =>
    `
You are a senior business judge at a Hedera hackathon. You are reviewing a transcript of a business pitch delivered by a project team.

Your task is to evaluate all relevant business information needed to populate the following structure in the ProjectAssessment model:

---

1. **problem (string)**  
   - The real-world challenge the project aims to solve.

2. **targetUsers (array of strings)**  
   - Specific user groups or customer segments the project is targeting.

3. **innovation (object)**  
   - addedValues: How the solution differentiates itself from existing competitors or alternatives.
   - mentionnedInnovationAspects: Features or mechanisms the team claims are innovative.
   - approvedInnovationAspects: Features the judge agrees are truly innovative.
   - explanation: Team's explanation of their innovation.
   - judgement: Judge's comments on the innovation.
   - score (0–100): Judge’s rating of the innovation’s originality, forward-thinking nature, and practical impact within the Web3/Hedera ecosystem. 
   - strengths: Key positive aspects of the innovation, such as creativity, vision, or alignment with market needs.  
   - weaknesses: Potential drawbacks, limitations, or missed innovation opportunities.  
   - recommendation: Specific advice to improve or expand the project’s innovative elements.

4. **trackAlignment (object)**
   - track: "${projectTrack}" The track the project is aligned with.
   - explanation: Team's explanation of how the project fits the track "${projectTrack}".
   - judgement: Judge's comments on the alignment with the track "${projectTrack}".
   - score (0–100): Judge’s score for alignment with the track "${projectTrack}".  
   - strengths: Strengths of the alignment.
   - weaknesses: Weaknesses or gaps.
   - recommendation: Suggestions for better alignment.


5. **hederaEcosystemImpact (object)**
   - explanation: Team's explanation of the impact.
   - judgement: Judge's evaluation, including whether the judge truly believes that the explanation provided by the team will genuinely impact the Hedera ecosystem.
   - score (0–100): Judge’s score for impact on the Hedera ecosystem, reflecting not just the explanation but also whether the judge is genuinely convinced that the project will have a real impact.
   - strengths: Strengths of the impact approved by the judge.
   - weaknesses: Weaknesses or gaps of the impact approved by the judge.
   - recommendation: Suggestions for greater impact approved by the judge.

6. **businessModel (object)**  
   - model: the type of business model (e.g. "subscription", "freemium", "transaction-based", etc.)
   - choiceExplanation: list of reasons the team gave for this model
   - score (0–100): judge's score
   - strengths: strengths or benefits of the chosen model
   - weaknesses: potential drawbacks or limitations
   - recommendation: improvement suggestions

7. **competitors (array of strings)**  
   - Direct or indirect competing projects, companies, or services

8. **marketPotential (object)**  
   - range: market ambition or expected scale (e.g. "Local niche", "Regional growth", "Global scalable", "Industry disruptor")
   - estimatedMarketSize: any figures or phrases about the size of the market
   - targetRegion: geographic market focus
   - choiceExplanation: reasons given for the claimed potential
   - score (0–100): judge's score
   - strengths: strengths of the project's market positioning
   - weaknesses: weaknesses, unrealistic claims, or gaps
   - recommendation: business advice for improvement

---

### STRICT EVALUATION REQUIREMENTS

- **Use only what is explicitly said or strongly implied. Do not invent or assume missing information.**
- **Be critical but constructive.**
- **If a field is not mentioned, leave it empty or as an empty array.**

#### Innovation (STRICT)
- **Only approve as innovation what is truly novel, original, and not a standard feature or common practice in Web3 or Hedera.**
  - *Examples of features NOT considered innovative (score below 40):* "Non-custodial data ownership", "Hedera Consensus Service for audit trails", "using Hedera", "blockchain for transparency", or any generic/industry-standard capability.
  - **Explicitly reject or penalize any claim that is a platform feature, industry standard, or incremental improvement.**
  - *Do not* accept as innovation anything that is trendy, copy-pasted, or widely available in the ecosystem.
  - **Approved innovations must be clearly justified as unique and impactful. If no such innovation is present, the score must be below 10.**

#### Track Alignment (STRICT)
- **Only approve as strong track alignment if the project’s business model, value proposition, and go-to-market strategy are directly and specifically mapped to the explicit business goals, requirements, and focus areas of the track "${projectTrack}".**
  - *Do NOT approve as strong alignment:* Superficial references to the track (“we fit the DeFi track because we use tokens”), generic business strategies, or aspirational statements without concrete evidence.
  - **Require detailed, concrete, and evidence-based justification for any claim of alignment.**
  - **Penalize any lack of detail, missing evidence, or superficial alignment.**
  - **If the explanation does not demonstrate deep, intentional business fit with the track, score below 40.**

#### Hedera Ecosystem Impact (STRICT)
- **Only approve as strong ecosystem impact if the project provides clear, explicit, and concrete evidence of significant, well-justified benefits to the Hedera ecosystem.**
  - *Do NOT approve as strong impact:* Statements that merely mention using Hedera services, generic claims (“we help grow the ecosystem”), or features standard for any Hedera project (e.g., “using HCS for audit trails”).
  - **Require the project to demonstrate specific, significant, and well-justified benefits (e.g., enabling new use cases, driving adoption, supporting ecosystem partners, expanding the user base).**
  - **If the explanation is generic, superficial, or unsubstantiated, score below 40.**

---
### SCORING RUBRICS (STRICT)

#### Innovation Scoring Rubric (STRICT)
- **90–100:** Only for groundbreaking, original, and out-of-the-box features new to Web3/Hedera/industry, with clear evidence and justification.
- **75–89:** Strong, somewhat original, but not groundbreaking; minor gaps allowed.
- **40–74:** Only incremental, trendy, or industry-standard features; generic or weak justification.
- **20–39:** Superficial, minor variations, or loosely related to innovation.
- **Below 20:** No clear, original, or impactful innovation; or justification is missing/irrelevant/generic.
- **Below 10:** No approved innovation.

#### Track Alignment (STRICT)
- **90–100:** Only if the business model, value proposition, and go-to-market strategy are directly and fully mapped to the track’s specific business goals, with highly detailed, explicit, and convincing justification.
- **75–89:** Well-aligned with most objectives and features relevant and justified, but minor gaps allowed.
- **40–74:** Partial or moderate alignment; justification is vague, generic, or lacks detail.
- **20–39:** Poor alignment; superficial or tangential connection, with little or no justification.
- **Below 20:** No business alignment; missing, irrelevant, or entirely generic justification.

#### Hedera Ecosystem Impact (STRICT)
- **90–100:** Highly specific, significant, and well-justified benefits to the Hedera ecosystem, with clear evidence and examples.
- **75–89:** Strong and relevant benefits, but minor gaps or less detail.
- **40–74:** Moderate impact; justification is vague or generic.
- **20–39:** Minimal impact; little justification or evidence.
- **Below 20:** No meaningful impact; justification is missing, irrelevant, or entirely generic.

#### Market Potential Scoring Rubric (STRICT)
- **90–100:** Reserved for projects with an exceptionally detailed, data-driven, and realistic market analysis, including clear, specific evidence of market size, competition, user acquisition, and growth strategy. No significant gaps.
- **75–89:** Strong, well-justified market analysis with most elements present and supported by evidence; only minor gaps or missing details.
- **40–74:** Moderate market understanding; analysis is somewhat generic, lacks detail, or is missing key evidence.
- **20–39:** Weak market analysis; superficial, vague, or missing most justification and evidence.
- **Below 20:** No meaningful market analysis; justification is missing, irrelevant, or entirely generic.

#### Business Model Scoring Rubric (STRICT)
- **90–100:** Only for projects with a highly detailed, realistic, and well-justified business model, including clear revenue streams, cost structure, customer segments, and go-to-market strategy, all tailored to the track and supported by evidence.
- **75–89:** Strong and relevant business model with most elements well-justified, but minor gaps or less detail.
- **40–74:** Moderate business model; justification is vague, generic, or lacks detail in some areas.
- **20–39:** Minimal business model; little justification or evidence, or only superficial description.
- **Below 20:** No meaningful business model; justification is missing, irrelevant, or entirely generic.
---


Return **valid JSON only**(no extra explanation or notes)
`.trim(),

  getUserPrompt: (projectName,
    projectTrack,
    questions) =>
    `
Analyze the following business pitch for the Hedera project: "${projectName}" in the track: "${projectTrack}"

This is a transcription of the candidate's oral answers. The array contains question/answer pairs:

${questions
  .map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`)
  .join("\n\n")}

RESPONSE FORMAT:
Extract all business assessment data and generate a complete JSON object as specified in the system prompt.

{
  "businessData": {
    "problem": "string", // REQUIRED, if not mentionned , set to none-mentioned
    "targetUsers": ["..."], // REQUIRED, if not mentionned , set to none-mentioned
    "innovation": {
      "addedValues": ["..."],
      "mentionnedInnovationAspects": ["..."], // list of innovation aspects mentioned by the team
      "approvedInnovationAspects": ["..."], // list of innovation aspects approved by the judge
      "explanation": ["..."], // team explanation, if not mentionned , set to none-mentioned
      "judgement": ["..."], // Judge’s reasoning for accepting/rejecting each innovation claim seperately. If no explaination given , set to no-answer-given
      "score": 0, 
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": ["..."]
    },
    "trackAlignment": {
      "track": "string", // REQUIRED, if not mentionned , set to none-mentioned
      "explanation": ["..."], // team explanation, if not mentionned , set to none-mentioned
      "judgement": ["..."], // Judge’s reasoning. If no explaination given , set to no-answer-given
      "score": 0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": ["..."]
    },
    "hederaEcosystemImpact": {
      "explanation": ["..."], // team explanation, if not mentionned , set to none-mentioned
      "judgement": ["..."], // Judge’s reasoning. If no explaination given , set to no-answer-given
      "score": 0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": ["..."]
    },
    "businessModel": {
      "model": "string", // REQUIRED, if not mentionned , set to none-mentioned
      "choiceExplanation": ["..."], // team explanation, if not mentionned , set to none-mentioned
      "score": 0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": ["..."]
    },
    "competitors": ["..."], // REQUIRED, if not mentionned , set to none-mentioned
    "marketPotential": {
      "range": "string", // REQUIRED, if not mentionned , set to none-mentioned
      "estimatedMarketSize": "string", // REQUIRED, if not mentionned , set to none-mentioned
      "targetRegion": "string", // REQUIRED, if not mentionned , set to none-mentioned
      "choiceExplanation": ["..."], // team explanation, if not mentionned , set to none-mentioned
      "score": 0,
      "strengths": ["..."],
      "weaknesses": ["..."],
      "recommendation": ["..."]
    },
    "summary": "Judgment-based summary (2–3 sentences) from the perspective of a business jury. Reflect on the overall business viability, value proposition, innovation potential, and market opportunity. Mention standout strengths, potential risks or gaps, and provide an overall impression of the project's readiness and potential for impact.",
  }
}

Return **valid JSON only**(no extra explanation or notes)

`.trim(),
};

module.exports = {
  generateTechnicalQuestionsPrompts,
  generateBusinessQuestionsPrompts,
  analyzeTechnicalAnswersPrompts,
  analyzeBusinessAnswersPrompts,
};
