import React from 'react';
import { Code2, MessageCircle, Languages, Tag, Mic, Zap, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from './SkillPanelShared';

interface SkillHeaderCardProps {
  skill: string;
  category: string | null;
  language: string;
  isSoftSkill?: boolean;
}

// "en" / "English" / "ENGLISH" -> "English" -- language only ever arrives as
// a language code or an already-capitalized name, never a full free-text
// string, so a first-letter capitalization is enough here.
const formatLanguage = (language: string) =>
  language ? language.charAt(0).toUpperCase() + language.slice(1).toLowerCase() : 'English';

export default function SkillHeaderCard({ skill, category, language, isSoftSkill }: SkillHeaderCardProps) {
  const { t } = useTranslation('modules/interview/skill-interview');
  const Icon = isSoftSkill ? MessageCircle : Code2;
  const formattedLanguage = formatLanguage(language);

  const facts = [
    { icon: Mic,      label: t('preview.facts.format') },
    { icon: Zap,      label: t('preview.facts.difficulty') },
    { icon: FileText, label: t('preview.facts.outcome') },
  ];

  return (
    <SectionCard className="relative overflow-hidden">
      {/* soft brand wash behind the header */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/[0.07] to-transparent" />

      <div className="relative flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/25 shadow-sm">
          <Icon size={27} className="text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="font-sans font-extrabold text-2xl md:text-[1.7rem] text-foreground leading-[1.1] tracking-tight">
            {skill}
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold font-sans bg-primary/10 text-primary-dark border border-primary/25">
              {isSoftSkill ? <MessageCircle size={12} /> : <Code2 size={12} />}
              {isSoftSkill ? t('header.subtitle_soft') : t('header.subtitle')}
            </span>
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-sans bg-muted text-muted-foreground border border-border">
                <Tag size={11} />
                {category}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold font-sans bg-muted text-muted-foreground border border-border">
              <Languages size={11} />
              {formattedLanguage}
            </span>
          </div>
        </div>
      </div>

      {/* Quick facts — at-a-glance basics as their own tiles */}
      <div className="relative mt-5 grid grid-cols-3 gap-2">
        {facts.map(({ icon: FactIcon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 px-2 py-2 min-w-0"
          >
            <span className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center bg-primary/10 text-primary">
              <FactIcon size={13} />
            </span>
            <span className="font-sans text-[0.76rem] font-semibold text-foreground/80 truncate">{label}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
