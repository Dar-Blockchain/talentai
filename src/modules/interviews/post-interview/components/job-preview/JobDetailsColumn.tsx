import React from 'react';
import { Briefcase, CheckCircle2, Code2, Brain } from 'lucide-react';
import { getLevelFromNumber, getSoftSkillLevelLabel, type Skill } from '@/utils/postHelpers';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { SectionCard, SectionTitle } from './JobPanelShared';

interface JobDetailsColumnProps {
  jd: any;
  technicalSkills: Skill[];
  softSkills: Skill[];
}

export default function JobDetailsColumn({ jd, technicalSkills, softSkills }: JobDetailsColumnProps) {
  const { t } = useTranslation('modules/interview/apply');
  const hasSkills = technicalSkills.length > 0 || softSkills.length > 0;

  return (
    <div className="flex-1 flex flex-col gap-6">

      {jd.description && (
        <SectionCard>
          <SectionTitle icon={<Briefcase size={15} />} title={t('section.description')} />
          <p className="font-[Poppins] text-[0.88rem] text-[#374151] leading-[1.85] whitespace-pre-line">
            {jd.description}
          </p>
        </SectionCard>
      )}

      {jd.requirements && (
        <SectionCard>
          <SectionTitle icon={<CheckCircle2 size={15} />} title={t('section.requirements')} />
          <p className="font-[Poppins] text-[0.88rem] text-[#374151] leading-[1.85] whitespace-pre-line">
            {jd.requirements}
          </p>
        </SectionCard>
      )}

      {hasSkills && (
        <SectionCard>
          <div className="flex gap-4 flex-col sm:flex-row">
            {technicalSkills.length > 0 && (
              <div className="flex-1">
                <SectionTitle icon={<Code2 size={15} />} title={t('section.technical_skills')} />
                <div className="flex flex-wrap gap-[6px]">
                  {technicalSkills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="rounded-[6px] h-6 px-2 font-[Poppins] text-[11px] font-semibold text-[#16A34A] bg-primary/8 border-primary/20"
                    >
                      {skill.name}{skill.level ? ` · ${getLevelFromNumber(skill.level)}` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {softSkills.length > 0 && (
              <div className="flex-1">
                <SectionTitle icon={<Brain size={15} />} title={t('section.soft_skills')} />
                <div className="flex flex-wrap gap-[6px]">
                  {softSkills.map((skill, i) => (
                    <Badge
                      key={i}
                      variant="outline"
                      className="rounded-[6px] h-6 px-2 font-[Poppins] text-[11px] font-semibold text-[#16A34A] bg-[#F0FDF4] border-[#BBF7D0]"
                    >
                      {skill.name}{skill.level ? ` · ${getSoftSkillLevelLabel(Number(skill.level))}` : ''}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
