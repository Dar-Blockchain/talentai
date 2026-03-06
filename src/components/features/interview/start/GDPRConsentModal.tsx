import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const PURPLE = '#8310FF';
const PURPLE_LIGHT = 'rgba(244,235,255,1)';
const PURPLE_BORDER = 'rgba(189,133,255,0.3)';

interface GDPRConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const dataPoints = [
  {
    icon: <VideocamOutlinedIcon sx={{ fontSize: 17, color: PURPLE }} />,
    label: 'Camera',
    text: 'Video stream used locally for this session only — never stored.',
  },
  {
    icon: <MicNoneOutlinedIcon sx={{ fontSize: 17, color: PURPLE }} />,
    label: 'Microphone',
    text: 'Audio transcribed in real-time. Only text transcripts are kept.',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 17, color: PURPLE }} />,
    label: 'Legal basis',
    text: 'Processed under GDPR Art. 6(1)(a) — your explicit consent.',
  },
  {
    icon: <DeleteOutlineIcon sx={{ fontSize: 17, color: PURPLE }} />,
    label: 'Retention',
    text: 'Raw media deleted immediately after the session ends.',
  },
];

const rights = [
  'Withdraw consent at any time by leaving the page',
  'Access, rectify or erase your data on request',
  'Data portability upon request',
];

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
          borderRadius: '24px',
          border: '1px solid #e8e2f5',
          boxShadow: '0 32px 80px rgba(131,16,255,0.18)',
          overflow: 'hidden',
          outline: 'none',
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
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
              Privacy & Data Consent
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: 'rgba(255,255,255,0.75)', mt: 0.2 }}>
              GDPR compliant · Required before camera activation
            </Typography>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 3.5, pt: 2.5, pb: 2.5 }}>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.83rem', color: '#374151', lineHeight: 1.7, mb: 2.5 }}>
            TalentAI needs access to your <strong style={{ color: '#111827' }}>camera</strong> and{' '}
            <strong style={{ color: '#111827' }}>microphone</strong> to conduct the interview. Here is exactly what we collect:
          </Typography>

          {/* Data points — 2×2 grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 2.5 }}>
            {dataPoints.map(({ icon, label, text }, i) => (
              <Box
                key={i}
                sx={{
                  p: 1.75,
                  borderRadius: '12px',
                  bgcolor: PURPLE_LIGHT,
                  border: `1px solid ${PURPLE_BORDER}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.75,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 28, height: 28, borderRadius: '8px',
                      bgcolor: '#fff',
                      border: `1px solid ${PURPLE_BORDER}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: '#111827' }}>
                    {label}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.55 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Rights */}
          <Box
            sx={{
              bgcolor: 'rgba(250,246,255,1)',
              border: '1px solid rgba(189,133,255,0.2)',
              borderRadius: '12px',
              px: 2,
              py: 1.5,
              mb: 2.5,
            }}
          >
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: '#374151', mb: 1 }}>
              Your GDPR rights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {rights.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 13, color: PURPLE, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#6b7280' }}>{r}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.69rem', color: '#9ca3af', lineHeight: 1.55, mb: 0.5 }}>
            By clicking <strong>"Accept & Continue"</strong> you provide explicit consent under GDPR Art. 7.
            You may withdraw at any time by leaving this page.
          </Typography>
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
              background: 'linear-gradient(135deg, #8310FF 0%, #a855f7 100%)',
              boxShadow: '0 4px 16px rgba(131,16,255,0.35)',
              px: 3,
              py: 1,
              '&:hover': {
                background: 'linear-gradient(135deg, #6d0ee0 0%, #9333ea 100%)',
                boxShadow: '0 6px 20px rgba(131,16,255,0.45)',
              },
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
