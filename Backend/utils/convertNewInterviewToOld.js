function convertNewToOld(newJson) {
  const report = newJson?.interviewData?.finalReport;

  // ---- 1. overallScore ----
  const overallScore = report?.coverage?.overall ?? 0;

  // ---- 2. technicalLevel → based on proficiency ----
  const technicalLevel = newJson?.metadata?.proficiency || "Unknown";

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

  // ---- 6. skillAnalysis ----
  const areas = report?.coverage?.areas || {};
  const skillAnalysis = Object.keys(areas).map((key) => {
    const area = areas[key];

    // Strengths: indicators with quality >= 2
    const strengths = area.indicators
      .filter((i) => i.quality >= 2)
      .map((i) => i.name);

    // Weaknesses: indicators with quality = 0
    const weaknesses = area.indicators
      .filter((i) => i.quality === 0)
      .map((i) => i.name);

    return {
      skillName: key,
      requiredLevel: 3, // valeur par défaut
      demonstratedExperienceLevel: Math.round(
        (area.percentage || 0) / 20
      ),
      strengths: strengths.length
        ? strengths
        : ["No strengths identified for this skill"],
      weaknesses: weaknesses.length
        ? weaknesses
        : ["No weaknesses identified for this skill"],
      confidenceScore: (area.aiAnalysis?.qualityScore || 0) * 20,

      todoList: {
        title: key,
        type: "Skill",
        tasks: [
          {
            title: `Improve skill: ${key}`,
            type: "Course",
            description: `Take a course to improve ${key}`,
            url: "",
            priority: "medium",
            dueDate: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 jours
            isCompleted: false,
          },
        ],
      },

      questionAnswerList: [], // tu peux mapper si tu as les Q/A dans new JSON
    };
  });

  return {
    overallScore,
    technicalLevel,
    generalAssassment: generalAssessment,
    recommendations,
    nextSteps,
    skillAnalysis,
  };
}

module.exports = convertNewToOld;