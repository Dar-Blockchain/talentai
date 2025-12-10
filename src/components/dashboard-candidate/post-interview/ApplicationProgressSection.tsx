import React from 'react';
import { Box, Typography, Chip, Alert, Button, LinearProgress } from '@mui/material';
import { Assignment as AssignmentIcon, Add as AddIcon } from '@mui/icons-material';
import { CandidateProgress } from '../../../types/postInterview';
import ProgressAccordionItem from './ProgressAccordionItem';

interface ApplicationProgressSectionProps {
  candidateProgress: CandidateProgress[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onSendTask: (progress: CandidateProgress, step: any) => void;
  onSubmitTask: (stepNodeId: string) => void;
  onNavigate: (path: string) => void;
  sendingTask: string | null;
  submittingTask: string | null;
  submissionLinks: Record<string, string>;
  onUpdateLink: (stepNodeId: string, link: string) => void;
}

const ApplicationProgressSection: React.FC<ApplicationProgressSectionProps> = ({
  candidateProgress,
  loading,
  error,
  onRefresh,
  onSendTask,
  onSubmitTask,
  onNavigate,
  sendingTask,
  submittingTask,
  submissionLinks,
  onUpdateLink,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5, letterSpacing: '-0.01em' }}>
            My Application Progress
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Track your ongoing applications and interview steps
          </Typography>
        </Box>
        <Chip
          label={`${candidateProgress.length} Active`}
          sx={{
            backgroundColor: '#4facfe20',
            color: '#4facfe',
            fontWeight: 600,
            fontSize: '0.9rem',
            px: 2,
            py: 2.5,
          }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Box sx={{ width: '100%', maxWidth: 400 }}>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Loading your progress data...
            </Typography>
          </Box>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
          <Button size="small" onClick={onRefresh} sx={{ ml: 2 }}>
            Retry
          </Button>
        </Alert>
      ) : candidateProgress.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 4,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px dashed #dee2e6',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No Progress Data Available
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Your application progress will appear here once you start applying to positions.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onNavigate('/candidate/dashboard')}
            sx={{
              backgroundColor: '#02E2FF',
              color: 'white',
              '&:hover': {
                backgroundColor: '#02C2E0',
              },
            }}
          >
            Browse Jobs
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {candidateProgress.map((progress) => (
            <ProgressAccordionItem
              key={progress._id}
              progress={progress}
              onSendTask={onSendTask}
              onSubmitTask={onSubmitTask}
              onNavigate={onNavigate}
              onRefresh={onRefresh}
              sendingTask={sendingTask}
              submittingTask={submittingTask}
              submissionLinks={submissionLinks}
              onUpdateLink={onUpdateLink}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default React.memo(ApplicationProgressSection);
