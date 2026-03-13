const OpenAI = require("openai");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function analyzeCV(pdfPath) {
  let fileId = null;
  let threadId = null;
  let assistantId = null;

  try {
    // 1. Upload PDF to OpenAI
    fileId = await openai.files.create({
      file: fs.createReadStream(pdfPath),
      purpose: "assistants"
    }).then(f => f.id);

    // 2. Create a smart CV parser assistant
    assistantId = await openai.beta.assistants.create({
      name: "CV Parser",
      model: "gpt-4o",
      tools: [{ type: "file_search" }],
      instructions: `You are an expert CV/resume parser with deep knowledge of recruitment, ATS systems, and HR.
Your job is to read any type of CV (ATS-formatted, designer, simple, complex) and extract ALL information accurately.
Always return ONLY a raw JSON object — no markdown, no explanation.`
    }).then(a => a.id);

    // 3. Create thread with the uploaded file
    threadId = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `Parse this CV completely and return ONLY a JSON object with this structure:
{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "title": "",
  "summary": "",
  "yearsOfExperience": 0,
  "seniority": "",
  "skills": [],
  "softSkills": [
    { "name": "", "category": "", "proficiencyLevel": 0 }
  ],
  "spokenLanguages": [
    { "language": "", "proficiency": "" }
  ],
  "experience": [
    { "company": "", "role": "", "startDate": "", "endDate": "", "duration": "", "description": "" }
  ],
  "education": [
    { "institution": "", "degree": "", "field": "", "year": "" }
  ],
  "certifications": [],
  "projects": [
    { "name": "", "description": "", "technologies": [] }
  ],
  "links": { "linkedin": "", "github": "", "portfolio": "" }
}`,
          attachments: [{ file_id: fileId, tools: [{ type: "file_search" }] }]
        }
      ]
    }).then(t => t.id);

    // 4. Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId
    });

    if (run.status !== "completed") {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }

    // 5. Get the response
    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(m => m.role === "assistant");
    const rawContent = lastMessage?.content?.[0]?.text?.value || "{}";

    // Strip markdown fences if present
    const cleaned = rawContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "")
      .trim();

    return cleaned;

  } finally {
    // Cleanup
    if (threadId) await openai.beta.threads.del(threadId).catch(() => {});
    if (assistantId) await openai.beta.assistants.del(assistantId).catch(() => {});
    if (fileId) await openai.files.del(fileId).catch(() => {});
  }
}

module.exports = { analyzeCV };
