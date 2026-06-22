import React from 'react';
import { AlertTriangle, ShieldX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Progress } from '@/modules/shared/ui/shadcn/progress';
import {
  Dialog, DialogContent,
} from '@/modules/shared/ui/shadcn/dialog';

const MAX_WARNINGS = 1;

interface SecurityModalsProps {
  showFirstViolationModal: boolean;
  showSecurityModal: boolean;
  violationType: string;
  securityViolationCount: number;
  onDismissFirst: () => void;
  onReturnToDashboard: () => void;
}

const SecurityModals: React.FC<SecurityModalsProps> = ({
  showFirstViolationModal,
  showSecurityModal,
  violationType,
  securityViolationCount,
  onDismissFirst,
  onReturnToDashboard,
}) => {
  const { t } = useTranslation('interview');
  const warningsLeft = MAX_WARNINGS - securityViolationCount;

  const prohibitedRules = [
    t('security.prohibited_copy'),
    t('security.prohibited_tabs'),
    t('security.prohibited_rightclick'),
    t('security.prohibited_screenshot'),
    t('security.prohibited_devtools'),
  ];

  return (
    <>
      {/* Warning modal */}
      <Dialog
        open={showFirstViolationModal && !showSecurityModal}
        onOpenChange={(o) => !o && onDismissFirst()}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-xs rounded-[20px] p-0 overflow-hidden"
        >
          <div className="h-1 bg-[#F59E0B]" />
          <div className="px-7 pt-7 pb-6">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[rgba(245,158,11,0.1)] border-2 border-[rgba(245,158,11,0.25)] flex items-center justify-center">
                <AlertTriangle size={32} color="#F59E0B" />
              </div>
            </div>

            <p className="font-sans font-bold text-[1.05rem] text-[#111827] text-center mb-1.5">
              {t('security.warning_title')}
            </p>
            <p className="font-sans text-[0.82rem] text-[#4B5563] text-center leading-[1.7] mb-5">
              <strong className="text-[#D97706]">{violationType || 'A restricted action'}</strong>{' '}
              {t('security.warning_desc')}
            </p>

            <div className="mb-5">
              <div className="flex justify-between mb-1.5">
                <span className="font-sans text-[0.72rem] text-[#6B7280]">{t('security.violations_label')}</span>
                <span
                  className="font-sans font-bold text-[0.72rem]"
                  style={{ color: securityViolationCount >= MAX_WARNINGS ? '#EF4444' : '#D97706' }}
                >
                  {securityViolationCount} / {MAX_WARNINGS + 1} —{' '}
                  {warningsLeft > 0
                    ? t('security.warnings_left', { count: warningsLeft })
                    : t('security.no_warnings_left')}
                </span>
              </div>
              <Progress
                value={(securityViolationCount / (MAX_WARNINGS + 1)) * 100}
                className="h-1.5 rounded-full bg-[#FEF3C7]"
              />
            </div>

            <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[10px] p-3.5 mb-5">
              <p className="font-sans font-bold text-[0.72rem] text-[#92400E] mb-1.5">{t('security.prohibited_title')}</p>
              {prohibitedRules.map((rule) => (
                <p key={rule} className="font-sans text-[0.71rem] text-[#78350F] leading-[1.7]">· {rule}</p>
              ))}
            </div>

            <button
              onClick={onDismissFirst}
              className="w-full font-sans font-bold text-[0.88rem] text-white py-3 rounded-[10px] bg-[#F59E0B] hover:bg-[#D97706] transition-colors"
            >
              {t('security.understand_btn')}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Termination modal */}
      <Dialog open={showSecurityModal} onOpenChange={() => {}}>
        <DialogContent
          showCloseButton={false}
          className="max-w-xs rounded-[20px] p-0 overflow-hidden"
        >
          <div className="h-1 bg-[#EF4444]" />
          <div className="px-7 pt-7 pb-6">
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-full bg-[#FEF2F2] border-2 border-[#FECACA] flex items-center justify-center">
                <ShieldX size={32} color="#EF4444" />
              </div>
            </div>

            <p className="font-sans font-bold text-[1.05rem] text-[#111827] text-center mb-1.5">
              {t('security.terminated_title')}
            </p>
            <p className="font-sans text-[0.82rem] text-[#4B5563] text-center leading-[1.7] mb-6">
              {t('security.terminated_desc')}
            </p>

            <button
              onClick={onReturnToDashboard}
              className="w-full font-sans font-bold text-[0.88rem] text-white py-3 rounded-[10px] bg-[#EF4444] hover:bg-[#DC2626] transition-colors"
            >
              {t('security.return_dashboard')}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SecurityModals;
