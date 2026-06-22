import React from 'react';
import { Progress } from '@/modules/shared/ui/shadcn/progress';

interface Props {
  overall: number;
  label: string;
}

export default function InterviewProgressBar({ overall, label }: Props) {
  return (
    <div className="bg-white rounded-[16px] border border-[#c8eedd] px-6 md:px-8 py-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="font-sans font-semibold text-[0.82rem] text-[#374151]">{label}</span>
        <span className="font-sans font-bold text-[0.82rem] text-primary">
          {Math.round(overall)}%
        </span>
      </div>
      <Progress
        value={Math.min(overall, 100)}
        className="h-1.5 rounded-full bg-[rgba(106,211,156,0.08)] [&>div]:bg-gradient-to-r [&>div]:from-[#6AD39C] [&>div]:to-[#10453F] [&>div]:rounded-full"
      />
    </div>
  );
}
