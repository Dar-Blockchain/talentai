const {
  BedrockRuntimeClient,
  InvokeModelCommand,
  ConverseCommand,
} = require("@aws-sdk/client-bedrock-runtime");
require("dotenv").config();

// ── Client setup (bearer token auth via AWS_BEARER_TOKEN_BEDROCK) ──

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
    "⚠️ AWS Bedrock: No valid explicit credentials in .env — using default credential chain (AWS profile/IAM role/bearer token)"
  );
}

const client = new BedrockRuntimeClient(clientConfig);

const REGION = process.env.AWS_BEDROCK_REGION || "us-east-1";
const MODEL_ID = process.env.BEDROCK_MODEL_ID || "openai.gpt-oss-120b-1:0";
const FAST_MODEL_ID = process.env.BEDROCK_FAST_MODEL_ID || MODEL_ID;
const BEARER_TOKEN = process.env.AWS_BEARER_TOKEN_BEDROCK;

console.log(`🤖 Bedrock model: ${MODEL_ID} (region: ${REGION})`);
if (FAST_MODEL_ID !== MODEL_ID) {
  console.log(`⚡ Bedrock fast model: ${FAST_MODEL_ID}`);
}

/**
 * Strip <think>/<thinking> reasoning tags from model responses.
 * Reasoning models (gpt-oss, o1, etc.) may wrap responses in thinking tags.
 */
function stripThinkingTags(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<reasoning>[\s\S]*?<\/reasoning>/gi, '')
    .trim();
}

/**
 * Call Bedrock gpt-oss via InvokeModelCommand (OpenAI-native body format).
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
  useFastModel = false,
}) {
  const activeModel = useFastModel && FAST_MODEL_ID !== MODEL_ID ? FAST_MODEL_ID : MODEL_ID;
  const useConverseAPI = useFastModel && FAST_MODEL_ID !== MODEL_ID;

  // Normalize message content to plain strings
  const normalizeContent = (content) =>
    typeof content === "string"
      ? content
      : Array.isArray(content)
        ? content.map((c) => c.text || c).join("")
        : String(content);

  // Use AbortController for clean timeout
  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), timeout);

  try {
    if (useConverseAPI) {
      // ── ConverseCommand: universal API for Nova, Claude, Llama, etc. ──
      const converseMessages = messages.map((m) => ({
        role: m.role,
        content: [{ text: normalizeContent(m.content) }],
      }));

      const converseParams = {
        modelId: activeModel,
        messages: converseMessages,
        inferenceConfig: { maxTokens, temperature },
      };
      if (systemPrompt) {
        converseParams.system = [{ text: systemPrompt }];
      }

      const result = await client.send(new ConverseCommand(converseParams), {
        abortSignal: abortController.signal,
      });

      const content = stripThinkingTags(
        result.output?.message?.content?.[0]?.text || ""
      );
      return { content };
    } else {
      // ── InvokeModelCommand: OpenAI-native format for gpt-oss ──
      const msgs = [];
      if (systemPrompt) {
        msgs.push({ role: "system", content: systemPrompt });
      }
      for (const m of messages) {
        msgs.push({ role: m.role, content: normalizeContent(m.content) });
      }

      const payload = {
        model: activeModel,
        max_completion_tokens: maxTokens,
        temperature,
        messages: msgs,
      };

      const command = new InvokeModelCommand({
        modelId: activeModel,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      });

      const result = await client.send(command, {
        abortSignal: abortController.signal,
      });

      const responseBody = JSON.parse(new TextDecoder().decode(result.body));
      const content = stripThinkingTags(
        responseBody.choices?.[0]?.message?.content || ""
      );
      return { content };
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timeout: Bedrock callLLM exceeded ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Call Bedrock gpt-oss with streaming via OpenAI-compatible HTTP SSE endpoint.
 * ConverseStreamCommand does NOT work with gpt-oss — use HTTP SSE instead.
 *
 * @param {Object} options
 * @param {string} options.systemPrompt
 * @param {Array}  options.messages
 * @param {number} [options.temperature=0.5]
 * @param {number} [options.maxTokens=1024]
 * @param {number} [options.timeout=30000]
 * @param {Function} options.onChunk - Called with each text chunk: onChunk(textDelta)
 * @returns {Promise<{ content: string }>} - Full accumulated response
 */
async function callLLMStreaming({
  systemPrompt,
  messages,
  temperature = 0.5,
  maxTokens = 1024,
  timeout = 30000,
  onChunk,
  useFastModel = false,
}) {
  if (!BEARER_TOKEN) {
    throw new Error(
      "AWS_BEARER_TOKEN_BEDROCK is required for streaming. Set it in .env"
    );
  }

  const activeModel = useFastModel ? FAST_MODEL_ID : MODEL_ID;
  const url = `https://bedrock-runtime.${REGION}.amazonaws.com/openai/v1/chat/completions`;

  // Build OpenAI-format messages array
  const msgs = [];
  if (systemPrompt) {
    msgs.push({ role: "system", content: systemPrompt });
  }
  for (const m of messages) {
    msgs.push({
      role: m.role,
      content:
        typeof m.content === "string"
          ? m.content
          : Array.isArray(m.content)
            ? m.content.map((c) => c.text || c).join("")
            : String(m.content),
    });
  }

  const payload = {
    model: activeModel,
    max_completion_tokens: maxTokens,
    temperature,
    stream: true,
    messages: msgs,
  };

  const abortController = new AbortController();
  const timer = setTimeout(() => abortController.abort(), timeout);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
      body: JSON.stringify(payload),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Bedrock streaming HTTP ${response.status}: ${errorText.substring(0, 300)}`
      );
    }

    let fullContent = "";
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep incomplete line in buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;

        if (trimmed === "data: [DONE]") {
          return { content: stripThinkingTags(fullContent) };
        }

        if (trimmed.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmed.slice(6));
            const delta = data.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              if (onChunk) onChunk(delta);
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    return { content: stripThinkingTags(fullContent) };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Timeout: Bedrock streaming exceeded ${timeout}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
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

// ── Titan Text Embeddings V2 ──

const EMBEDDING_MODEL_ID = "amazon.titan-embed-text-v2:0";

/**
 * Generate a single embedding vector using Amazon Titan Text Embeddings V2.
 * Returns a 1024-dimensional float array (same dims as previous BAAI/bge model).
 *
 * @param {string} text - Text to embed (max 50,000 chars)
 * @returns {Promise<number[]>} - 1024-dim embedding vector
 */
async function generateEmbedding(text) {
  const command = new InvokeModelCommand({
    modelId: EMBEDDING_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      inputText: (text || "").substring(0, 50000),
      dimensions: 1024,
      normalize: true,
    }),
  });

  const result = await client.send(command);
  const responseBody = JSON.parse(new TextDecoder().decode(result.body));
  return responseBody.embedding;
}

/**
 * Generate embeddings for multiple texts using Amazon Titan Text Embeddings V2.
 * Titan doesn't support batch embedding — processes sequentially.
 *
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of 1024-dim embedding vectors
 */
async function generateEmbeddings(texts) {
  const embeddings = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  return embeddings;
}

module.exports = {
  callLLM,
  callLLMStreaming,
  withTimeout,
  withRetry,
  generateEmbedding,
  generateEmbeddings,
};
