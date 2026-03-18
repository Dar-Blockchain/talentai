const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractJson(text) {
  if (!text || typeof text !== "string") {
    return "{}";
  }

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

async function uploadPdfToOpenAI(pdfPath) {
  const uploadedFile = await openai.files.create({
    file: fs.createReadStream(pdfPath),
    purpose: "user_data",
  });

  return uploadedFile.id;
}

async function analyzeCV(pdfPath, maxRetries = 3) {
  let fileId = null;

  try {
    if (!pdfPath) {
      throw new Error("pdfPath is required");
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`File not found: ${pdfPath}`);
    }

    const ext = path.extname(pdfPath).toLowerCase();
    if (ext !== ".pdf") {
      throw new Error("Only PDF files are supported");
    }

    fileId = await uploadPdfToOpenAI(pdfPath);

    const prompt = `
You are an expert CV/resume parser with deep knowledge of recruitment, ATS systems, and HR.

Read the attached CV carefully and extract all relevant information.

Rules:
- Return ONLY one valid raw JSON object
- No markdown
- No explanation
- No extra text
- If a value is missing, use:
  - "" for strings
  - [] for arrays
  - 0 for numbers
- Keep the output strictly valid JSON

Return this exact structure:
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
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "duration": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "year": ""
    }
  ],
  "certifications": [],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": []
    }
  ],
  "links": {
    "linkedin": "",
    "github": "",
    "portfolio": ""
  }
}
`;

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await openai.responses.create({
          model: "gpt-4o",
          input: [
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: prompt,
                },
                {
                  type: "input_file",
                  file_id: fileId,
                },
              ],
            },
          ],
        });

        const rawText = response.output_text || "{}";
        const jsonText = extractJson(rawText);

        JSON.parse(jsonText);

        return jsonText;
      } catch (error) {
        lastError = error;

        const status = error?.status || 0;
        const type = error?.type || "";
        const code = error?.code || "";

        const retryable =
          status >= 500 ||
          type === "server_error" ||
          code === "server_error" ||
          code === "rate_limit_exceeded";

        if (!retryable || attempt === maxRetries) {
          throw error;
        }

        await sleep(attempt * 1500);
      }
    }

    throw lastError || new Error("Unknown error while analyzing CV");
  } finally {
    if (fileId) {
      await openai.files.del(fileId).catch(() => {});
    }
  }
}

module.exports = { analyzeCV };