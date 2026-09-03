import React from 'react';
import SkillHeaderCard from './SkillHeaderCard';
import SkillDetailsColumn from './SkillDetailsColumn';
import SkillStartPanel from './SkillStartPanel';

export interface SkillPreviewPanelProps {
  skill: string;
  category: string | null;
  language: string;
  isSoftSkill?: boolean;
  onStartInterview?: () => void;
}

export default function SkillPreviewPanel({
  skill,
  category,
  language,
  isSoftSkill,
  onStartInterview,
}: SkillPreviewPanelProps) {
  return (
    <div className="bg-background min-h-[calc(100vh-60px)] py-6 md:py-9">
      <div className="max-w-[1040px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-5 items-stretch md:items-start">
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <SkillHeaderCard skill={skill} category={category} language={language} isSoftSkill={isSoftSkill} />
          <SkillDetailsColumn skill={skill} />
        </div>
        <SkillStartPanel skill={skill} onStartInterview={onStartInterview} />
      </div>
    </div>
  );
}
