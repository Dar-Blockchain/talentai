const {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} = require("@aws-sdk/client-bedrock-runtime");
require("dotenv").config();

const clientConfig = {
  region: process.env.AWS_BEDROCK_REGION || "us-east-1",
};

const _accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const _secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

if (
  _accessKeyId &&
  _secretAccessKey &&
  !_accessKeyId.includes("your_") &&
  !_secretAccessKey.includes("your_")
) {
  clientConfig.credentials = {
    accessKeyId: _accessKeyId,
    secretAccessKey: _secretAccessKey,
  };
  console.log("✅ AWS Bedrock: Using explicit credentials from .env");
} else {
  console.warn(
    "⚠️ AWS Bedrock: No valid explicit credentials in .env — using default credential chain (AWS profile/IAM role/instance role)"
  );
}

const client = new BedrockRuntimeClient(clientConfig);

const MODEL_ID =
  process.env.BEDROCK_MODEL_ID || "us.anthropic.claude-sonnet-4-20250514-v1:0";

/**
 * Call Bedrock Claude with timeout and JSON parsing support.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt - System-level instruction
 * @param {Array}  options.messages     - [{ role: "user"|"assistant", content: string }]
 * @param {number} [options.temperature=0.5]
 * @param {number} [options.maxTokens=1024]
 * @param {number} [options.timeout=15000] - Timeout in ms
 * @returns {Promise<{ content: string }>}
 */
async function callLLM({
  systemPrompt,
  messages,
  temperature = 0.5,
  maxTokens = 1024,
  timeout = 15000,
}) {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt || "",
    messages: messages.map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? [{ type: "text", text: m.content }]
          : m.content,
    })),
  };

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const result = await withTimeout(
    client.send(command),
    timeout,
    `Bedrock callLLM (timeout ${timeout}ms)`
  );

  const responseBody = JSON.parse(new TextDecoder().decode(result.body));
  const content = responseBody.content?.[0]?.text || "";

  return { content };
}

/**
 * Call Bedrock Claude with streaming. Yields chunks via onChunk callback.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt
 * @param {Array}  options.messages
 * @param {number} [options.temperature=0.5]
 * @param {number} [options.maxTokens=1024]
 * @param {Function} options.onChunk - Called with each text chunk: onChunk(textDelta)
 * @returns {Promise<{ content: string }>} - Full accumulated response
 */
async function callLLMStreaming({
  systemPrompt,
  messages,
  temperature = 0.5,
  maxTokens = 1024,
  onChunk,
}) {
  const payload = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt || "",
    messages: messages.map((m) => ({
      role: m.role,
      content:
        typeof m.content === "string"
          ? [{ type: "text", text: m.content }]
          : m.content,
    })),
  };

  const command = new InvokeModelWithResponseStreamCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload),
  });

  const response = await client.send(command);

  let fullContent = "";

  for await (const item of response.body) {
    if (item.chunk) {
      const chunkData = JSON.parse(new TextDecoder().decode(item.chunk.bytes));

      if (
        chunkData.type === "content_block_delta" &&
        chunkData.delta?.type === "text_delta"
      ) {
        const text = chunkData.delta.text;
        fullContent += text;
        if (onChunk) onChunk(text);
      }
    }
  }

  return { content: fullContent };
}

/**
 * Wrap a promise with a timeout. Rejects if the promise doesn't resolve in time.
 *
 * @param {Promise} promise
 * @param {number} ms - Timeout in milliseconds
 * @param {string} [label] - Label for error message
 * @returns {Promise}
 */
function withTimeout(promise, ms, label = "operation") {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(
      () => reject(new Error(`Timeout: ${label} exceeded ${ms}ms`)),
      ms
    );
  });

  return Promise.race([promise, timeoutPromise]).finally(() =>
    clearTimeout(timeoutId)
  );
}

/**
 * Retry a function with exponential backoff.
 *
 * @param {Function} fn - Async function to retry
 * @param {number} [maxRetries=2]
 * @param {number} [baseDelay=1000] - Base delay in ms (doubles each retry)
 * @returns {Promise}
 */
async function withRetry(fn, maxRetries = 2, baseDelay = 1000) {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `⚠️ Retry ${attempt + 1}/${maxRetries} after ${delay}ms:`,
          error.message
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

module.exports = {
  callLLM,
  callLLMStreaming,
  withTimeout,
  withRetry,
};
