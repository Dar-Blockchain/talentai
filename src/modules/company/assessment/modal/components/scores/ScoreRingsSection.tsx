import React from "react";
import { PostAssessmentData } from "../../types";
import { ScoreRing, ScoreTheme, scoreTheme } from "../ui";

interface Props {
  overallScore:       number;
  st:                 ScoreTheme;
  analytics:          PostAssessmentData["analytics"] | undefined;
  scoreOverallLabel:  string;
  scoreCoverageLabel: string;
}

const ScoreRingsSection: React.FC<Props> = ({ overallScore, st, analytics, scoreOverallLabel, scoreCoverageLabel }) => {
  const coverageScore  = analytics?.coveragePercentage;
  const hasCoverage    = coverageScore !== undefined;
  const coverageSt     = hasCoverage ? scoreTheme(coverageScore!) : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className={`grid ${hasCoverage ? "grid-cols-2 divide-x divide-slate-100" : "grid-cols-1"}`}>
        <div className="flex flex-col items-center py-7 px-4">
          <ScoreRing value={overallScore} color={st.color} size={100} />
          <span className="mt-3 text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">{scoreOverallLabel}</span>
        </div>
        {hasCoverage && coverageSt && (
          <div className="flex flex-col items-center py-7 px-4">
            <ScoreRing value={coverageScore!} color={coverageSt.color} size={100} />
            <span className="mt-3 text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">{scoreCoverageLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreRingsSection;
