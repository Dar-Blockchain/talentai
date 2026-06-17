import React from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Code2, Clock, Mic, ChevronRight } from 'lucide-react';
import { Button } from '@/modules/shared/ui/shadcn/button';
import type { CampaignModuleType } from '../hooks/useCampaignInterviewConfig';

interface CampaignPreviewPanelProps {
  moduleType: CampaignModuleType;
  onStartInterview?: () => void;
}

export default function CampaignPreviewPanel({ moduleType, onStartInterview }: CampaignPreviewPanelProps) {
  const { t } = useTranslation('modules/interview/campaign-interview');

  const isSkillTest = moduleType === 'SKILL_TEST';
  const Icon = isSkillTest ? Code2 : Brain;
  const title = isSkillTest ? t('preview.skill_title') : t('preview.ai_title');
  const description = isSkillTest ? t('preview.skill_desc') : t('preview.ai_desc');

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Icon size={26} className="text-primary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Clock size={15} className="shrink-0" />
            <span>{t('preview.duration')}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <Mic size={15} className="shrink-0" />
            <span>{t('preview.microphone')}</span>
          </div>
        </div>

        {onStartInterview ? (
          <Button onClick={onStartInterview} className="gap-2 w-full sm:w-auto">
            {t('preview.start')}
            <ChevronRight size={16} />
          </Button>
        ) : (
          <Button disabled className="gap-2 w-full sm:w-auto opacity-60">
            {t('preview.login_required')}
          </Button>
        )}
      </div>
    </div>
  );
}
