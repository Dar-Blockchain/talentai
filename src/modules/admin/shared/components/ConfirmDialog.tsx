import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ADMIN_ACCENT, ADMIN_DANGER, ADMIN_RADIUS } from '../theme';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const accent = destructive ? ADMIN_DANGER : ADMIN_ACCENT;
  const tintBg = destructive ? '#FEF2F2' : '#EEF2FF';

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: ADMIN_RADIUS, overflow: 'hidden', boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' } }}
    >
      <div className="relative px-6 pt-6 pb-2">
        <IconButton onClick={onCancel} sx={{ position: 'absolute', top: 12, right: 12, color: '#94A3B8', '&:hover': { color: '#475569' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tintBg }}>
            <WarningAmberIcon style={{ fontSize: 20, color: accent }} />
          </div>
          <h2 className="text-[1.05rem] font-semibold text-slate-900">{title}</h2>
        </div>
      </div>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <p className="text-[13px] text-slate-500 leading-[1.6]">{description}</p>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button
          onClick={onCancel}
          disabled={loading}
          variant="outlined"
          sx={{ textTransform: 'none', borderColor: '#E2E8F0', color: '#64748B', borderRadius: '10px', boxShadow: 'none' }}
        >
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : undefined}
          sx={{
            textTransform: 'none',
            backgroundColor: accent,
            borderRadius: '10px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { backgroundColor: destructive ? '#B91C1C' : '#4338CA', boxShadow: 'none' },
          }}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
