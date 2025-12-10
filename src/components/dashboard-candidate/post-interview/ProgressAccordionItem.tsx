import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Button,
  LinearProgress,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Email as EmailIcon, Assignment as AssignmentIcon } from '@mui/icons-material';
import { CandidateProgress } from '../../../types/postInterview';
import {
  calculateProgressPercentage,
  getNextStep,
  isTaskStep,
  areAllStepsCompleted,
} from '../../../utils/postInterviewHelpers';
import StepTimeline from './StepTimeline';

interface ProgressAccordionItemProps {
  progress: CandidateProgress;
  onSendTask: (progress: CandidateProgress, step: any) => void;
  onSubmitTask: (stepNodeId: string) => void;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  sendingTask: string | null;
  submittingTask: string | null;
  submissionLinks: Record<string, string>;
  onUpdateLink: (stepNodeId: string, link: string) => void;
}

const ProgressAccordionItem: React.FC<ProgressAccordionItemProps> = ({
  progress,
  onSendTask,
  onSubmitTask,
  onNavigate,
  onRefresh,
  sendingTask,
  submittingTask,
  submissionLinks,
  onUpdateLink,
}) => {
  const progressPercentage = calculateProgressPercentage(progress.steps);
  const nextStep = getNextStep(progress.steps);
  const isTask = isTaskStep(nextStep);
  const allCompleted = areAllStepsCompleted(progress.steps);
  const currentTaskId = `${progress._id}-${progress.currentStep?._id}`;
  const isSending = sendingTask === currentTaskId;

  const handleActionClick = () => {
    if (isTask) {
      onSendTask(progress, nextStep || progress.currentStep);
    } else {
      const stepId = nextStep?.stepId._id || progress.currentStep._id;
      onNavigate(`/posts/${progress.idPost?._id}/interview?stepId=${stepId}`);
    }
  };

  const getButtonLabel = () => {
    if (isSending) return 'Sending Coding Project...';
    if (allCompleted) return 'Application Completed ✅';
    if (isTask) {
      const label = nextStep?.stepId?.data?.label || 'Task';
      return `Send Coding Project: ${label}`;
    }
    const label = nextStep?.stepId?.data?.label || 'Step';
    return `Continue: ${label}`;
  };

  return (
    <Accordion
      sx={{
        borderRadius: 3,
        border: '2px solid #e9ecef',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: '8px 0',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: '#667eea' }} />}
        sx={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
          borderBottom: '1px solid #e9ecef',
          minHeight: 80,
          '&:hover': {
            background: 'linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%)',
          },
          '&.Mui-expanded': {
            borderBottom: '2px solid #667eea',
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
              {progress.idPost?.jobDetails?.title || 'Unknown Position'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {progress.idPost?.jobDetails?.location || 'Location not specified'} •{' '}
              {progress.idPost?.jobDetails?.employmentType || 'Employment type not specified'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Progress Indicator */}
            <Box
              sx={{
                width: 70,
                height: 70,
                borderRadius: '50%',
                border: '4px solid #e9ecef',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#667eea', fontSize: '0.95rem' }}>
                {progressPercentage}%
              </Typography>
              <Box
                sx={{
                  position: 'absolute',
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: '50%',
                  background: `conic-gradient(from 0deg, #667eea 0deg, #4facfe ${progressPercentage * 3.6}deg, #e9ecef ${progressPercentage * 3.6}deg)`,
                  mask: 'radial-gradient(transparent 60%, black 60%)',
                  WebkitMask: 'radial-gradient(transparent 60%, black 60%)',
                }}
              />
            </Box>
            <Chip
              label={progress.currentStep?.data?.type || 'Unknown'}
              size="small"
              sx={{
                backgroundColor: '#8310FF20',
                color: '#8310FF',
                fontWeight: 500,
              }}
            />
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 2 }}>
          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Overall Progress
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ fontWeight: 500 }}>
                {progress.steps?.filter((step) => step.status === 'done').length || 0} /{' '}
                {progress.steps?.length || 0} completed
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: '#e9ecef',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#02E2FF',
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #02E2FF 0%, #00B8D4 100%)',
                },
              }}
            />
          </Box>

          {/* Steps Timeline */}
          {progress.steps && progress.steps.length > 0 && (
            <StepTimeline
              steps={progress.steps}
              onSubmitTask={onSubmitTask}
              submittingTask={submittingTask}
              submissionLinks={submissionLinks}
              onUpdateLink={onUpdateLink}
            />
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onRefresh}
              sx={{
                borderColor: '#02E2FF',
                color: '#02E2FF',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: '#02C2E0',
                  backgroundColor: '#02E2FF10',
                },
              }}
            >
              Refresh Status
            </Button>

            <Button
              variant="contained"
              size="small"
              startIcon={isTask ? <EmailIcon /> : <AssignmentIcon />}
              disabled={allCompleted || isSending}
              onClick={handleActionClick}
              sx={{
                backgroundColor: '#02E2FF',
                color: 'white',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: '#02C2E0',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#9e9e9e',
                },
              }}
            >
              {getButtonLabel()}
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default React.memo(ProgressAccordionItem);
