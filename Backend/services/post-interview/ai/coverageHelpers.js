'use strict';

/**
 * Pure utility functions for coverage-area arithmetic.
 * No LLM calls, no I/O — safe to call anywhere with zero latency.
 */

/**
 * Return the coverage area with the fewest questions asked, skipping excludeArea.
 *
 * @param {object}      coverageAreas - session.coverage.areas map
 * @param {string|null} excludeArea   - area to skip (current area)
 * @returns {string} area key
 */
function findLeastAskedArea(coverageAreas, excludeArea = null) {
  let minQuestions = Infinity;
  let selectedArea = null;

  for (const [areaName, data] of Object.entries(coverageAreas)) {
    if (areaName === excludeArea) continue;
    const count = data.questionsAsked || 0;
    if (count < minQuestions) {
      minQuestions = count;
      selectedArea = areaName;
    }
  }

  return (
    selectedArea ||
    Object.keys(coverageAreas).find(n => n !== excludeArea) ||
    Object.keys(coverageAreas)[0]
  );
}

/**
 * Calculate the average quality score for candidate responses in a specific area.
 * Walks the conversation array looking for interviewer → candidate pairs where
 * the question targeted areaName.
 *
 * @param {Array}  conversation  - session.conversation
 * @param {string} areaName      - area key
 * @param {number} questionCount - questions asked in this area (0 → returns 50)
 * @returns {number} average quality score 0–100, defaults to 50 when no data
 */
function calculateAreaQualityAverage(conversation, areaName, questionCount) {
  if (!areaName || questionCount === 0) return 50;

  const scores = [];
  for (let i = 0; i < conversation.length; i++) {
    const entry = conversation[i];
    if (entry.type === 'interviewer' && entry.metadata?.targetAreas?.includes(areaName)) {
      const next = conversation[i + 1];
      if (next?.type === 'candidate') {
        const score = next.metadata?.qualityScore ?? next.aiAnalysis?.qualityScore;
        if (score !== undefined) scores.push(score);
      }
    }
  }

  if (scores.length === 0) return 50;

  const average = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  console.log(`📊 [Quality Analysis] ${areaName}: ${scores.length} responses, avg quality: ${average.toFixed(1)}/100`);
  return average;
}

module.exports = { findLeastAskedArea, calculateAreaQualityAverage };
