import React from 'react';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PsychologyIcon from '@mui/icons-material/Psychology';

/**
 * Interview Types Configuration
 */
export const INTERVIEW_TYPES = [
  { label: 'Post Interview', value: 'post_interview', icon: <AssignmentTurnedInIcon sx={{ fontSize: 18 }} /> },
  { label: 'Onboarding', value: 'onboarding', icon: <CalendarTodayIcon sx={{ fontSize: 18 }} /> },
  { label: 'HR', value: 'hr', icon: <PersonOutlineIcon sx={{ fontSize: 18 }} /> },
  { label: 'Technical', value: 'skill', icon: <TrendingUpIcon sx={{ fontSize: 18 }} /> },
  { label: 'Soft Skills', value: 'soft', icon: <PsychologyIcon sx={{ fontSize: 18 }} /> },
];

/**
 * Helper function to get interview level based on score
 */
export const getInterviewLevel = (score: number | null, type: 'skill' | 'hr' | 'onboarding' | 'soft') => {
  if (score === null) return { level: 'Unknown', color: 'default' as const };

  switch (type) {
    case 'skill':
      if (score >= 8) return { level: 'Expert', color: 'success' as const };
      if (score >= 6) return { level: 'Advanced', color: 'success' as const };
      if (score >= 4) return { level: 'Intermediate', color: 'warning' as const };
      return { level: 'Beginner', color: 'error' as const };

    case 'hr':
      if (score >= 80) return { level: 'Strong fit', color: 'success' as const };
      if (score >= 60) return { level: 'Good fit', color: 'success' as const };
      if (score >= 40) return { level: 'Consider', color: 'warning' as const };
      return { level: 'Not a fit', color: 'error' as const };

    case 'onboarding':
      if (score >= 85) return { level: 'Excellent', color: 'success' as const };
      if (score >= 70) return { level: 'Good', color: 'success' as const };
      if (score >= 50) return { level: 'Average', color: 'warning' as const };
      return { level: 'Needs Work', color: 'error' as const };

    case 'soft':
      if (score >= 85) return { level: 'Excellent', color: 'success' as const };
      if (score >= 70) return { level: 'Good', color: 'success' as const };
      if (score >= 50) return { level: 'Average', color: 'warning' as const };
      return { level: 'Needs Improvement', color: 'error' as const };

    default:
      return { level: 'Unknown', color: 'default' as const };
  }
};

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
