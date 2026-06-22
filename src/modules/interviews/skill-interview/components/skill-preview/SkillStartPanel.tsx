import React from 'react';
import { Play, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { type RootState } from '@/store/store';
import { Button } from '@/modules/shared/ui/shadcn/button';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Separator } from '@/modules/shared/ui/shadcn/separator';
import { SectionCard } from './SkillPanelShared';

interface SkillStartPanelProps {
  skill: string;
  onStartInterview?: () => void;
}

export default function SkillStartPanel({ skill, onStartInterview }: SkillStartPanelProps) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const router   = useRouter();

  const isAuthenticated = !!authUser && !!onStartInterview;

  const rawFeatures = t('start.features',    { returnObjects: true });
  const rawSteps    = t('start.login.steps', { returnObjects: true });
  const features = Array.isArray(rawFeatures) ? rawFeatures as string[]                           : [];
  const steps    = Array.isArray(rawSteps)    ? rawSteps    as { label: string; sub: string }[]   : [];

  return (
    <div className="w-full md:w-[320px] shrink-0 md:sticky md:top-6">
      <SectionCard>
        {isAuthenticated ? (
          <>
            <Badge
              variant="outline"
              className="mb-3 font-sans text-[0.72rem] rounded-full bg-primary/10 text-primary-dark border-primary/30"
            >
              {t('start.ready_badge')}
            </Badge>

            <p className="font-sans font-bold text-[1.05rem] text-foreground mb-1">{t('start.title')}</p>
            <p className="font-sans text-[0.82rem] text-muted-foreground mb-5 leading-relaxed">
              {t('start.description', { skill })}
            </p>

            {features.map((item) => (
              <div key={item} className="flex items-center gap-2 mb-3">
                <CheckCircle size={15} className="shrink-0 text-primary" />
                <span className="font-sans text-[0.78rem] text-foreground/80">{item}</span>
              </div>
            ))}

            <Separator className="my-4" />

            <Button
              variant="default"
              size="lg"
              className="w-full rounded-[12px] text-[0.95rem] font-bold"
              onClick={onStartInterview}
            >
              <Play size={18} />
              {t('start.button')}
            </Button>
          </>
        ) : (
          <>
            <p className="font-sans font-bold text-[1.05rem] text-foreground mb-1">{t('start.login.title')}</p>
            <p className="font-sans text-[0.82rem] text-muted-foreground mb-5 leading-relaxed">
              {t('start.login.description', { skill })}
            </p>

            {steps.map(({ label, sub }, num) => (
              <div key={num} className="flex items-start gap-3 mb-4">
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center bg-primary/8 border border-primary/20">
                  <span className="font-sans font-bold text-[0.75rem] text-primary-dark">
                    {num + 1}
                  </span>
                </div>
                <div>
                  <p className="font-sans font-semibold text-[0.85rem] text-foreground">{label}</p>
                  <p className="font-sans text-[0.75rem] text-muted-foreground">{sub}</p>
                </div>
              </div>
            ))}

            <Separator className="my-4" />

            <Button
              variant="default"
              size="lg"
              className="w-full rounded-[12px] text-[0.95rem] font-bold"
              onClick={() => router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`)}
            >
              {t('start.login.button')}
            </Button>
          </>
        )}
      </SectionCard>
    </div>
  );
}
