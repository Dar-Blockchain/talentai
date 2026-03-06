/**
 * Bedrock Authentication Test Script (Raw HTTP - no SDK needed)
 * Run: node Backend/test-bedrock.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const REGION = process.env.AWS_BEDROCK_REGION || "us-east-1";
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";
const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK;

console.log("=== Bedrock Authentication Test (Raw HTTP) ===\n");
console.log("Region:", REGION);
console.log("Model:", MODEL_ID);
console.log(
  "Bearer token:",
  BEARER_TOKEN
    ? `YES (${BEARER_TOKEN.substring(0, 30)}...)`
    : "NOT SET - check Backend/.env"
);
console.log("");

if (!BEARER_TOKEN) {
  console.error("ERROR: AWS_BEARER_TOKEN_BEDROCK is not set in Backend/.env");
  process.exit(1);
}

const payload = {
  anthropic_version: "bedrock-2023-05-31",
  max_tokens: 50,
  temperature: 0.1,
  system: "You are a test assistant. Reply in one short sentence.",
  messages: [
    {
      role: "user",
      content: [{ type: "text", text: "Say hello in one sentence." }],
    },
  ],
};

const REGIONS_TO_TRY = ["us-east-1", "us-west-2", "eu-west-1", "ap-northeast-1", "eu-central-1", "ap-southeast-1"];

async function testRegion(region) {
  const url = `https://bedrock-runtime.${region}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/invoke`;
  console.log(`\n--- Testing region: ${region} ---`);
  console.log("URL:", url);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error(`FAILED: HTTP ${response.status} — ${responseText.substring(0, 200)}`);
      return false;
    }

    const body = JSON.parse(responseText);
    const content = body.content?.[0]?.text || "";

    console.log("SUCCESS!");
    console.log("Response:", content);
    console.log("Usage:", JSON.stringify(body.usage));
    return true;
  } catch (error) {
    console.error("FAILED:", error.message);
    return false;
  }
}

async function main() {
  console.log("Testing all regions to find one that works...\n");
  for (const region of REGIONS_TO_TRY) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\n=== WORKING REGION FOUND: ${region} ===`);
      console.log(`Set this in Backend/.env:`);
      console.log(`AWS_BEDROCK_REGION=${region}`);
      return;
    }
  }
  console.log("\nNo working region found. The geo-restriction applies to all regions.");
}

main();
