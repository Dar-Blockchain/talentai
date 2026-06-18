import React from "react";
import { ScoreRing, scoreTheme, VerdictTheme } from "../ui";

interface Props {
  overallScore: number;
  vt:           VerdictTheme;
  verdictLabel: string;
}

const ScoreVerdictBadge: React.FC<Props> = ({ overallScore, vt, verdictLabel }) => {
  const st = scoreTheme(overallScore);
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${vt.bgCls}`} style={{ borderColor: vt.borderColor }}>
      <ScoreRing value={overallScore} color={st.color} size={56} />
      <div className="flex flex-col gap-1">
        <span className="text-[0.6rem] font-bold text-slate-400 uppercase tracking-widest">Overall Score</span>
        <span className={`text-[0.72rem] font-extrabold tracking-wide px-2.5 py-0.5 rounded-full self-start ${vt.pillCls}`}>
          {verdictLabel}
        </span>
      </div>
    </div>
  );
};

export default ScoreVerdictBadge;
