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
      experienceLevel: technicalLevel,
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