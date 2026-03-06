/**
 * Bedrock Test Script — Bearer Token Authentication
 * Tests both InvokeModel and Converse APIs
 * 
 * Run on your AWS server (Oregon): node test-bedrock.js
 * 
 * Required in .env:
 *   AWS_BEARER_TOKEN_BEDROCK=your-token
 *   AWS_BEDROCK_REGION=us-west-2
 *   BEDROCK_MODEL_ID=us.anthropic.claude-sonnet-4-20250514-v1:0
 */


const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
//
const REGION = process.env.AWS_BEDROCK_REGION || "us-west-2";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";
const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK;

console.log("╔══════════════════════════════════════════════╗");
console.log("║   Bedrock Bearer Token Test Script           ║");
console.log("╚══════════════════════════════════════════════╝\n");
console.log("Region:      ", REGION);
console.log("Model:       ", MODEL_ID);
console.log("Bearer Token:", BEARER_TOKEN ? `YES (${BEARER_TOKEN.substring(0, 20)}...)` : "❌ NOT SET");
console.log("");

if (!BEARER_TOKEN) {
  console.error("❌ ERROR: AWS_BEARER_TOKEN_BEDROCK is not set in .env");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": `Bearer ${BEARER_TOKEN}`,
};

// ============================================================
// TEST 1: Converse API (recommended by AWS)
// ============================================================
async function testConverse() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/converse`;

  const payload = {
    messages: [
      {
        role: "user",
        content: [{ text: "Say hello and confirm you are Claude. One sentence only." }],
      },
    ],
    inferenceConfig: {
      maxTokens: 100,
      temperature: 0.1,
    },
  };

  console.log("─── Test 1: Converse API ───");
  console.log("URL:", url);
  console.log("");

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const latency = Date.now() - start;

    if (!response.ok) {
      console.error(`❌ FAILED: HTTP ${response.status}`);
      console.error("Response:", responseText.substring(0, 300));
      return false;
    }

    const body = JSON.parse(responseText);
    const content = body.output?.message?.content?.[0]?.text || "No content";

    console.log(`✅ SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Usage:", JSON.stringify(body.usage));
    console.log("Stop:", body.stopReason);
    return true;
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 2: InvokeModel API (native Anthropic format)
// ============================================================
async function testInvokeModel() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/invoke`;

  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 100,
    temperature: 0.1,
    system: "You are a test assistant. Reply in one short sentence.",
    messages: [
      {
        role: "user",
        content: [{ type: "text", text: "Confirm you are Claude on AWS Bedrock." }],
      },
    ],
  };

  console.log("\n─── Test 2: InvokeModel API ───");
  console.log("URL:", url);
  console.log("");

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    const latency = Date.now() - start;

    if (!response.ok) {
      console.error(`❌ FAILED: HTTP ${response.status}`);
      console.error("Response:", responseText.substring(0, 300));
      return false;
    }

    const body = JSON.parse(responseText);
    const content = body.content?.[0]?.text || "No content";

    console.log(`✅ SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Model:", body.model);
    console.log("Usage:", JSON.stringify(body.usage));
    console.log("Stop:", body.stop_reason);
    return true;
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 3: Converse Stream API (for real-time interview delivery)
// ============================================================
async function testConverseStream() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/converse-stream`;

  const payload = {
    messages: [
      {
        role: "user",
        content: [{ text: "Count from 1 to 5, one number per line." }],
      },
    ],
    inferenceConfig: {
      maxTokens: 100,
      temperature: 0.1,
    },
  };

  console.log("\n─── Test 3: Converse Stream API ───");
  console.log("URL:", url);
  console.log("");

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...headers,
        "Accept": "application/vnd.amazon.eventstream",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ FAILED: HTTP ${response.status}`);
      console.error("Response:", errorText.substring(0, 300));
      return false;
    }

    const latency = Date.now() - start;
    console.log(`✅ Stream connection established! (${latency}ms to first byte)`);
    console.log("Note: Full streaming parsing requires AWS SDK event stream decoder.");
    console.log("For production, use @aws-sdk/client-bedrock-runtime ConverseStreamCommand.");
    return true;
  } catch (error) {
    console.error("❌ FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 4: SDK-based test (if @aws-sdk/client-bedrock-runtime is installed)
// ============================================================
async function testSDK() {
  console.log("\n─── Test 4: AWS SDK (ConverseCommand) ───");

  try {
    const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

    // SDK auto-detects AWS_BEARER_TOKEN_BEDROCK from env
    const client = new BedrockRuntimeClient({ region: REGION });

    const start = Date.now();
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      messages: [
        {
          role: "user",
          content: [{ text: "Say hello and confirm you are Claude. One sentence." }],
        },
      ],
      inferenceConfig: {
        maxTokens: 100,
        temperature: 0.1,
      },
    });

    const response = await client.send(command);
    const latency = Date.now() - start;
    const content = response.output?.message?.content?.[0]?.text || "No content";

    console.log(`✅ SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Usage:", JSON.stringify(response.usage));
    console.log("Stop:", response.stopReason);
    return true;
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.log("⏭️  SKIPPED: @aws-sdk/client-bedrock-runtime not installed");
      console.log("   Install with: npm install @aws-sdk/client-bedrock-runtime");
    } else {
      console.error(`❌ FAILED: ${error.name}: ${error.message}`);
    }
    return false;
  }
}

// ============================================================
// RUN ALL TESTS
// ============================================================
async function main() {
  const results = {};

  results.converse = await testConverse();
  results.invoke = await testInvokeModel();
  results.stream = await testConverseStream();
  results.sdk = await testSDK();

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   RESULTS                                    ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Converse API:     ${results.converse ? "✅ PASS" : "❌ FAIL"}                    ║`);
  console.log(`║  InvokeModel API:  ${results.invoke ? "✅ PASS" : "❌ FAIL"}                    ║`);
  console.log(`║  Stream API:       ${results.stream ? "✅ PASS" : "❌ FAIL"}                    ║`);
  console.log(`║  SDK Converse:     ${results.sdk ? "✅ PASS" : "❌ FAIL"}                    ║`);
  console.log("╚══════════════════════════════════════════════╝");

  if (results.converse || results.invoke) {
    console.log("\n🎉 Bedrock is working! Use this config in your .env:");
    console.log(`   AWS_BEDROCK_REGION=${REGION}`);
    console.log(`   BEDROCK_MODEL_ID=${MODEL_ID}`);
    console.log(`   AWS_BEARER_TOKEN_BEDROCK=${BEARER_TOKEN.substring(0, 10)}...`);
  } else {
    console.log("\n⚠️  All tests failed. Common causes:");
    console.log("   1. Running from unsupported country → Run this on your AWS server, not locally");
    console.log("   2. Bearer token expired → Generate a new one in Bedrock console");
    console.log("   3. Model not enabled → Enable Claude in Bedrock console → Model Access");
    console.log(`      https://console.aws.amazon.com/bedrock/home?region=${REGION}#/modelaccess`);
    console.log("   4. Wrong model ID → Check available models in your region");
  }
}

main();