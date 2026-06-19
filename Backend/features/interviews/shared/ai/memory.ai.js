'use strict';

const ragService = require('../rag.service');

/**
 * MemoryAI — semantic question deduplication via RAG vector search.
 * One active method: analyzeQuestionSimilarity.
 */
class MemoryAI {
  /**
   * Check if a proposed question is too similar to one already asked.
   * Uses RAG vector search (~50ms) instead of an LLM call.
   *
   * @returns {{ isSimilar: boolean, confidence: number, reasoning: string, similarQuestions: Array, recommendations: string }}
   */
  async analyzeQuestionSimilarity(newQuestion, sessionHistory, sessionId) {
    try {
      const result = await ragService.findSimilarQuestions(sessionId, newQuestion);
      return {
        isSimilar: result.isSimilar,
        confidence: result.isSimilar ? Math.round(result.score * 100) : 0,
        reasoning: result.isSimilar
          ? `Similar to: "${result.similarQuestion}" (score: ${result.score.toFixed(2)})`
          : 'No similar questions found via vector search',
        similarQuestions: result.isSimilar
          ? [{ question: result.similarQuestion, similarity: result.score }]
          : [],
        recommendations: result.isSimilar
          ? 'Generate alternative question for same area'
          : 'Question is unique',
      };
    } catch (error) {
      console.error('Error in analyzeQuestionSimilarity:', error);
      return { isSimilar: false, confidence: 0, reasoning: 'Analysis failed', error: error.message };
    }
  }
}

module.exports = MemoryAI;
