import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';

// ─── Full-screen spinner ───────────────────────────────────────────────────────

export const InterviewSpinner: React.FC = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <CircularProgress sx={{ color: '#0D9488' }} />
  </Box>
);

// ─── Campaign error / not found ───────────────────────────────────────────────

interface ErrorProps {
  message?: string | null;
  onBack: () => void;
}

export const InterviewErrorState: React.FC<ErrorProps> = ({ message, onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center' }}>
      <WarningAmberOutlined sx={{ fontSize: 52, color: '#EF4444', mb: 2 }} />
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#0F172A', mb: 1 }}>
        Campaign not found
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#64748B', mb: 3 }}>
        {message}
      </Typography>
      <Button
        variant="contained"
        onClick={onBack}
        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#0D9488', '&:hover': { bgcolor: '#0b7a6e' } }}
      >
        Back to Campaign
      </Button>
    </Box>
  </Box>
);
