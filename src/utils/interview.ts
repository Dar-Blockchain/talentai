/**
 * Helper function to extract interview data from API response
 */
export const extractInterviewData = (row: any) => {
  const metadata = row.metadata || {};
  const interviewData = row.interviewData || {};
  const finalReport = interviewData.finalReport || {};
  const coverage = finalReport.coverage || {};
  const areas = coverage.areas || {};
  const technicalDepth = areas.technical_depth || {};
  const problemApproach = areas.problem_approach || {};

  return {
    metadata,
    interviewData,
    finalReport,
    coverage,
    technicalDepth,
    problemApproach,
    overallCoverage: coverage.overall !== undefined ? coverage.overall : null,
    qualityScore: technicalDepth.aiAnalysis?.qualityScore || problemApproach.aiAnalysis?.qualityScore,
    technicalDepthPercentage: technicalDepth.percentage,
    problemApproachPercentage: problemApproach.percentage,
    technicalIndicators: technicalDepth.indicators?.filter((i: any) => i.covered) || [],
    problemIndicators: problemApproach.indicators?.filter((i: any) => i.covered) || [],
  };
};