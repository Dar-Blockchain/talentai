import { Box, Button, Divider, CircularProgress } from '@mui/material';
import React from 'react';

interface RegistrationNavigationProps {
  activeStep: number;
  steps: string[];
  handleBack: () => void;
  handleNext: () => void;
  handleStepSubmit: () => void;
  loading?: boolean;
}

const RegistrationNavigation: React.FC<RegistrationNavigationProps> = ({
  activeStep,
  steps,
  handleBack,
  handleNext,
  handleStepSubmit,
  loading = false,
}) => (
  <>
    <Divider sx={{ mt: 3, mb: 2, borderColor: '#D1C4E9' }} />
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
      <Button
        disabled={activeStep === 0}
        onClick={handleBack}
        size="medium"
        sx={{
          minWidth: 100,
          fontWeight: 700,
          color: '#7C4DFF',
          border: '1.5px solid #7C4DFF',
          bgcolor: '#fff',
          fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
          borderRadius: 2,
          boxShadow: '0 1px 4px #7C4DFF11',
          transition: 'all 0.2s',
          '&:hover': { bgcolor: '#F3E5F5', transform: 'scale(1.05)' },
        }}
      >
        Back
      </Button>
      {activeStep < steps.length - 1 ? (
        <Button
          variant="contained"
          onClick={handleNext}
          size="medium"
          sx={{
            minWidth: 100,
            fontWeight: 700,
            bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
            color: '#fff',
            fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
            borderRadius: 2,
            boxShadow: '0 2px 8px #7C4DFF22',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
              transform: 'scale(1.08)',
              boxShadow: '0 4px 16px #E040FB33',
            },
          }}
        >
          Next
        </Button>
      ) : (
        <Button
          variant="contained"
          onClick={handleStepSubmit}
          size="medium"
          disabled={loading}
          sx={{
            minWidth: 100,
            fontWeight: 700,
            bgcolor: 'linear-gradient(90deg, #E040FB 0%, #7C4DFF 100%)',
            color: '#fff',
            fontFamily: 'Quicksand, Arial Rounded MT Bold, Arial, sans-serif',
            borderRadius: 2,
            boxShadow: '0 2px 8px #7C4DFF22',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'linear-gradient(90deg, #7C4DFF 0%, #E040FB 100%)',
              transform: 'scale(1.08)',
              boxShadow: '0 4px 16px #E040FB33',
            },
          }}
        >
          {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Register'}
        </Button>
      )}
    </Box>
  </>
);

export default RegistrationNavigation; 