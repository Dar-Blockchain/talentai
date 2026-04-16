import React from 'react';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';

interface TaskSubmissionFormProps {
  stepNodeId: string;
  submittedLink: string;
  isSubmitted: boolean;
  submittingTask: boolean;
  onLinkChange: (link: string) => void;
  onSubmit: () => void;
}

const TaskSubmissionForm: React.FC<TaskSubmissionFormProps> = ({
  stepNodeId,
  submittedLink,
  isSubmitted,
  submittingTask,
  onLinkChange,
  onSubmit,
}) => {
  return (
    <Box sx={{ mt: 2, p: 2, backgroundColor: '#f8f9ff', borderRadius: 2, border: '1px solid #c5d1ff' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#1a237e' }}>
        Submit your task (GitHub Repository URL)
      </Typography>

      {isSubmitted && (
        <Alert severity="success" sx={{ mb: 1 }}>
          You have already submitted your Git repository link.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          size="small"
          fullWidth
          placeholder="https://github.com/username/repository"
          value={submittedLink}
          onChange={(e) => onLinkChange(e.target.value)}
          disabled={isSubmitted}
        />
        <Button
          variant="contained"
          disabled={isSubmitted || submittingTask || !submittedLink.trim()}
          onClick={onSubmit}
          sx={{ textTransform: 'none' }}
        >
          {submittingTask ? 'Submitting...' : 'Submit Task'}
        </Button>
      </Box>

      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
        Provide the link to your public repository. Ensure the README includes setup and run instructions.
      </Typography>

      {isSubmitted && (
        <Typography variant="body2" sx={{ mt: 1, color: '#2e7d32', fontWeight: 500 }}>
          You have already submitted your Git repository link.
        </Typography>
      )}
    </Box>
  );
};

export default React.memo(TaskSubmissionForm);
