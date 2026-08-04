import React from 'react';
import { Lock, CheckCircle2, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog, DialogContent, DialogTitle, DialogDescription,
} from '@/modules/shared/ui/shadcn/dialog';

interface GDPRConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

const GDPRConsentModal: React.FC<GDPRConsentModalProps> = ({ open, onAccept, onDecline }) => {
  const { t } = useTranslation('interview');

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="w-[94vw] sm:max-w-[640px] max-h-[90vh] rounded-[20px] p-0 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.1),0_4px_20px_rgba(0,0,0,0.06)] border border-[#E8F5EE] flex flex-col"
      >
        {/* Top accent strip */}
        <div className="h-1 bg-gradient-to-r from-[#6AD39C] to-[#10453F] shrink-0" />

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Header */}
          <div className="px-5 sm:px-7 pt-6 pb-5 flex items-start gap-4">
            <div
              className="w-11 h-11 rounded-[12px] shrink-0 flex items-center justify-center border border-[rgba(106,211,156,0.25)]"
              style={{ background: 'linear-gradient(135deg, rgba(106,211,156,0.15), rgba(16,69,63,0.08))' }}
            >
              <Shield size={22} color="#16A34A" />
            </div>
            <div>
              <DialogTitle asChild>
                <p className="font-sans font-extrabold text-[1.05rem] text-[#0F172A] leading-tight tracking-tight">
                  {t('gdpr.privacy_title')}
                </p>
              </DialogTitle>
              <DialogDescription asChild>
                <p className="font-sans text-[0.8rem] text-[#64748B] mt-1 leading-snug">
                  {t('gdpr.integrity_title')}
                </p>
              </DialogDescription>
            </div>
          </div>

          <hr className="border-[#F1F5F9]" />

          {/* Body */}
          <div className="px-5 sm:px-7 py-5">
            <p className="font-sans text-[0.82rem] text-[#475569] leading-[1.8] mb-5">
              {t('gdpr.body')}
            </p>

            <div className="flex flex-col gap-3 mb-5">
              {[t('gdpr.bullet_data'), t('gdpr.bullet_privacy')].map((text) => (
                <div
                  key={text}
                  className="flex items-start gap-3 p-3.5 rounded-[10px] bg-[rgba(106,211,156,0.04)] border border-[rgba(106,211,156,0.12)]"
                >
                  <CheckCircle2 size={16} color="#16A34A" className="shrink-0 mt-0.5" />
                  <p className="font-sans text-[0.78rem] text-[#374151] leading-[1.7]">{text}</p>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] px-4 py-3">
              <Lock size={14} color="#94A3B8" className="shrink-0 mt-0.5" />
              <p className="font-sans text-[0.75rem] text-[#64748B] leading-relaxed">{t('gdpr.confirmation')}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-7 py-4 sm:py-5 flex gap-3 justify-end border-t border-[#F1F5F9] shrink-0">
          <button
            onClick={onDecline}
            className="font-sans font-semibold text-[0.82rem] text-[#64748B] border border-[#E2E8F0] rounded-[10px] px-5 py-2.5 hover:border-[#CBD5E1] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
          >
            {t('gdpr.decline')}
          </button>
          <button
            onClick={onAccept}
            className="font-sans font-bold text-[0.82rem] text-white rounded-[10px] px-6 py-2.5 transition-colors cursor-pointer"
            style={{ background: '#6AD39C', boxShadow: '0 4px 12px rgba(106,211,156,0.35)' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#10453F')}
            onMouseLeave={e => (e.currentTarget.style.background = '#6AD39C')}
          >
            {t('gdpr.accept_btn')}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GDPRConsentModal;
