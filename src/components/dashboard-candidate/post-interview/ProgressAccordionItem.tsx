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
      // Navigate to pipeline interview with jobId and stepNumber
      const stepId = nextStep?.stepId || progress.currentStep;
      const stepNumber = stepId?.nodeNumber || 1;
      const jobId = progress.idPost?._id;

      // Use pipeline interview URL format
      onNavigate(`/interview/hr?jobId=${jobId}&stepNumber=${stepNumber}&source=pipeline`);
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
        borderRadius: 4,
        border: '2px solid #f0f0f0',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        background: '#ffffff',
        '&:before': { display: 'none' },
        '&.Mui-expanded': {
          margin: 0,
          boxShadow: '0 24px 48px rgba(102, 126, 234, 0.2)',
          border: '2px solid #667eea',
        },
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          boxShadow: '0 12px 32px rgba(0,0,0,0.1)',
          transform: 'translateY(-6px)',
        },
      }}
    >
      <AccordionSummary
       
        sx={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
          borderBottom: '1px solid #f0f0f0',
          minHeight: 100,
          px: 4,
          py: 2,
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          },
          '&.Mui-expanded': {
            borderBottom: '2px solid #667eea',
            minHeight: 100,
          },
          transition: 'all 0.3s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            width: '100%',
          }}
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1a1a1a', mb: 1, letterSpacing: '-0.02em' }}>
              {progress.idPost?.jobDetails?.title || 'Unknown Position'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {progress.idPost?.jobDetails?.location || 'Location not specified'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box
                  sx={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                />
                <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 600 }}>
                  {progress.idPost?.jobDetails?.employmentType || 'Employment type not specified'}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08))',
              border: '2px solid rgba(102, 126, 234, 0.15)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#667eea', fontWeight: 800, fontSize: '0.95rem' }}>
              {progressPercentage}% Complete
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: 4 }}>
          {/* Progress Bar */}
          <Box
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)',
              border: '2px solid #f5f5f5',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '0.95rem' }}>
                Overall Progress
              </Typography>
              <Box
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'white', fontSize: '0.85rem' }}>
                  {progress.steps?.filter((step) => step.status === 'done').length || 0} /{' '}
                  {progress.steps?.length || 0} Steps
                </Typography>
              </Box>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 14,
                borderRadius: 7,
                backgroundColor: '#f5f5f5',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 7,
                  background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.4)',
                  transition: 'transform 0.4s ease',
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
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              mt: 4,
              gap: 2,
              pt: 3,
              borderTop: '2px solid #f5f5f5',
            }}
          >
            <Button
              variant="outlined"
              onClick={onRefresh}
              sx={{
                border: '2px solid transparent',
                background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
                color: '#667eea',
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08)) padding-box, linear-gradient(135deg, #667eea 0%, #764ba2 100%) border-box',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(102, 126, 234, 0.2)',
                },
              }}
            >
              Refresh Status
            </Button>

            <Button
              variant="contained"
              startIcon={isTask ? <EmailIcon sx={{ fontSize: 22 }} /> : <AssignmentIcon sx={{ fontSize: 22 }} />}
              disabled={allCompleted || isSending}
              onClick={handleActionClick}
              sx={{
                background: allCompleted ? 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontSize: '0.95rem',
                boxShadow: allCompleted ? '0 4px 16px rgba(76, 175, 80, 0.4)' : '0 4px 16px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: allCompleted ? '0 8px 24px rgba(76, 175, 80, 0.5)' : '0 8px 24px rgba(102, 126, 234, 0.5)',
                },
                '&.Mui-disabled': {
                  background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                  color: '#9e9e9e',
                  boxShadow: 'none',
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
