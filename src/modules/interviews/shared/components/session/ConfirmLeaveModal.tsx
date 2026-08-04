import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent,
} from '@/modules/shared/ui/shadcn/dialog';
import { Button } from '@/modules/shared/ui/shadcn/button';

interface ConfirmLeaveModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLeaveModal: React.FC<ConfirmLeaveModalProps> = ({ open, onConfirm, onCancel }) => {
  const { t } = useTranslation('modules/interview/interview');

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-xs rounded-[20px] p-0 overflow-hidden shadow-[0_24px_48px_rgba(0,0,0,0.18)]"
      >
        {/* Danger accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#ef4444] to-[#dc2626]" />

        <div className="p-6 md:p-7 text-center">
          <div className="w-[58px] h-[58px] rounded-[16px] bg-[rgba(239,68,68,0.07)] border-[1.5px] border-[rgba(239,68,68,0.2)] flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} color="#ef4444" />
          </div>

          <p className="font-sans font-bold text-[1.02rem] text-[#111827] mb-2">
            {t('confirm_leave.title', { defaultValue: 'Leave the interview?' })}
          </p>
          <p className="font-sans text-[0.82rem] text-[#6b7280] leading-[1.7] mb-6">
            {t('confirm_leave.body', { defaultValue: 'If you leave this page, you will no longer be able to take this interview. This action cannot be undone.' })}
          </p>

          <div className="flex flex-col gap-3">
            <Button
              variant="ghost"
              onClick={onConfirm}
              className="w-full h-auto font-sans font-bold text-[0.85rem] text-white py-3 rounded-[12px] hover:text-white"
              style={{ background: '#ef4444', boxShadow: '0 4px 12px rgba(239,68,68,0.25)' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.background = '#ef4444')}
            >
              {t('confirm_leave.confirm', { defaultValue: 'Leave interview' })}
            </Button>

            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full h-auto font-sans font-semibold text-[0.82rem] text-[#374151] py-2.5 rounded-[12px] hover:bg-[#f9fafb]"
            >
              {t('confirm_leave.cancel', { defaultValue: 'Stay in interview' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmLeaveModal;
