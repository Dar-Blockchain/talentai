import React from 'react';
import { Box, Typography } from '@mui/material';
import { Step } from '../../../types/postInterview';
import StepCard from './StepCard';

interface StepTimelineProps {
  steps: Step[];
  onSubmitTask: (stepNodeId: string) => void;
  submittingTask: string | null;
  submissionLinks: Record<string, string>;
  onUpdateLink: (stepNodeId: string, link: string) => void;
}

const StepTimeline: React.FC<StepTimelineProps> = ({
  steps,
  onSubmitTask,
  submittingTask,
  submissionLinks,
  onUpdateLink,
}) => {
  const sortedSteps = [...steps].sort(
    (a, b) => (a.stepId?.data?.config?.nodeNumber || 0) - (b.stepId?.data?.config?.nodeNumber || 0)
  );

  return (
    <Box>
      {/* Enhanced Section Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%)',
          border: '2px solid #f0f0f0',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              color: '#1a1a1a',
              mb: 0.5,
              letterSpacing: '-0.01em',
            }}
          >
            Application Steps
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Track your progress through each stage
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            px: 3,
            py: 1.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
            border: '2px solid rgba(102, 126, 234, 0.15)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: '#9e9e9e',
                fontWeight: 600,
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.7rem',
              }}
            >
              Completed
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: '#667eea',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {steps.filter((step) => step.status === 'done').length} / {steps.length}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Steps Timeline */}
      <Box sx={{ position: 'relative' }}>
        {/* Timeline Line */}
        <Box
          sx={{
            position: 'absolute',
            left: 30,
            top: 30,
            bottom: 30,
            width: 3,
            background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 2,
            zIndex: 0,
            opacity: 0.2,
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sortedSteps.map((step, index) => (
            <StepCard
              key={step.stepId?._id || index}
              step={step}
              index={index}
              onSubmitTask={onSubmitTask}
              submittingTask={submittingTask}
              submissionLinks={submissionLinks}
              onUpdateLink={onUpdateLink}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(StepTimeline);
