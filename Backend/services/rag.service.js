const mongoose = require("mongoose");
const { generateEmbedding, generateEmbeddings } = require("../helpers/bedrock.helpers");
require("dotenv").config();

const EMBEDDING_DIMS = 1024; // Titan Text Embeddings V2 default
const SIMILARITY_THRESHOLD = 0.72; // Lowered from 0.85 to catch theme-similar questions

// ─── Collection Helpers ─────────────────────────────────────────────────────

function getJdChunksCollection() {
  return mongoose.connection.db.collection("jd_chunks");
}

function getInterviewQuestionsCollection() {
  return mongoose.connection.db.collection("interview_questions");
}

// ─── Job Description Indexing ───────────────────────────────────────────────

/**
 * Chunk a job description into semantic sections, embed, and store.
 * Called once when an interview starts for a new job.
 *
 * @param {string} jobId - Post._id
 * @param {Object} jobData - { title, description, requirements[], responsibilities[], companyName }
 */
async function indexJobDescription(jobId, jobData) {
  const col = getJdChunksCollection();

  // Skip if already indexed
  const existing = await col.findOne({ jobId: jobId.toString() });
  if (existing) return;

  const chunks = [];

  // Chunk 1: Role overview
  if (jobData.description) {
    chunks.push({
      type: "role_overview",
      text: `Role: ${jobData.title}. ${jobData.description}`,
    });
  }

  // Chunk 2: Requirements (combined)
  if (jobData.requirements?.length) {
    chunks.push({
      type: "requirements",
      text: `Requirements for ${jobData.title}: ${jobData.requirements.join(". ")}`,
    });
  }

  // Chunk 3: Responsibilities (combined)
  if (jobData.responsibilities?.length) {
    chunks.push({
      type: "responsibilities",
      text: `Responsibilities for ${jobData.title}: ${jobData.responsibilities.join(". ")}`,
    });
  }

  // Chunk 4: Company context
  if (jobData.companyName) {
    chunks.push({
      type: "company",
      text: `Company: ${jobData.companyName}. Interviewing for ${jobData.title}.`,
    });
  }

  if (chunks.length === 0) return;

  // Batch-embed all chunks
  const texts = chunks.map((c) => c.text);
  const embeddings = await generateEmbeddings(texts);

  // Store with embeddings
  const docs = chunks.map((chunk, i) => ({
    jobId: jobId.toString(),
    type: chunk.type,
    text: chunk.text,
    embedding: embeddings[i],
    createdAt: new Date(),
  }));

  await col.insertMany(docs);
  console.log(
    `✅ Indexed ${docs.length} JD chunks for job ${jobId}`
  );
}

// ─── Question Indexing & Deduplication ──────────────────────────────────────

/**
 * Store an asked question's embedding for deduplication.
 *
 * @param {string} interviewId
 * @param {string} question
 */
async function indexAskedQuestion(interviewId, question) {
  const col = getInterviewQuestionsCollection();
  const embedding = await generateEmbedding(question);

  await col.insertOne({
    interviewId: interviewId.toString(),
    question,
    embedding,
    createdAt: new Date(),
  });
}

/**
 * Find questions similar to a proposed one using vector search.
 * Replaces the LLM-based analyzeQuestionSimilarity.
 *
 * @param {string} interviewId
 * @param {string} proposedQuestion
 * @param {number} [threshold=0.85]
 * @returns {Promise<{ isSimilar: boolean, similarQuestion: string|null, score: number }>}
 */
async function findSimilarQuestions(
  interviewId,
  proposedQuestion,
  threshold = SIMILARITY_THRESHOLD
) {
  const col = getInterviewQuestionsCollection();
  const queryVector = await generateEmbedding(proposedQuestion);

  try {
    const results = await col
      .aggregate([
        {
          $vectorSearch: {
            index: "question_vector_index",
            path: "embedding",
            queryVector,
            numCandidates: 50,
            limit: 5,
            filter: { interviewId: interviewId.toString() },
          },
        },
        {
          $project: {
            question: 1,
            score: { $meta: "vectorSearchScore" },
          },
        },
      ])
      .toArray();

    if (results.length > 0 && results[0].score >= threshold) {
      return {
        isSimilar: true,
        similarQuestion: results[0].question,
        score: results[0].score,
      };
    }

    return { isSimilar: false, similarQuestion: null, score: 0 };
  } catch (error) {
    // If vector search index doesn't exist yet, fall back gracefully
    if (
      error.codeName === "InvalidPipelineOperator" ||
      error.message?.includes("vectorSearch")
    ) {
      console.warn(
        "⚠️ Vector search index not available, skipping similarity check"
      );
      return { isSimilar: false, similarQuestion: null, score: 0 };
    }
    throw error;
  }
}

// ─── Context Retrieval ──────────────────────────────────────────────────────

/**
 * Retrieve relevant JD context + asked questions for the next question generation.
 *
 * @param {string} jobId
 * @param {string} interviewId
 * @param {string} candidateLastResponse - The candidate's most recent answer
 * @returns {Promise<{ jdContext: string, askedQuestions: string[] }>}
 */
async function retrieveContext(jobId, interviewId, candidateLastResponse) {
  const jdCol = getJdChunksCollection();
  const qCol = getInterviewQuestionsCollection();

  let jdContext = "";
  let askedQuestions = [];

  // 1. Retrieve relevant JD chunks via vector search
  try {
    if (candidateLastResponse) {
      const queryVector = await generateEmbedding(candidateLastResponse);

      const jdResults = await jdCol
        .aggregate([
          {
            $vectorSearch: {
              index: "jd_vector_index",
              path: "embedding",
              queryVector,
              numCandidates: 20,
              limit: 3,
              filter: { jobId: jobId.toString() },
            },
          },
          {
            $project: {
              type: 1,
              text: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ])
        .toArray();

      if (jdResults.length > 0) {
        jdContext = jdResults.map((r) => r.text).join("\n\n");
      }
    }
  } catch (error) {
    // If vector search not available, fall back to fetching all chunks
    if (
      error.codeName === "InvalidPipelineOperator" ||
      error.message?.includes("vectorSearch")
    ) {
      const allChunks = await jdCol
        .find({ jobId: jobId.toString() })
        .toArray();
      jdContext = allChunks.map((c) => c.text).join("\n\n");
    } else {
      console.error("❌ Error retrieving JD context:", error.message);
    }
  }

  // 2. Retrieve all asked questions for this interview (for dedup awareness)
  try {
    const questions = await qCol
      .find({ interviewId: interviewId.toString() })
      .project({ question: 1 })
      .toArray();

    askedQuestions = questions.map((q) => q.question);
  } catch (error) {
    console.error("❌ Error retrieving asked questions:", error.message);
  }

  return { jdContext, askedQuestions };
}

// ─── Index Setup ────────────────────────────────────────────────────────────

/**
 * Ensure MongoDB collections and standard indexes exist.
 * Vector search indexes must be created in Atlas UI or via Atlas API.
 */
async function ensureIndexes() {
  try {
    const jdCol = getJdChunksCollection();
    const qCol = getInterviewQuestionsCollection();

    // Standard indexes for filtering
    await jdCol.createIndex({ jobId: 1 });
    await qCol.createIndex({ interviewId: 1 });
    await qCol.createIndex({ interviewId: 1, createdAt: 1 });

    console.log("✅ RAG standard indexes ensured");
  } catch (error) {
    console.warn("⚠️ Could not create RAG indexes:", error.message);
  }
}

module.exports = {
  generateEmbedding,
  generateEmbeddings,
  indexJobDescription,
  indexAskedQuestion,
  findSimilarQuestions,
  retrieveContext,
  ensureIndexes,
  EMBEDDING_DIMS,
};
