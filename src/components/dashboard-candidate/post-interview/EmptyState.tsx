import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Assignment as AssignmentIcon, Assessment as AssessmentIcon } from '@mui/icons-material';

interface EmptyStateProps {
  type: 'no-data' | 'no-progress';
  onAction?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
  const isNoProgress = type === 'no-progress';

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 4,
        backgroundColor: '#f8f9fa',
        borderRadius: 2,
        border: '1px dashed #dee2e6',
      }}
    >
      {isNoProgress ? (
        <AssignmentIcon sx={{ fontSize: 48, color: '#dee2e6', mb: 2 }} />
      ) : (
        <AssessmentIcon sx={{ fontSize: 64, color: '#dee2e6', mb: 2 }} />
      )}
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {isNoProgress ? 'No Progress Data Available' : 'No Data Available'}
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        {isNoProgress
          ? 'Your application progress will appear here once you start applying to positions.'
          : 'No interview data or application progress available yet.'}
      </Typography>
      {isNoProgress && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
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
      )}
    </Box>
  );
};

export default React.memo(EmptyState);
