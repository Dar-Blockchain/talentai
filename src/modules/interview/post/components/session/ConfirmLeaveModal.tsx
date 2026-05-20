import React from 'react';
import { Box, Button, Dialog, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';

interface ConfirmLeaveModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({ open, onConfirm, onCancel }) => {
  const { t } = useTranslation('interview');

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: '20px', p: 0, overflow: 'hidden', boxShadow: '0 24px 48px rgba(0,0,0,0.18)' } }}
    >
      {/* Danger accent bar */}
      <Box sx={{ height: 4, background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }} />

      <Box sx={{ p: { xs: 2.5, md: 3 }, textAlign: 'center' }}>
        {/* Warning icon */}
        <Box sx={{
          width: 58, height: 58, borderRadius: '16px',
          bgcolor: 'rgba(239,68,68,0.07)', border: '1.5px solid rgba(239,68,68,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.25,
        }}>
          <WarningAmberIcon sx={{ fontSize: 28, color: '#ef4444' }} />
        </Box>

        <Typography sx={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.02rem', color: '#111827', mb: 1 }}>
          {t('confirm_leave.title', { defaultValue: 'Leave the interview?' })}
        </Typography>

        <Typography sx={{ fontFamily: 'Poppins', fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.7, mb: 3 }}>
          {t('confirm_leave.body', { defaultValue: 'If you leave this page, you will no longer be able to take this interview. This action cannot be undone.' })}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={onConfirm}
            sx={{
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '0.85rem',
              textTransform: 'none', py: 1.15, borderRadius: '12px',
              bgcolor: '#ef4444',
              boxShadow: '0 4px 12px rgba(239,68,68,0.25)',
              '&:hover': { bgcolor: '#dc2626', boxShadow: '0 6px 16px rgba(239,68,68,0.3)' },
            }}
          >
            {t('confirm_leave.confirm', { defaultValue: 'Leave interview' })}
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={onCancel}
            sx={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: '0.82rem',
              textTransform: 'none', py: 1, borderRadius: '12px',
              color: '#374151',
              '&:hover': { bgcolor: '#f9fafb' },
            }}
          >
            {t('confirm_leave.cancel', { defaultValue: 'Stay in interview' })}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ConfirmLeaveModal;
