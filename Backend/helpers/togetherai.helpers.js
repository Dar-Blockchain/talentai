const Together = require("together-ai");
require("dotenv").config();

const together = new Together({ apiKey: process.env.TOGETHER_API_KEY });

/**
 * Together AI is now used ONLY for embeddings (BAAI/bge-large-en-v1.5).
 * All LLM chat calls have been migrated to AWS Bedrock (Claude).
 * See: Backend/helpers/bedrock.helpers.js
 */

/**
 * Generate a single embedding vector.
 * @param {string} text
 * @param {string} [model="BAAI/bge-large-en-v1.5"]
 * @returns {Promise<number[]>}
 */
module.exports.generateEmbedding = async (
  text,
  model = "BAAI/bge-large-en-v1.5"
) => {
  const response = await together.embeddings.create({ model, input: text });
  return response.data[0].embedding;
};

/**
 * Generate embeddings for multiple texts in one batch.
 * @param {string[]} texts
 * @param {string} [model="BAAI/bge-large-en-v1.5"]
 * @returns {Promise<number[][]>}
 */
module.exports.generateEmbeddings = async (
  texts,
  model = "BAAI/bge-large-en-v1.5"
) => {
  const response = await together.embeddings.create({ model, input: texts });
  return response.data.map((d) => d.embedding);
};

// Legacy export kept for backward compatibility during migration
module.exports.callTogetherAIWithTimeout = async (params, label) => {
  throw new Error(
    `Together AI chat calls have been migrated to Bedrock. ` +
      `Caller "${label}" must use bedrock.helpers.js instead.`
  );
};
