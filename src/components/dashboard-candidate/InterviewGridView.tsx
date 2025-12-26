import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import InterviewCard from './InterviewCard';
import { getInterviewLevel } from '@/constants/interview';

interface InterviewGridViewProps {
  data: any[];
  type: 'skill' | 'hr' | 'onboarding' | 'soft';
  total: number;
  emptyMessage: string;
  emptySubtext: string;
}

const InterviewGridView: React.FC<InterviewGridViewProps> = ({ data, type, total, emptyMessage, emptySubtext }) => {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {type === 'skill' && 'Skill Assessments'}
          {type === 'hr' && 'HR Interviews'}
          {type === 'onboarding' && 'Onboarding'}
          {type === 'soft' && 'Soft Skills Assessments'}
        </Typography>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {total} result{total === 1 ? '' : 's'}
        </Typography>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 2 }}>
        {data.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
            <Typography sx={{ fontWeight: 600 }}>{emptyMessage}</Typography>
            <Typography variant="body2" sx={{ color: '#777', mt: 0.5 }}>
              {emptySubtext}
            </Typography>
          </Paper>
        ) : (
          data.map((row: any) => {
            // Calculate score based on type
            let score: number | null = null;

            if (type === 'skill' || type === 'soft') {
              const metadata = row.metadata || {};
              const interviewData = row.interviewData || {};
              const finalReport = interviewData.finalReport || {};
              const coverage = finalReport.coverage || {};
              const areas = coverage.areas || {};
              const technicalDepth = areas.technical_depth || {};
              const problemApproach = areas.problem_approach || {};

              const qualityScore = technicalDepth.aiAnalysis?.qualityScore || problemApproach.aiAnalysis?.qualityScore;
              const overallCoverage = coverage.overall;

              score = qualityScore || row.skillDetails?.[0]?.confidenceScore || row?.overallScore || overallCoverage || null;
            } else {
              const metadata = row.metadata || {};
              const interviewData = row.interviewData || {};
              const finalReport = interviewData.finalReport || {};
              const coverage = finalReport.coverage || {};

              const overallCoverage = coverage.overall !== undefined ? coverage.overall : null;
              score = overallCoverage !== null ? overallCoverage : typeof row?.overallScore === 'number' ? Math.max(0, Math.min(100, row.overallScore)) : null;
            }

            const { level, color } = getInterviewLevel(score, type);

            return <InterviewCard key={row._id || row.id} row={row} type={type} level={level} color={color} score={score} />;
          })
        )}
      </Box>
    </Box>
  );
};

export default React.memo(InterviewGridView);
