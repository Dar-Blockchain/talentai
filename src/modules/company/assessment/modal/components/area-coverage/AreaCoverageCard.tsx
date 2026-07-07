import React from "react";
import { CheckCircle2 as CheckCircleOutlined } from "lucide-react";
import { AreaData } from "../../types";
import { ScoreBar, scoreTheme } from "../ui";

interface Props {
  area: string;
  data: AreaData;
}

const AreaCoverageCard: React.FC<Props> = ({ area, data }) => {
  const pct = data.percentage ?? 0;
  const st  = scoreTheme(pct);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="h-[3px]" style={{ backgroundColor: st.color }} />
      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[0.875rem] font-bold text-slate-800 capitalize">
              {area.replace(/_/g, " ")}
            </span>
            {data.completed && <CheckCircleOutlined size={14} color="#10B981" />}
          </div>
          <div className="flex items-center gap-2">
            {data.weight > 0 && (
              <span className="text-[0.66rem] font-semibold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-full">
                {data.weight}% weight
              </span>
            )}
            <span className={`text-sm font-black tabular-nums px-2 py-0.5 rounded-full ${st.pillCls}`}>
              {pct}%
            </span>
          </div>
        </div>

        <ScoreBar value={pct} color={st.color} height={6} />

        {data.questionsAsked > 0 && (
          <div className="text-[0.68rem] text-slate-400 mt-2 font-medium">
            {data.questionsAsked} question{data.questionsAsked !== 1 ? "s" : ""} asked
          </div>
        )}

        {(data.indicators?.length ?? 0) > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-1.5">
            {data.indicators.slice(0, 5).map((ind, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 mt-[5px] ${ind.covered ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className="text-[0.74rem] text-slate-500 leading-relaxed">
                  {ind.evidence?.[0] || ind.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AreaCoverageCard;
