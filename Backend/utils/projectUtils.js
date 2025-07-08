const {
  BUSINESS_OVERALL_SCORE_WEIGHTS,
} = require("../constants/projectConstants");

/**
 * Calculates the overallScore for businessData by assigning weights to each component score.
 * @param {Object} businessData - The businessData object containing innovation, businessModel, marketPotential.
 * @param {Object} [weights] - Optional custom weights for each component. Defaults: innovation=0.3, businessModel=0.4, marketPotential=0.3
 * @returns {number} The calculated overallScore (0-100, rounded to 2 decimals)
 */
function handleBusinessOverallScore(
  businessData,
  weights = {
    innovation: BUSINESS_OVERALL_SCORE_WEIGHTS.INNOVATION,
    businessModel: BUSINESS_OVERALL_SCORE_WEIGHTS.BUSINESS_MODEL,
    marketPotential: BUSINESS_OVERALL_SCORE_WEIGHTS.MARKET_POTENTIAL,
  }
) {
  if (!businessData) return 0;
  const { innovation, businessModel, marketPotential } = businessData;

  // Extract scores, defaulting to 0 if missing
  const innovationScore =
    innovation && typeof innovation.score === "number" ? innovation.score : 0;

  const businessModelScore =
    businessModel && typeof businessModel.score === "number"
      ? businessModel.score
      : 0;

  const marketPotentialScore =
    marketPotential && typeof marketPotential.score === "number"
      ? marketPotential.score
      : 0;

  // Weighted sum
  const overallScore =
    innovationScore * weights.innovation +
    businessModelScore * weights.businessModel +
    marketPotentialScore * weights.marketPotential;

  // Clamp to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, overallScore)) * 100) / 100;
}

module.exports = { handleBusinessOverallScore };
