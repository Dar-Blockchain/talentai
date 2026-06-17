import React from 'react';
import SkillHeaderCard from './SkillHeaderCard';
import SkillDetailsColumn from './SkillDetailsColumn';
import SkillStartPanel from './SkillStartPanel';

export interface SkillPreviewPanelProps {
  skill: string;
  category: string | null;
  language: string;
  onStartInterview?: () => void;
}

export default function SkillPreviewPanel({
  skill,
  category,
  language,
  onStartInterview,
}: SkillPreviewPanelProps) {
  return (
    <div className="bg-background min-h-[calc(100vh-60px)] py-8 md:py-10">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 flex flex-col md:flex-row gap-6 items-stretch md:items-start">
        <div className="flex-1 flex flex-col gap-6">
          <SkillHeaderCard skill={skill} category={category} language={language} />
          <SkillDetailsColumn skill={skill} />
        </div>
        <SkillStartPanel skill={skill} onStartInterview={onStartInterview} />
      </div>
    </div>
  );
}
