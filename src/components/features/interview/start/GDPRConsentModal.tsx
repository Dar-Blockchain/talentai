import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PURPLE = '#8310FF';

interface GDPRConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const GDPRConsentModal: React.FC<GDPRConsentModalProps> = ({ open, onAccept, onDecline }) => {
  return (
    <Modal open={open} disableEscapeKeyDown>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '94vw', sm: 560 },
          bgcolor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e8e2f5',
          boxShadow: '0 24px 64px rgba(0,0,0,0.12)',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            bgcolor: PURPLE,
            px: 3.5, pt: 2.5, pb: 2.5,
            display: 'flex', alignItems: 'center', gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 44, height: 44, borderRadius: '12px',
              bgcolor: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <LockOutlinedIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.05rem', color: '#fff', lineHeight: 1.25 }}>
              Your privacy is protected.
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: 'rgba(255,255,255,0.78)', mt: 0.25 }}>
              Your integrity matters.
            </Typography>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 3.5, pt: 2.5, pb: 2 }}>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.83rem', color: '#374151', lineHeight: 1.75, mb: 2 }}>
            This interview is conducted by an AI agent that analyzes your responses in real time — including
            verbal and non-verbal communication — to assess your fit for this position.
          </Typography>

          {/* Info items */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2.25 }}>
            {[
              'Your session data (video, audio, and transcript) is securely stored for the duration of the active recruitment campaign only. It is accessible exclusively to the hiring team and will be permanently deleted once the job post is closed.',
              'TalentAI does not share, sell, or transfer your personal data to any third party. All data is processed in compliance with GDPR and applicable data protection regulations.',
            ].map((text, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE, flexShrink: 0, mt: '2px' }} />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.65 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Confirmation notice */}
          <Box
            sx={{
              bgcolor: 'rgba(131,16,255,0.04)',
              border: '1px solid rgba(131,16,255,0.15)',
              borderRadius: '10px',
              px: 2,
              py: 1.5,
              mb: 2,
            }}
          >
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.76rem', color: '#374151', lineHeight: 1.65 }}>
              By continuing, you confirm that you are the person listed in your application and that your responses are your own.
            </Typography>
          </Box>

        </Box>

        {/* ── Actions ── */}
        <Box
          sx={{
            px: 3.5, py: 2,
            borderTop: '1px solid #f0edf8',
            display: 'flex',
            gap: 1.25,
            justifyContent: 'flex-end',
            bgcolor: '#fafafa',
          }}
        >
          <Button
            variant="outlined"
            onClick={onDecline}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 600,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '10px',
              color: '#6b7280',
              borderColor: '#e5e7eb',
              px: 2.5,
              py: 1,
              '&:hover': { borderColor: '#d1d5db', bgcolor: '#f3f4f6' },
            }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            onClick={onAccept}
            sx={{
              fontFamily: 'Poppins',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'none',
              borderRadius: '10px',
              bgcolor: `${PURPLE} !important`,
              color: '#fff !important',
              boxShadow: 'none',
              px: 3,
              py: 1,
              '&:hover': { bgcolor: '#6d0ee0 !important', boxShadow: 'none' },
            }}
          >
            Accept & Continue
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GDPRConsentModal;
