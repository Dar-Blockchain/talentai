const {
  BUSINESS_OVERALL_SCORE_WEIGHTS,
  TECH_TYPE_WEIGHTS,
  TECHNICAL_OVERALL_SCORE_WEIGHTS,
} = require("../constants/projectConstants");

const {
  ASSESSMENT_OVERALL_SCORE_WEIGHTS,
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

/**
 * Calculates the overallScore for technicalData by assigning weights to each component score.
 *
 * The technical overall score is a weighted sum of:
 *   - techStack: The weighted average score of all techStack items, where each item's weight is determined by its componentType (coreTechnology, integrationTool, hederaService).
 *   - architecture: The score of the architecture component.
 *   - scalabilityApproach: The score of the scalabilityApproach component.
 *
 * The weights for each component are defined in TECHNICAL_OVERALL_SCORE_WEIGHTS.
 * The weights for techStack component types are defined in TECH_TYPE_WEIGHTS.
 *
 * @param {Object} technicalData - The technicalData object containing techStack, architecture, scalabilityApproach.
 * @returns {number} The calculated overallScore (0-100, rounded to 2 decimals)
 *
 * Example:
 *   handleTechnicalOverallScore({
 *     techStack: [
 *       { componentType: "coreTechnology", score: 80 },
 *       { componentType: "integrationTool", score: 70 },
 *       { componentType: "hederaService", score: 90 }
 *     ],
 *     architecture: { score: 85 },
 *     scalabilityApproach: { score: 75 }
 *   });
 *   // => 82.34 (for example, depending on weights)
 */
function handleTechnicalOverallScore(technicalData) {
  const weights = {
    techStack: TECHNICAL_OVERALL_SCORE_WEIGHTS.TECH_STACK,
    architecture: TECHNICAL_OVERALL_SCORE_WEIGHTS.ARCHITECTURE,
    scalabilityApproach: TECHNICAL_OVERALL_SCORE_WEIGHTS.SCALABILITY_APPROACH,
  };
  if (!technicalData) return 0;

  // I. techStack: average score of all techStack items (weighted)
  let techStackScore = 0;

  if (
    Array.isArray(technicalData.techStack) &&
    technicalData.techStack.length > 0
  ) {
    const typeWeights = {
      coreTechnology: TECH_TYPE_WEIGHTS.CORE_TECHNOLOGY,
      integrationTool: TECH_TYPE_WEIGHTS.INTEGRATION_TOOL,
      hederaService: TECH_TYPE_WEIGHTS.HEDERA_SERVICE,
    };
    let weightedSum = 0;
    let totalWeight = 0;
    for (const item of technicalData.techStack) {
      const type = item.componentType;
      const score = typeof item.score === "number" ? item.score : 0;
      const weight = typeWeights[type] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }
    // Avoid division by zero
    techStackScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // II. architecture: score field
  let architectureScore = 0;
  if (
    technicalData.architecture &&
    typeof technicalData.architecture.score === "number"
  ) {
    architectureScore = technicalData.architecture.score;
  }

  // III. scalabilityApproach: score field
  let scalabilityScore = 0;
  if (
    technicalData.scalabilityApproach &&
    typeof technicalData.scalabilityApproach.score === "number"
  ) {
    scalabilityScore = technicalData.scalabilityApproach.score;
  }

  // Weighted sum
  const overallScore =
    techStackScore * weights.techStack +
    architectureScore * weights.architecture +
    scalabilityScore * weights.scalabilityApproach;

  // Clamp to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, overallScore)) * 100) / 100;
}

function handleAssessmentOverallScore(technicalOverallScore, businessOverallScore) {
  let technicalScore = technicalOverallScore
    ? Number(technicalOverallScore)
    : 0;

  let businessScore = businessOverallScore
    ? Number(businessOverallScore)
    : 0;

  const techWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.TECHNICAL;
  const bizWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.BUSINESS;
  const totalWeight = techWeight + bizWeight;

  const weightedSum =
    (technicalScore * techWeight + businessScore * bizWeight) / totalWeight;

  return Math.round(weightedSum * 100) / 100;
}

module.exports = {
  handleBusinessOverallScore,
  handleTechnicalOverallScore,
  handleAssessmentOverallScore,
};
