import React from 'react';
import { Box, Typography, Button, Modal } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MicNoneOutlinedIcon from '@mui/icons-material/MicNoneOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

const PURPLE = '#8310FF';

const dataPoints = [
  {
    icon: <VideocamOutlinedIcon sx={{ fontSize: 15, color: '#374151' }} />,
    label: 'Video',
    text: 'Your camera feed is recorded during the session for analysis.',
  },
  {
    icon: <MicNoneOutlinedIcon sx={{ fontSize: 15, color: '#374151' }} />,
    label: 'Audio',
    text: 'Your voice is captured and transcribed in real time.',
  },
  {
    icon: <ArticleOutlinedIcon sx={{ fontSize: 15, color: '#374151' }} />,
    label: 'Transcript',
    text: 'A text transcript of your answers is generated automatically.',
  },
  {
    icon: <SecurityOutlinedIcon sx={{ fontSize: 15, color: '#374151' }} />,
    label: 'Secure Storage',
    text: 'Data is stored only for the active campaign and then permanently deleted.',
  },
];

const rights = [
  'Right to access your personal data at any time',
  'Right to request deletion after the campaign ends',
  'Data is never sold or shared with third parties',
  'Processed in full compliance with GDPR regulations',
];

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
        width: { xs: '94vw', sm: 560 },
        bgcolor: '#fff',
        borderRadius: '16px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
        overflow: 'hidden',
        outline: 'none',
      }}>

        {/* ── Header ── */}
        <Box sx={{ px: 3.5, py: 2.5, borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{
            width: 40, height: 40, borderRadius: '10px',
            bgcolor: '#F3F4F6', border: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <LockOutlinedIcon sx={{ fontSize: 20, color: '#374151' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', color: '#111827', lineHeight: 1.25 }}>
              Privacy & Data Consent
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#9CA3AF', mt: 0.2 }}>
              GDPR compliant · Required before camera activation
            </Typography>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ px: 3.5, pt: 2.5, pb: 2 }}>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.7, mb: 2.5 }}>
            TalentAI needs access to your <strong style={{ color: '#111827' }}>camera</strong> and{' '}
            <strong style={{ color: '#111827' }}>microphone</strong> to conduct the interview. Here is exactly what we collect:
          </Typography>

          {/* Data points */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mb: 2.5 }}>
            {dataPoints.map(({ icon, label, text }, i) => (
              <Box key={i} sx={{
                p: 1.75, borderRadius: '10px',
                bgcolor: '#F9FAFB', border: '1px solid #F3F4F6',
                display: 'flex', flexDirection: 'column', gap: 0.75,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box sx={{
                    width: 28, height: 28, borderRadius: '7px',
                    bgcolor: '#fff', border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    {icon}
                  </Box>
                  <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: '#111827' }}>
                    {label}
                  </Typography>
                </Box>
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#6B7280', lineHeight: 1.55 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Rights */}
          <Box sx={{
            bgcolor: '#F9FAFB', border: '1px solid #F3F4F6',
            borderRadius: '10px', px: 2, py: 1.5, mb: 2.5,
          }}>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.75rem', color: '#374151', mb: 1 }}>
              Your GDPR rights
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
              {rights.map((r, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 13, color: PURPLE, flexShrink: 0 }} />
                  <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.72rem', color: '#6B7280' }}>{r}</Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.69rem', color: '#9CA3AF', lineHeight: 1.55 }}>
            By clicking <strong>"Accept & Continue"</strong> you provide explicit consent under GDPR Art. 7.
            You may withdraw at any time by leaving this page.
          </Typography>
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
              bgcolor: '#8310FF !important',
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
