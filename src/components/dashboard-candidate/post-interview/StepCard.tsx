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
            width: 60,
            height: 60,
            borderRadius: '16px',
            background:
              step.status === 'done'
                ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)'
                : step.status === 'inProgress'
                ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)'
                : 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            border: '4px solid white',
            boxShadow:
              step.status === 'done'
                ? '0 4px 16px rgba(76, 175, 80, 0.4)'
                : step.status === 'inProgress'
                ? '0 4px 16px rgba(255, 152, 0, 0.4)'
                : '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 3,
            position: 'relative',
            transition: 'all 0.3s ease',
          }}
        >
          {step.status === 'done' ? (
            <CheckCircleOutlineIcon sx={{ fontSize: 32 }} />
          ) : (
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {index + 1}
            </Typography>
          )}
        </Box>

        {/* Step Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border:
                step.status === 'done'
                  ? '3px solid transparent'
                  : step.status === 'inProgress'
                  ? '3px solid transparent'
                  : '2px solid #e9ecef',
              background:
                step.status === 'done'
                  ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #4caf50 0%, #45a049 100%) border-box'
                  : step.status === 'inProgress'
                  ? 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #ff9800 0%, #f57c00 100%) border-box'
                  : '#ffffff',
              backgroundColor:
                step.status === 'done'
                  ? 'rgba(76, 175, 80, 0.02)'
                  : step.status === 'inProgress'
                  ? 'rgba(255, 152, 0, 0.02)'
                  : '#ffffff',
              boxShadow:
                step.status === 'done'
                  ? '0 8px 24px rgba(76, 175, 80, 0.2)'
                  : step.status === 'inProgress'
                  ? '0 8px 24px rgba(255, 152, 0, 0.2)'
                  : '0 4px 12px rgba(0,0,0,0.08)',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px) scale(1.01)',
                boxShadow:
                  step.status === 'done'
                    ? '0 12px 32px rgba(76, 175, 80, 0.3)'
                    : step.status === 'inProgress'
                    ? '0 12px 32px rgba(255, 152, 0, 0.3)'
                    : '0 8px 20px rgba(0,0,0,0.15)',
              },
            }}
          >
            {/* Step Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color:
                      step.status === 'done'
                        ? '#2e7d32'
                        : step.status === 'inProgress'
                        ? '#f57c00'
                        : '#333',
                    mb: 0.5,
                  }}
                >
                  {step.stepId?.data?.label || `Step ${index + 1}`}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {step.stepId?.data?.type || 'Unknown Type'}
                </Typography>
                {submittedLink && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    <strong>Submitted link: </strong>
                    <a href={submittedLink} target="_blank" rel="noreferrer" style={{ color: '#1a73e8' }}>
                      {submittedLink}
                    </a>
                  </Typography>
                )}
              </Box>

              {/* Status Badge */}
              <Chip
                label={
                  step.status === 'done' ? '✓ Completed' : step.status === 'inProgress' ? '⟳ In Progress' : '⏱ Pending'
                }
                size="medium"
                sx={{
                  background:
                    step.status === 'done'
                      ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(69, 160, 73, 0.2))'
                      : step.status === 'inProgress'
                      ? 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(245, 124, 0, 0.2))'
                      : 'linear-gradient(135deg, rgba(158, 158, 158, 0.12), rgba(117, 117, 117, 0.15))',
                  backdropFilter: 'blur(10px)',
                  color:
                    step.status === 'done' ? '#2e7d32' : step.status === 'inProgress' ? '#f57c00' : '#757575',
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  px: 2,
                  py: 2.5,
                  fontSize: '0.85rem',
                  border:
                    step.status === 'done'
                      ? '2px solid rgba(76, 175, 80, 0.3)'
                      : step.status === 'inProgress'
                      ? '2px solid rgba(255, 152, 0, 0.3)'
                      : '2px solid rgba(158, 158, 158, 0.2)',
                  boxShadow:
                    step.status === 'done'
                      ? '0 4px 12px rgba(76, 175, 80, 0.2)'
                      : step.status === 'inProgress'
                      ? '0 4px 12px rgba(255, 152, 0, 0.2)'
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                }}
              />
            </Box>

            {/* Progress Bar */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: '#333',
                    fontSize: '0.9rem',
                  }}
                >
                  Progress
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color:
                      step.status === 'done' ? '#2e7d32' : step.status === 'inProgress' ? '#f57c00' : '#757575',
                    fontSize: '0.9rem',
                  }}
                >
                  {step.status === 'done' ? '100%' : step.status === 'inProgress' ? '50%' : '0%'}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={step.status === 'done' ? 100 : step.status === 'inProgress' ? 50 : 0}
                sx={{
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#f5f5f5',
                  '& .MuiLinearProgress-bar': {
                    background:
                      step.status === 'done'
                        ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 50%, #4caf50 100%)'
                        : step.status === 'inProgress'
                        ? 'linear-gradient(90deg, #ff9800 0%, #ffa726 50%, #ff9800 100%)'
                        : 'linear-gradient(90deg, #9e9e9e 0%, #bdbdbd 100%)',
                    borderRadius: 6,
                    transition: 'width 0.6s ease, background 0.3s ease',
                    boxShadow:
                      step.status === 'done'
                        ? '0 2px 8px rgba(76, 175, 80, 0.4)'
                        : step.status === 'inProgress'
                        ? '0 2px 8px rgba(255, 152, 0, 0.4)'
                        : 'none',
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
