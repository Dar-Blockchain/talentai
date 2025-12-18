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
    <Box sx={{ mb: 5 }}>
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
            py: 8,
            backgroundColor: '#f8f9fa',
            borderRadius: 4,
            border: '2px dashed #e0e0e0',
          }}
        >
          <AssignmentIcon sx={{ fontSize: 64, color: '#dee2e6', mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
            No Progress Data Available
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Your application progress will appear here once you start applying to positions.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onNavigate('/candidate/dashboard')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              fontWeight: 700,
              borderRadius: 2,
              textTransform: 'none',
              px: 4,
              py: 1.5,
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.5)',
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
