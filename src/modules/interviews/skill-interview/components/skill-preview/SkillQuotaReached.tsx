import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';

interface SkillQuotaReachedProps {
  /** The skill-test cap (currently 5). */
  max: number;
  /** Formatted next-reset datetime, or null if not known / already elapsed. */
  resetLabel?: string | null;
}

// Shown instead of the skill preview when a logged-in candidate has already
// used their whole skill-test quota -- the entry-point buttons are gated
// elsewhere, but the /interviews/<session> link can still be opened directly.
export default function SkillQuotaReached({ max, resetLabel }: SkillQuotaReachedProps) {
  const router = useRouter();
  const { t } = useTranslation('modules/interview/skill-interview');

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center flex flex-col items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center">
          <Zap size={28} className="text-danger" />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-foreground font-bold text-lg">{t('quota_reached.title')}</p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {resetLabel
              ? t('quota_reached.desc_reset', { max, date: resetLabel })
              : t('quota_reached.desc', { max })}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/candidate/skills')}
          className="gap-1.5"
        >
          <ArrowLeft size={14} />
          {t('quota_reached.back')}
        </Button>
      </div>
    </div>
  );
}
