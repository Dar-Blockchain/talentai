/**
 * Bedrock Test Script — OpenAI gpt-oss-120b via Bearer Token
 * Tests InvokeModel (OpenAI format), Converse, Streaming (SSE), and SDK APIs
 *
 * Run on your AWS server (us-east-1): node test-bedrock.js
 *
 * Required in .env:
 *   AWS_BEARER_TOKEN_BEDROCK=your-token
 *   AWS_BEDROCK_REGION=us-east-1
 *   BEDROCK_MODEL_ID=openai.gpt-oss-120b-1:0
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const REGION = process.env.AWS_BEDROCK_REGION || "us-east-1";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "openai.gpt-oss-120b-1:0";
const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK;

console.log("╔══════════════════════════════════════════════╗");
console.log("║   Bedrock gpt-oss-120b Test Script           ║");
console.log("╚══════════════════════════════════════════════╝\n");
console.log("Region:      ", REGION);
console.log("Model:       ", MODEL_ID);
console.log("Bearer Token:", BEARER_TOKEN ? `YES (${BEARER_TOKEN.substring(0, 20)}...)` : "NOT SET");
console.log("");

if (!BEARER_TOKEN) {
  console.error("ERROR: AWS_BEARER_TOKEN_BEDROCK is not set in .env");
  process.exit(1);
}

const headers = {
  "Content-Type": "application/json",
  Accept: "application/json",
  Authorization: `Bearer ${BEARER_TOKEN}`,
};

// ============================================================
// TEST 1: Converse API (unified format — works with gpt-oss)
// ============================================================
async function testConverse() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/converse`;

  const payload = {
    messages: [
      {
        role: "user",
        content: [{ text: "Say hello and confirm which model you are. One sentence only." }],
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
      console.error(`FAILED: HTTP ${response.status}`);
      console.error("Response:", responseText.substring(0, 300));
      return false;
    }

    const body = JSON.parse(responseText);
    const content = body.output?.message?.content?.[0]?.text || "No content";

    console.log(`SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Usage:", JSON.stringify(body.usage));
    console.log("Stop:", body.stopReason);
    return true;
  } catch (error) {
    console.error("FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 2: InvokeModel API (OpenAI-native body format)
// ============================================================
async function testInvokeModel() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/model/${encodeURIComponent(MODEL_ID)}/invoke`;

  const payload = {
    model: MODEL_ID,
    max_completion_tokens: 100,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are a test assistant. Reply in one short sentence.",
      },
      {
        role: "user",
        content: "Confirm which model you are and that you are running on AWS Bedrock.",
      },
    ],
  };

  console.log("\n─── Test 2: InvokeModel API (OpenAI format) ───");
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
      console.error(`FAILED: HTTP ${response.status}`);
      console.error("Response:", responseText.substring(0, 300));
      return false;
    }

    const body = JSON.parse(responseText);
    const content = body.choices?.[0]?.message?.content || "No content";

    console.log(`SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Model:", body.model);
    console.log("Usage:", JSON.stringify(body.usage));
    console.log("Finish:", body.choices?.[0]?.finish_reason);
    return true;
  } catch (error) {
    console.error("FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 3: OpenAI-compatible SSE Streaming endpoint
// (ConverseStreamCommand does NOT work with gpt-oss)
// ============================================================
async function testStreaming() {
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/openai/v1/chat/completions`;

  const payload = {
    model: MODEL_ID,
    max_completion_tokens: 100,
    temperature: 0.1,
    stream: true,
    messages: [
      {
        role: "user",
        content: "Count from 1 to 5, one number per line.",
      },
    ],
  };

  console.log("\n─── Test 3: OpenAI SSE Streaming ───");
  console.log("URL:", url);
  console.log("");

  try {
    const start = Date.now();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FAILED: HTTP ${response.status}`);
      console.error("Response:", errorText.substring(0, 300));
      return false;
    }

    const firstByteLatency = Date.now() - start;
    console.log(`Stream connected! (${firstByteLatency}ms to first byte)`);
    process.stdout.write("Streamed: ");

    let fullContent = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (trimmed === "data: [DONE]") continue;

        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              process.stdout.write(delta);
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    }

    const totalLatency = Date.now() - start;
    console.log(`\nTotal: ${totalLatency}ms`);
    console.log("Full response:", fullContent);
    console.log(`SUCCESS!`);
    return true;
  } catch (error) {
    console.error("FAILED:", error.message);
    return false;
  }
}

// ============================================================
// TEST 4: SDK-based test (ConverseCommand)
// ============================================================
async function testSDK() {
  console.log("\n─── Test 4: AWS SDK (ConverseCommand) ───");

  try {
    const { BedrockRuntimeClient, ConverseCommand } = require("@aws-sdk/client-bedrock-runtime");

    const sdkClient = new BedrockRuntimeClient({ region: REGION });

    const start = Date.now();
    const command = new ConverseCommand({
      modelId: MODEL_ID,
      messages: [
        {
          role: "user",
          content: [{ text: "Say hello and confirm which model you are. One sentence." }],
        },
      ],
      inferenceConfig: {
        maxTokens: 100,
        temperature: 0.1,
      },
    });

    const response = await sdkClient.send(command);
    const latency = Date.now() - start;
    const content = response.output?.message?.content?.[0]?.text || "No content";

    console.log(`SUCCESS! (${latency}ms)`);
    console.log("Response:", content);
    console.log("Usage:", JSON.stringify(response.usage));
    console.log("Stop:", response.stopReason);
    return true;
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.log("SKIPPED: @aws-sdk/client-bedrock-runtime not installed");
      console.log("   Install with: npm install @aws-sdk/client-bedrock-runtime");
    } else {
      console.error(`FAILED: ${error.name}: ${error.message}`);
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
  results.stream = await testStreaming();
  results.sdk = await testSDK();

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║   RESULTS                                    ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  Converse API:     ${results.converse ? "PASS" : "FAIL"}                    ║`);
  console.log(`║  InvokeModel API:  ${results.invoke ? "PASS" : "FAIL"}                    ║`);
  console.log(`║  SSE Streaming:    ${results.stream ? "PASS" : "FAIL"}                    ║`);
  console.log(`║  SDK Converse:     ${results.sdk ? "PASS" : "FAIL"}                    ║`);
  console.log("╚══════════════════════════════════════════════╝");

  if (results.converse || results.invoke) {
    console.log("\nBedrock is working! Config in .env:");
    console.log(`   AWS_BEDROCK_REGION=${REGION}`);
    console.log(`   BEDROCK_MODEL_ID=${MODEL_ID}`);
    console.log(`   AWS_BEARER_TOKEN_BEDROCK=${BEARER_TOKEN.substring(0, 10)}...`);
  } else {
    console.log("\nAll tests failed. Common causes:");
    console.log("   1. Running from unsupported location -> Run on your AWS server");
    console.log("   2. Bearer token expired -> Generate a new one in Bedrock console");
    console.log("   3. Model not enabled -> Enable gpt-oss in Bedrock console -> Model Access");
    console.log(`      https://console.aws.amazon.com/bedrock/home?region=${REGION}#/modelaccess`);
    console.log("   4. Wrong model ID -> Check available models in your region");
  }
}

main();
