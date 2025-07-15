const {
  BUSINESS_OVERALL_SCORE_WEIGHTS,
  TECH_TYPE_WEIGHTS,
  TECHNICAL_OVERALL_SCORE_WEIGHTS,
  PROJECT_ASSESSMENT_TYPE,
  ELIGIBILITY_REQUIREMENTS,
  ELIGIBILITY_CHECKS_STATUS,
  MIN_TRACK_ALIGNMENT_SCORE,
  TECH_STACK_TYPES,
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
    hederaEcosystemImpact:
      BUSINESS_OVERALL_SCORE_WEIGHTS.HEDERA_ECOSYSTEM_IMPACT,
    trackAlignment: BUSINESS_OVERALL_SCORE_WEIGHTS.TRACK_ALIGNMENT,
  }
) {
  if (!businessData) return 0;
  const {
    innovation,
    businessModel,
    marketPotential,
    hederaEcosystemImpact,
    trackAlignment,
  } = businessData;

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

  const hederaEcosystemImpactScore =
    hederaEcosystemImpact && typeof hederaEcosystemImpact.score === "number"
      ? hederaEcosystemImpact.score
      : 0;

  const trackAlignmentScore =
    trackAlignment && typeof trackAlignment.score === "number"
      ? trackAlignment.score
      : 0;

  // Weighted sum
  const overallScore =
    innovationScore * weights.innovation +
    businessModelScore * weights.businessModel +
    marketPotentialScore * weights.marketPotential +
    hederaEcosystemImpactScore * weights.hederaEcosystemImpact +
    trackAlignmentScore * weights.trackAlignment;

  // Clamp to 0-100 and round
  return Math.round(Math.max(0, Math.min(100, overallScore)) * 100) / 100;
}

function handleAssessmentOverallScore(
  technicalOverallScore,
  businessOverallScore
) {
  let technicalScore = technicalOverallScore
    ? Number(technicalOverallScore)
    : 0;

  let businessScore = businessOverallScore ? Number(businessOverallScore) : 0;

  const techWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.TECHNICAL;
  const bizWeight = ASSESSMENT_OVERALL_SCORE_WEIGHTS.BUSINESS;
  const totalWeight = techWeight + bizWeight;

  const weightedSum =
    (technicalScore * techWeight + businessScore * bizWeight) / totalWeight;

  return Math.round(weightedSum * 100) / 100;
}

function calculateTechStackScore(techStack = []) {
  if (!Array.isArray(techStack) || techStack.length === 0)
    return { score: 0, isValid: false };

  const typeWeights = {
    [TECH_STACK_TYPES.HEDERA_TOOLING]: TECH_TYPE_WEIGHTS.HEDERA_TOOLING,
    [TECH_STACK_TYPES.HEDERA_SERVICE]: TECH_TYPE_WEIGHTS.HEDERA_SERVICE,
    [TECH_STACK_TYPES.CORE_TECH]: TECH_TYPE_WEIGHTS.CORE_TECH,
    [TECH_STACK_TYPES.INTEGRATION_TOOL]: TECH_TYPE_WEIGHTS.INTEGRATION_TOOL,
    [TECH_STACK_TYPES.INFRASTRUCTURE]: TECH_TYPE_WEIGHTS.INFRASTRUCTURE,
  };

  // Group scores by componentType
  const scoresByType = {};
  const countsByType = {};

  for (const item of techStack) {
    const type = item.componentType;
    const score = typeof item.score === "number" ? item.score : 0;

    if (!scoresByType[type]) {
      scoresByType[type] = 0;
      countsByType[type] = 0;
    }
    scoresByType[type] += score;
    countsByType[type] += 1;
  }

  // Calculate average score per type
  const avgScoresByType = {};
  for (const type in scoresByType) {
    avgScoresByType[type] = scoresByType[type] / countsByType[type];
  }

  // Calculate weighted average of the averages
  let weightedSum = 0;
  let totalWeight = 0;

  for (const type in avgScoresByType) {
    const weight = typeWeights[type] || 0;
    weightedSum += avgScoresByType[type] * weight;
    totalWeight += weight;
  }

  const isValid = totalWeight > 0;
  const score = isValid ? weightedSum / totalWeight : 0;

  return score;
}

function handleTechnicalOverallScore(technicalData) {
  if (!technicalData || !technicalData.techStack || technicalData.techStack.length === 0) return 0;

  const categoryWeights = {
    techStack: TECHNICAL_OVERALL_SCORE_WEIGHTS.TECH_STACK,
    architecture: TECHNICAL_OVERALL_SCORE_WEIGHTS.ARCHITECTURE,
    scalability: TECHNICAL_OVERALL_SCORE_WEIGHTS.SCALABILITY_APPROACH,
  };

  const techStackScore = calculateTechStackScore(technicalData.techStack);

  const hasArchitecture = typeof technicalData.architecture?.score === "number";
  const architectureScore = hasArchitecture
    ? technicalData.architecture.score
    : 0;

  const hasScalability =
    typeof technicalData.scalabilityApproach?.score === "number";
  const scalabilityScore = hasScalability
    ? technicalData.scalabilityApproach.score
    : 0;

  let finalScore = 0;
  finalScore =
    architectureScore * categoryWeights.architecture +
    scalabilityScore * categoryWeights.scalability +
    techStackScore * categoryWeights.techStack;

  return Math.round(Math.max(0, Math.min(100, finalScore)) * 100) / 100;
}

/**
 * Updates the eligibility status of a project assessment based on the business track alignment score.
 *
 * This function  evaluates the trackAlignment score from the analysis.
 *    - If the score meets or exceeds the minimum required (MIN_TRACK_ALIGNMENT_SCORE), the TRACK_MATCH eligibility check is marked as approved.
 *    - Otherwise, it is marked as not approved. The assessment is then saved.
 *
 * @param {Object} assessment - The ProjectAssessment mongoose document to update.
 * @param {Object} analysis - The analysis object containing businessData and trackAlignment score.
 * @param {string} assessmentType - The type of assessment (should be PROJECT_ASSESSMENT_TYPE.BUSINESS).
 * @returns {Promise<void>}
 */
async function handleEligibility(assessment, analysis, assessmentType) {
  // handle eligibility for business assessment
  if (assessmentType === PROJECT_ASSESSMENT_TYPE.BUSINESS) {
    if (
      assessment.businessData &&
      assessment.businessData.trackAlignment &&
      typeof analysis.businessData.trackAlignment.score === "number"
    ) {
      if (
        analysis.businessData.trackAlignment.score >= MIN_TRACK_ALIGNMENT_SCORE
      ) {
        assessment.eligibility.checks.map((check) => {
          if (check.type === ELIGIBILITY_REQUIREMENTS.TRACK_MATCH) {
            check.status = ELIGIBILITY_CHECKS_STATUS.IS_APPROVED;
          }
        });
      } else {
        assessment.eligibility.checks.map((check) => {
          if (check.type === ELIGIBILITY_REQUIREMENTS.TRACK_MATCH) {
            check.status = ELIGIBILITY_CHECKS_STATUS.IS_NOT_APPROVED;
          }
        });
      }
    }
  }
  // handle eligibility for code assessment
  //(to be handled when integrating code assessment)

  await assessment.save();
}

module.exports = {
  handleBusinessOverallScore,
  handleTechnicalOverallScore,
  handleAssessmentOverallScore,
  handleEligibility,
};
