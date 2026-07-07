import React from 'react';
import { Dialog, DialogContent, DialogActions, IconButton } from '@mui/material';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { X, AlertTriangle } from 'lucide-react';
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
          <X size={18} />
        </IconButton>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tintBg }}>
            <AlertTriangle size={20} color={accent} />
          </div>
          <h2 className="text-[1.05rem] font-semibold text-slate-900">{title}</h2>
        </div>
      </div>

      <DialogContent sx={{ px: 3, pt: 2, pb: 1 }}>
        <p className="text-[13px] text-slate-500 leading-[1.6]">{description}</p>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1.5 }}>
        <Button onClick={onCancel} disabled={loading} variant="outline" className="rounded-[10px] border-slate-200 text-slate-500 shadow-none">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="default"
          disabled={loading}
          loading={loading}
          className="rounded-[10px] font-semibold shadow-none"
          style={{ backgroundColor: accent }}
        >
          {loading ? 'Working…' : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
