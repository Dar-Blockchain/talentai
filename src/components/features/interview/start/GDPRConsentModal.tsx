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
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '94vw', sm: 540 },
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        outline: 'none',
      }}>

        {/* ── Purple Header ── */}
        <Box sx={{ px: 3, py: 2.5, bgcolor: PURPLE, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            bgcolor: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LockOutlinedIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#fff', lineHeight: 1.25 }}>
              Your privacy is protected.
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: 'rgba(255,255,255,0.82)', mt: 0.2 }}>
              Your integrity matters.
            </Typography>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 3.5, pt: 2.5, pb: 2 }}>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#374151', lineHeight: 1.75, mb: 2 }}>
            This interview is conducted by an AI agent that analyzes your responses in real time — including verbal and non-verbal communication — to assess your fit for this position.
          </Typography>

          {/* Bullet points */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE, flexShrink: 0, mt: '2px' }} />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151', lineHeight: 1.7 }}>
                Your session data (video, audio, and transcript) is securely stored for the duration of the active recruitment campaign only. It is accessible exclusively to the hiring team and will be permanently deleted once the job post is closed.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 16, color: PURPLE, flexShrink: 0, mt: '2px' }} />
              <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#374151', lineHeight: 1.7 }}>
                TalentAI does not share, sell, or transfer your personal data to any third party. All data is processed in compliance with GDPR and applicable data protection regulations.
              </Typography>
            </Box>
          </Box>

          {/* Confirmation box */}
          <Box sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', px: 2.5, py: 1.75 }}>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#4B5563', lineHeight: 1.65 }}>
              By continuing, you confirm that you are the person listed in your application and that your responses are your own.
            </Typography>
          </Box>
        </Box>

        {/* ── Actions ── */}
        <Box sx={{
          px: 3.5, py: 2,
          borderTop: '1px solid #F3F4F6',
          display: 'flex', gap: 1.25, justifyContent: 'flex-end',
        }}>
          <Button
            variant="outlined"
            onClick={onDecline}
            sx={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem',
              textTransform: 'none', borderRadius: '10px',
              color: '#6B7280', borderColor: '#E5E7EB',
              px: 2.5, py: 1,
              '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
            }}
          >
            Decline
          </Button>
          <Button
            variant="contained"
            onClick={onAccept}
            sx={{
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem',
              textTransform: 'none', borderRadius: '10px',
              bgcolor: `${PURPLE} !important`,
              color: '#fff !important',
              boxShadow: 'none',
              px: 3, py: 1,
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
