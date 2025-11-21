// Valid experienceLevel enum values
const VALID_EXPERIENCE_LEVELS = ["NoLevel", "Entry Level", "Junior", "Mid Level", "Senior", "Expert"];

function mapToValidExperienceLevel(value) {
  if (!value) return "NoLevel";

  // If already a valid enum value, return it
  if (VALID_EXPERIENCE_LEVELS.includes(value)) {
    return value;
  }

  // Handle numeric values
  const numValue = typeof value === 'number' ? value : parseInt(value, 10);
  if (!isNaN(numValue)) {
    if (numValue <= 0) return "NoLevel";
    if (numValue === 1) return "Entry Level";
    if (numValue === 2) return "Junior";
    if (numValue === 3) return "Mid Level";
    if (numValue === 4) return "Senior";
    return "Expert";
  }

  // Handle string variations
  const lowerValue = String(value).toLowerCase().trim();
  if (lowerValue.includes("entry")) return "Entry Level";
  if (lowerValue.includes("junior")) return "Junior";
  if (lowerValue.includes("mid")) return "Mid Level";
  if (lowerValue.includes("senior")) return "Senior";
  if (lowerValue.includes("expert") || lowerValue.includes("lead")) return "Expert";

  return "Mid Level";
}

function convertNewToOld(newJson) {
  const report = newJson?.interviewData?.finalReport;
  const interviewData = newJson?.interviewData || {};
  const metadata = newJson?.metadata || {};

  // ---- 1. overallScore ----
  const overallScore = report?.coverage?.overall ?? 0;

  // ---- 2. technicalLevel → based on proficiency ----
  const technicalLevel = metadata?.proficiency || "Unknown";

  // ---- 3. generalAssessment ----
  const generalAssessment = report?.summary || "No assessment provided";

  // ---- 4. recommendations (already provided) ----
  const recommendations =
    Array.isArray(report?.recommendations) && report.recommendations.length > 0
      ? report.recommendations
      : ["No recommendations available"];

  // ---- 5. nextSteps (derive from weak areas) ----
  const weakAreas =
    report?.coverage?.aiAnalysis?.weakestAreas || [];

  const nextSteps = weakAreas.length
    ? weakAreas.map((area) => `Improve your skills in ${area}`)
    : ["No next steps identified"];

  // ---- 6. skillDetails (format MongoDB) ----
  // Use role from metadata as skill name (e.g., "javascript" from URL param)
  const primarySkillName = metadata?.role || metadata?.skill || "General";
  const areas = report?.coverage?.areas || {};

  // Calculate weighted overall score from areas
  let calculatedScore = overallScore;
  if (Object.keys(areas).length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    Object.values(areas).forEach((area) => {
      const weight = area.weight || 1;
      const percentage = area.percentage || 0;
      weightedSum += percentage * weight;
      totalWeight += weight;
    });
    calculatedScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : overallScore;
  }

  // Create skill detail with the actual tested skill (role from URL)
  const skillDetails = [{
    name: primarySkillName,
    type: "hard",
    confidenceScore: calculatedScore,
    proficiencyLevel: Math.ceil(calculatedScore / 20),
    experienceLevel: mapToValidExperienceLevel(technicalLevel),
    questionAnswerList: [],
  }];

  return {
    overallScore: calculatedScore,
    technicalLevel,
    generalAssassment: generalAssessment,
    recommendations,
    nextSteps,
    skillDetails,
    interviewType: interviewData?.interviewType || "hr",
    sessionId: interviewData?.sessionId,
    analytics: interviewData?.analytics,
  };
}

module.exports = convertNewToOld;