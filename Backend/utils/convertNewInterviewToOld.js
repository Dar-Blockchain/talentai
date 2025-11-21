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
  const areas = report?.coverage?.areas || {};
  const skillDetails = Object.keys(areas).map((key) => {
    const area = areas[key];

    return {
      name: key,
      type: "hard", // hard ou soft (pas technical)
      confidenceScore: (area.aiAnalysis?.qualityScore || 0) * 100,
      proficiencyLevel: Math.ceil((area.percentage || 0) / 20),
      experienceLevel: mapToValidExperienceLevel(technicalLevel),
      questionAnswerList: [],
    };
  });

  return {
    overallScore,
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