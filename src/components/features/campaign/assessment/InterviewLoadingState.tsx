import React from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import AccessTimeOutlined   from '@mui/icons-material/AccessTimeOutlined';
import PauseCircleOutlined  from '@mui/icons-material/PauseCircleOutlined';
import StopCircleOutlined   from '@mui/icons-material/StopCircleOutlined';

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

// ─── Expired campaign ─────────────────────────────────────────────────────────

export const InterviewExpiredState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center', maxWidth: 380, px: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#FEF2F2', border: '2px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
        <AccessTimeOutlined sx={{ fontSize: 34, color: '#EF4444' }} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A', mb: 1 }}>
        Deadline Passed
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#64748B', mb: 3, lineHeight: 1.6 }}>
        The deadline for this campaign has passed. You can no longer start or continue this assessment.
      </Typography>
      <Button
        variant="contained"
        onClick={onBack}
        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
      >
        Back to Campaign
      </Button>
    </Box>
  </Box>
);

// ─── Paused campaign ──────────────────────────────────────────────────────────

export const InterviewPausedState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center', maxWidth: 380, px: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#FFFBEB', border: '2px solid #FDE68A', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
        <PauseCircleOutlined sx={{ fontSize: 34, color: '#D97706' }} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A', mb: 1 }}>
        Campaign Paused
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#64748B', mb: 3, lineHeight: 1.6 }}>
        This campaign is currently paused. You won't be able to start or continue your assessment until it's resumed.
      </Typography>
      <Button
        variant="contained"
        onClick={onBack}
        disableElevation
        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#D97706', '&:hover': { bgcolor: '#B45309' } }}
      >
        Back to Campaign
      </Button>
    </Box>
  </Box>
);

// ─── Closed campaign ──────────────────────────────────────────────────────────

export const InterviewClosedState: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <Box sx={{ textAlign: 'center', maxWidth: 380, px: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: '#EFF6FF', border: '2px solid #BFDBFE', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
        <StopCircleOutlined sx={{ fontSize: 34, color: '#2563EB' }} />
      </Box>
      <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#0F172A', mb: 1 }}>
        Campaign Closed
      </Typography>
      <Typography sx={{ fontSize: 13, color: '#64748B', mb: 3, lineHeight: 1.6 }}>
        This campaign has been closed and is no longer accepting responses.
      </Typography>
      <Button
        variant="contained"
        onClick={onBack}
        disableElevation
        sx={{ textTransform: 'none', borderRadius: 2, bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' } }}
      >
        Back to Campaign
      </Button>
    </Box>
  </Box>
);

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
