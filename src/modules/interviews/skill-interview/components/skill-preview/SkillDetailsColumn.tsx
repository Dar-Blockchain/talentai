import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { SectionCard, SubHeading } from './SkillPanelShared';

interface SkillDetailsColumnProps {
  skill: string;
}

export default function SkillDetailsColumn({ skill }: SkillDetailsColumnProps) {
  const { t } = useTranslation('modules/interview/skill-interview');

  const asArray = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const chips    = asArray(t('preview.focus_chips', { returnObjects: true }));
  const getItems = asArray(t('preview.get_items',   { returnObjects: true }));

  return (
    <SectionCard>
      <div className="divide-y divide-border">

        {/* What it covers */}
        <section className="pb-5">
          <SubHeading title={t('preview.covers_title')} />
          <p className="font-sans text-[0.85rem] text-foreground/80 leading-relaxed mb-3">
            {t('preview.covers_intro', { skill })}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <Badge
                key={chip}
                variant="outline"
                className="rounded-full px-3 py-0.5 text-[11px] font-semibold font-sans bg-primary/8 text-primary-dark border-primary/20"
              >
                {chip}
              </Badge>
            ))}
          </div>
        </section>

        {/* What you'll get */}
        <section className="pt-5">
          <SubHeading title={t('preview.get_title')} />
          <div className="flex flex-col gap-2.5">
            {getItems.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <span className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 border border-primary/25">
                  <Check size={11} className="text-primary-dark" />
                </span>
                <span className="font-sans text-[0.84rem] text-foreground/80 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </SectionCard>
  );
}
