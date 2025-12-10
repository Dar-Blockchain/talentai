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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: 'white',
              mb: 0.5,
              textShadow: '0 2px 8px rgba(0,0,0,0.15)',
              letterSpacing: '-0.01em',
            }}
          >
            Application Steps
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
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
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            px: 3,
            py: 2,
            borderRadius: 3,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)',
            }}
          >
            {steps.filter((step) => step.status === 'done').length}
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
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
                color: 'white',
                fontWeight: 700,
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
            left: 28,
            top: 0,
            bottom: 0,
            width: 4,
            background: 'linear-gradient(180deg, #667eea 0%, #4facfe 50%, #00f2fe 100%)',
            borderRadius: 2,
            zIndex: 1,
            opacity: 0.6,
            boxShadow: '0 0 10px rgba(102, 126, 234, 0.3)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 26,
            top: 0,
            bottom: 0,
            width: 8,
            backgroundColor: '#f5f5f5',
            borderRadius: 4,
            zIndex: 0,
          }}
        />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
