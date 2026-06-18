import React from "react";
import FormatQuoteOutlined from "@mui/icons-material/FormatQuoteOutlined";
import { PostAssessmentData } from "../../types";
import { VerdictTheme } from "../ui";

interface Props {
  verdict:      PostAssessmentData["verdict"];
  vt:           VerdictTheme;
  verdictLabel: string;
}

const VerdictCard: React.FC<Props> = ({ verdict, vt, verdictLabel }) => {
  if (!verdict) return null;
  return (
    <div className={`rounded-2xl border overflow-hidden ${vt.bgCls}`} style={{ borderColor: vt.borderColor }}>
      <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b" style={{ borderColor: vt.borderColor }}>
        <span className={`px-3 py-1 rounded-full text-[0.72rem] font-black tracking-widest uppercase ${vt.pillCls}`}>
          {verdictLabel}
        </span>
        {verdict.overallScore != null && (
          <span className={`text-sm font-bold ${vt.textCls}`}>
            {verdict.overallScore.toFixed(0)}<span className="text-[0.68rem] font-semibold opacity-60"> / 100</span>
          </span>
        )}
      </div>
      {verdict.reasoning && (
        <div className="px-5 py-4 flex gap-2.5">
          <FormatQuoteOutlined style={{ fontSize: 18, color: vt.color, opacity: 0.4, flexShrink: 0, marginTop: 1 }} />
          <p className="text-sm text-slate-700 leading-7 italic">{verdict.reasoning}</p>
        </div>
      )}
    </div>
  );
};

export default VerdictCard;
