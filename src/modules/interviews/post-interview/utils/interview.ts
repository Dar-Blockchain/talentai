interface CoverageAreaIndicator {
  covered?: boolean;
  [key: string]: unknown;
}

interface CoverageArea {
  aiAnalysis?: { qualityScore?: number };
  percentage?: number;
  indicators?: CoverageAreaIndicator[];
  [key: string]: unknown;
}

interface InterviewDataRow {
  metadata?: Record<string, unknown>;
  interviewData?: {
    finalReport?: {
      coverage?: {
        overall?: number;
        areas?: {
          technical_depth?: CoverageArea;
          problem_approach?: CoverageArea;
          [key: string]: unknown;
        };
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/**
 * Helper function to extract interview data from API response
 */
export const extractInterviewData = (row: InterviewDataRow) => {
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
    technicalIndicators: technicalDepth.indicators?.filter((i) => i.covered) || [],
    problemIndicators: problemApproach.indicators?.filter((i) => i.covered) || [],
  };
};