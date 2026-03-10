const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const fs = require("fs");

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "us-east-1"
});

async function analyzeCV(pdfPath) {
  try {

    // lire le PDF
    const pdfBase64 = fs.readFileSync(pdfPath).toString("base64");

    const body = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64
              }
            },
            {
              type: "text",
              text: `
Analyze this CV and extract the candidate information.

Return ONLY valid JSON in this format:

{
  "name":"",
  "email":"",
  "phone":"",
  "skills":[],
  "experience":[
    {
      "company":"",
      "role":"",
      "duration":""
    }
  ],
  "education":[]
}
`
            }
          ]
        }
      ]
    };

    const command = new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body)
    });

    const response = await client.send(command);

    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    return responseBody.content[0].text;

  } catch (error) {
    console.error("Bedrock error:", error);
    throw error;
  }
}

module.exports = {
  analyzeCV
};