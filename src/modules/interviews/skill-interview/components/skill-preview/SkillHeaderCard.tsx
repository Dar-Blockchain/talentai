import React from 'react';
import { Code2, MessageCircle, Languages, Tag, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionCard, MetaBadge } from './SkillPanelShared';

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

  return (
    <SectionCard>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-[52px] h-[52px] rounded-[14px] shrink-0 flex items-center justify-center bg-primary/8 border border-primary/20">
          <Icon size={26} className="text-primary" />
        </div>
        <div>
          <h1 className="font-sans font-extrabold text-xl md:text-[1.45rem] text-foreground leading-tight">
            {skill}
          </h1>
          {/* Language called out right under the title -- the badge below
              repeats it, but this is the line a candidate actually reads
              first, so it's the one place it can't be missed. */}
          <p className="font-sans text-[0.88rem] text-muted-foreground mt-1">
            {isSoftSkill ? t('header.subtitle_soft') : t('header.subtitle')} · Conducted in {formattedLanguage}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <MetaBadge
          icon={<Sparkles size={14} />}
          label={t('header.adaptive_difficulty')}
          color="#7C3AED"
          bg="#F5F3FF"
          border="#DDD6FE"
        />
        {category && (
          <MetaBadge
            icon={<Tag size={14} />}
            label={category}
            color="#6B7280"
            bg="#F9FAFB"
            border="#E5E7EB"
          />
        )}
        <MetaBadge
          icon={<Languages size={14} />}
          label={`Language: ${formattedLanguage}`}
          color="#6B7280"
          bg="#F9FAFB"
          border="#E5E7EB"
        />
      </div>
    </SectionCard>
  );
}
