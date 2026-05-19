import React from 'react';
import { Box, Typography, Button, Modal, Divider } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { useTranslation } from 'react-i18next';

interface GDPRConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const GDPRConsentModal: React.FC<GDPRConsentModalProps> = ({ open, onAccept, onDecline }) => {
  const { t } = useTranslation('interview');

  return (
    <Modal open={open} disableEscapeKeyDown>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: { xs: '94vw', sm: 520 },
        bgcolor: '#fff',
        borderRadius: '20px',
        border: '1px solid #E8F5EE',
        boxShadow: '0 24px 80px rgba(0,0,0,0.1), 0 4px 20px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        outline: 'none',
      }}>

        {/* Top accent strip */}
        <Box sx={{ height: 4, background: 'linear-gradient(90deg, #6AD39C, #10453F)' }} />

        {/* Header */}
        <Box sx={{ px: 3.5, pt: 3, pb: 2.5, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{
            width: 44, height: 44, borderRadius: '12px', flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(106,211,156,0.15), rgba(16,69,63,0.08))',
            border: '1px solid rgba(106,211,156,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldOutlinedIcon sx={{ fontSize: 22, color: '#16A34A' }} />
          </Box>
          <Box>
            <Typography sx={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.05rem', color: '#0F172A', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
              {t('gdpr.privacy_title')}
            </Typography>
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.8rem', color: '#64748B', mt: 0.4, lineHeight: 1.5 }}>
              {t('gdpr.integrity_title')}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#F1F5F9' }} />

        {/* Body */}
        <Box sx={{ px: 3.5, py: 2.5 }}>
          <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#475569', lineHeight: 1.8, mb: 2.5 }}>
            {t('gdpr.body')}
          </Typography>

          {/* Bullet points */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, mb: 2.5 }}>
            {[t('gdpr.bullet_data'), t('gdpr.bullet_privacy')].map((text) => (
              <Box key={text} sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.25,
                p: 1.5, borderRadius: '10px',
                bgcolor: 'rgba(106,211,156,0.04)',
                border: '1px solid rgba(106,211,156,0.12)',
              }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 16, color: '#16A34A', flexShrink: 0, mt: '2px' }} />
                <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.78rem', color: '#374151', lineHeight: 1.7 }}>
                  {text}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Confirmation notice */}
          <Box sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1,
            bgcolor: '#F8FAFC', border: '1px solid #E2E8F0',
            borderRadius: '10px', px: 2, py: 1.5,
          }}>
            <LockOutlinedIcon sx={{ fontSize: 14, color: '#94A3B8', flexShrink: 0, mt: '2px' }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.65 }}>
              {t('gdpr.confirmation')}
            </Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box sx={{ px: 3.5, pb: 3, display: 'flex', gap: 1.25, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onDecline}
            sx={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem',
              textTransform: 'none', borderRadius: '10px',
              color: '#64748B', borderColor: '#E2E8F0', px: 2.5, py: 1,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            {t('gdpr.decline')}
          </Button>
          <Button
            variant="contained"
            onClick={onAccept}
            disableElevation
            sx={{
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.82rem',
              textTransform: 'none', borderRadius: '10px',
              bgcolor: '#6AD39C', color: '#fff', px: 3, py: 1,
              boxShadow: '0 4px 12px rgba(106,211,156,0.35)',
              '&:hover': { bgcolor: '#10453F', boxShadow: 'none' },
            }}
          >
            {t('gdpr.accept_btn')}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GDPRConsentModal;
