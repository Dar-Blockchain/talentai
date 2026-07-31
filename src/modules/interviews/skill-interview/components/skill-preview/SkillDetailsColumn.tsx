import React from 'react';
import { Code2, Mic, Lightbulb, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { SectionCard, SectionTitle } from './SkillPanelShared';

interface SkillDetailsColumnProps {
  skill: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- `skill` kept in the public prop signature though unused internally
export default function SkillDetailsColumn({ skill }: SkillDetailsColumnProps) {
  const { t } = useTranslation('modules/interview/skill-interview');

  const raw = {
    areas:       t('preview.areas',        { returnObjects: true }),
    focusChips:  t('preview.focus_chips',  { returnObjects: true }),
    formatItems: t('preview.format_items', { returnObjects: true }),
    formatIcons: t('preview.format_icons', { returnObjects: true }),
    tips:        t('preview.tips',         { returnObjects: true }),
  };
  const areas       = Array.isArray(raw.areas)       ? raw.areas       as string[] : [];
  const focusChips  = Array.isArray(raw.focusChips)  ? raw.focusChips  as string[] : [];
  const formatItems = Array.isArray(raw.formatItems) ? raw.formatItems as string[] : [];
  const formatIcons = Array.isArray(raw.formatIcons) ? raw.formatIcons as string[] : [];
  const tips        = Array.isArray(raw.tips)        ? raw.tips        as string[] : [];

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* What will be assessed */}
      <SectionCard>
        <SectionTitle icon={<Code2 size={15} />} title={t('preview.what_assessed')} />
        <div className="flex flex-col gap-3">
          {areas.map((area) => (
            <div key={area} className="flex items-center gap-3">
              <CheckCircle2 size={16} className="shrink-0 text-primary" />
              <span className="font-sans text-[0.88rem] text-foreground/80">{area}</span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <p className="font-sans text-[0.75rem] font-bold text-muted-foreground uppercase tracking-[0.4px] mb-2">
            {t('preview.focus_areas_label')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {focusChips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="rounded-full px-3 py-0.5 text-[11px] font-semibold font-sans bg-primary/8 text-primary-dark border-primary/20"
              >
                {chip}
              </Badge>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* Interview format */}
      <SectionCard>
        <SectionTitle icon={<Mic size={15} />} title={t('preview.format_title')} />
        <div className="flex flex-col gap-3">
          {formatItems.map((label, i) => (
            <div key={i} className="flex items-center gap-4 px-3 py-2.5 rounded-[10px] bg-muted border border-border">
              <span className="text-base leading-none shrink-0">{formatIcons[i]}</span>
              <span className="font-sans text-[0.82rem] text-foreground/80">{label}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Tips */}
      <SectionCard>
        <SectionTitle icon={<Lightbulb size={15} />} title={t('preview.tips_title')} />
        <div className="flex flex-col gap-3">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/8 border border-primary/20">
                <span className="font-sans font-bold text-[0.65rem] text-primary-dark">
                  {i + 1}
                </span>
              </div>
              <p className="font-sans text-[0.85rem] text-foreground/80 leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
