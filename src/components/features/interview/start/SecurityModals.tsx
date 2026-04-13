import React from 'react';
import {
  Dialog, DialogContent, Box, Typography, Button, LinearProgress,
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import GppBadRoundedIcon from '@mui/icons-material/GppBadRounded';

const MAX_WARNINGS = 2;

interface SecurityModalsProps {
  showFirstViolationModal: boolean;
  showSecurityModal: boolean;
  violationType: string;
  securityViolationCount: number;
  onDismissFirst: () => void;
  onDismissSecond: () => void;
  onReturnToDashboard: () => void;
}

const SecurityModals: React.FC<SecurityModalsProps> = ({
  showFirstViolationModal,
  showSecurityModal,
  violationType,
  securityViolationCount,
  onDismissFirst,
  onReturnToDashboard,
}) => {
  const warningsLeft = MAX_WARNINGS - securityViolationCount + 1;

  return (
    <>
      {/* ── Warning modal (1st & 2nd violation) ── */}
      <Dialog
        open={showFirstViolationModal}
        onClose={onDismissFirst}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        {/* Orange top accent */}
        <Box sx={{ height: 4, bgcolor: '#F59E0B' }} />

        <DialogContent sx={{ px: 3.5, pt: 3.5, pb: 3 }}>
          {/* Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(245,158,11,0.1)', border: '2px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 32, color: '#F59E0B' }} />
            </Box>
          </Box>

          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', textAlign: 'center', mb: 0.75 }}>
            Security Warning
          </Typography>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#4B5563', textAlign: 'center', lineHeight: 1.7, mb: 2.5 }}>
            <strong style={{ color: '#D97706' }}>{violationType || 'A restricted action'}</strong> was detected.
            This interview is monitored. Please stay focused and keep this window active.
          </Typography>

          {/* Warning counter bar */}
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#6B7280' }}>Violations</Typography>
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 700, color: securityViolationCount >= MAX_WARNINGS ? '#EF4444' : '#D97706' }}>
                {securityViolationCount} / {MAX_WARNINGS + 1} — {warningsLeft > 0 ? `${warningsLeft} warning${warningsLeft > 1 ? 's' : ''} left` : 'Next violation ends the interview'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(securityViolationCount / (MAX_WARNINGS + 1)) * 100}
              sx={{
                height: 6, borderRadius: 3, bgcolor: '#FEF3C7',
                '& .MuiLinearProgress-bar': { bgcolor: securityViolationCount >= MAX_WARNINGS ? '#EF4444' : '#F59E0B', borderRadius: 3 },
              }}
            />
          </Box>

          {/* Prohibited actions reminder */}
          <Box sx={{ bgcolor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px', p: 1.5, mb: 2.5 }}>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', fontWeight: 700, color: '#92400E', mb: 0.75 }}>
              Prohibited during the interview:
            </Typography>
            {[
              'Copy, cut, or paste any text',
              'Switching tabs or applications',
              'Right-clicking the page',
              'Taking screenshots',
              'Opening developer tools',
            ].map((rule) => (
              <Typography key={rule} sx={{ fontFamily: 'Poppins', fontSize: '0.71rem', color: '#78350F', lineHeight: 1.7 }}>
                · {rule}
              </Typography>
            ))}
          </Box>

          <Button
            fullWidth
            variant="contained"
            onClick={onDismissFirst}
            sx={{ bgcolor: '#F59E0B', color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', textTransform: 'none', borderRadius: '10px', py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#D97706', boxShadow: 'none' } }}
          >
            I Understand — Continue Interview
          </Button>
        </DialogContent>
      </Dialog>

      {/* ── Termination modal (3rd violation) ── */}
      <Dialog
        open={showSecurityModal}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden' } }}
      >
        {/* Red top accent */}
        <Box sx={{ height: 4, bgcolor: '#EF4444' }} />

        <DialogContent sx={{ px: 3.5, pt: 3.5, pb: 3 }}>
          {/* Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2.5 }}>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#FEF2F2', border: '2px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GppBadRoundedIcon sx={{ fontSize: 32, color: '#EF4444' }} />
            </Box>
          </Box>

          <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#111827', textAlign: 'center', mb: 0.75 }}>
            Interview Terminated
          </Typography>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#4B5563', textAlign: 'center', lineHeight: 1.7, mb: 3 }}>
            Multiple security violations were detected. The interview has been automatically terminated and the hiring team has been notified.
          </Typography>

          <Button
            fullWidth
            variant="contained"
            onClick={onReturnToDashboard}
            sx={{ bgcolor: '#EF4444', color: '#fff', fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.88rem', textTransform: 'none', borderRadius: '10px', py: 1.2, boxShadow: 'none', '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' } }}
          >
            Return to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityModals;
