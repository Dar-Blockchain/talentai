import React from 'react';
import { Box, Card, Typography, Chip, LinearProgress } from '@mui/material';
import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  Schedule as ScheduleIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { Step } from '../../../types/postInterview';
import { getStepNodeKey, formatDateTime } from '../../../utils/postInterviewHelpers';
import TaskSubmissionForm from './TaskSubmissionForm';

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

interface StepCardProps {
  step: Step;
  index: number;
  onSubmitTask: (stepNodeId: string) => void;
  submittingTask: string | null;
  submissionLinks: Record<string, string>;
  onUpdateLink: (stepNodeId: string, link: string) => void;
}

const StepCard: React.FC<StepCardProps> = ({
  step,
  index,
  onSubmitTask,
  submittingTask,
  submissionLinks,
  onUpdateLink,
}) => {
  const nodeKey = getStepNodeKey(step);
  const submittedLink = step.stepId?.data?.subtitle || '';
  const isSubmitted = step.status === 'done' || Boolean(submittedLink);
  const isTaskType = step.stepId?.data?.type?.toLowerCase().includes('task');

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 2,
        animation: `${slideIn} 0.5s ease-out ${index * 0.1}s both`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
        {/* Step Number Circle */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: '1.1rem',
            border: '3px solid white',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.25)',
            zIndex: 3,
            position: 'relative',
            flexShrink: 0,
            transition: 'all 0.3s ease',
          }}
        >
          {step.status === 'done' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 28 }} />
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 900, fontSize: '1.1rem' }}>
              {index + 1}
            </Typography>
          )}
        </Box>

        {/* Step Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card
            sx={{
              p: 4,
              borderRadius: 4,
              border: '2px solid #f0f0f0',
              background: '#ffffff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.12)',
                border: '2px solid #667eea',
                '&::before': {
                  opacity: 1,
                },
              },
            }}
          >
            {/* Step Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 0.5,
                  }}
                >
                  {step.stepId?.data?.label || `Step ${index + 1}`}
                </Typography>
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {step.stepId?.data?.type || 'Unknown Type'}
                </Typography>
                {submittedLink && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Submitted link: </strong>
                    <a href={submittedLink} target="_blank" rel="noreferrer" style={{ color: '#667eea' }}>
                      {submittedLink}
                    </a>
                  </Typography>
                )}
              </Box>

              {/* Status Badge */}
              <Chip
                label={
                  step.status === 'done' ? '✓ Completed' : step.status === 'inProgress' ? 'In Progress' : 'Pending'
                }
                size="small"
                sx={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
                  color: '#667eea',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  px: 2,
                  py: 0.5,
                  height: 28,
                  border: '1.5px solid rgba(102, 126, 234, 0.2)',
                }}
              />
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#6b7280',
                    fontSize: '0.875rem',
                  }}
                >
                  Step Progress
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 800,
                    color: '#667eea',
                    fontSize: '0.875rem',
                  }}
                >
                  {step.status === 'done' ? '100%' : step.status === 'inProgress' ? '50%' : '0%'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={step.status === 'done' ? 100 : step.status === 'inProgress' ? 50 : 0}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 4,
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  },
                }}
              />
            </Box>

            {/* Completion Time */}
            {step.completedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <ScheduleIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Completed: {formatDateTime(step.completedAt)}
                </Typography>
              </Box>
            )}

            {/* Task Submission Form */}
            {isTaskType && (
              <TaskSubmissionForm
                stepNodeId={nodeKey}
                submittedLink={submissionLinks[nodeKey] !== undefined ? submissionLinks[nodeKey] : submittedLink}
                isSubmitted={isSubmitted}
                submittingTask={submittingTask === nodeKey}
                onLinkChange={(link) => onUpdateLink(nodeKey, link)}
                onSubmit={() => onSubmitTask(nodeKey)}
              />
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(StepCard);
