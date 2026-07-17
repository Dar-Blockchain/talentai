import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { AlertTriangle } from 'lucide-react';
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
    <Dialog open={open} onOpenChange={(next) => { if (!next) onCancel(); }}>
      <DialogContent className="max-w-xs overflow-hidden p-0 gap-0" style={{ borderRadius: ADMIN_RADIUS, boxShadow: '0 16px 40px -8px rgba(15,23,42,0.12)' }}>
        <div className="relative px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: tintBg }}>
              <AlertTriangle size={20} color={accent} />
            </div>
            <DialogTitle asChild>
              <h2 className="text-[1.05rem] font-semibold text-slate-900">{title}</h2>
            </DialogTitle>
          </div>
        </div>

        <div className="px-6 pt-2 pb-1">
          <p className="text-[13px] text-slate-500 leading-[1.6]">{description}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-5">
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
