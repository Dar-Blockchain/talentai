import React from "react";
import { Trophy as EmojiEventsOutlined, Brain as PsychologyOutlined, Mic2 as RecordVoiceOverOutlined, Gauge as SpeedOutlined } from "lucide-react";
import { PostAssessmentData } from "../../types";
import { ScoreBar, scoreTheme } from "../ui";

const METRICS = [
  { key: "quality"       as const, label: "Response Quality", color: "#3B82F6", iconBgCls: "bg-blue-50",   Icon: SpeedOutlined           },
  { key: "skills"        as const, label: "Skills Match",     color: "#8B5CF6", iconBgCls: "bg-violet-50", Icon: EmojiEventsOutlined     },
  { key: "depth"         as const, label: "Answer Depth",     color: "#F59E0B", iconBgCls: "bg-amber-50",  Icon: PsychologyOutlined      },
  { key: "communication" as const, label: "Communication",    color: "#10B981", iconBgCls: "bg-emerald-50",Icon: RecordVoiceOverOutlined },
];

interface Props {
  scores:              PostAssessmentData["scores"] | undefined;
  scoreBreakdownLabel: string;
}

const ScoreBreakdownCard: React.FC<Props> = ({ scores, scoreBreakdownLabel }) => {
  if (!scores || !Object.values(scores).some(v => v != null)) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-slate-100">
        <span className="text-[0.78rem] font-bold text-slate-700">{scoreBreakdownLabel}</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-5">
        {METRICS.map(({ key, label, color, iconBgCls, Icon }) => {
          const val = scores[key];
          if (val == null) return null;
          const pct = Math.min(Math.round(val), 100);
          const st  = scoreTheme(pct);
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <div className={`w-[22px] h-[22px] rounded-md flex items-center justify-center ${iconBgCls}`}>
                    <Icon size={13} color={color} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{label}</span>
                </div>
                <span className={`text-[0.78rem] font-extrabold tabular-nums px-2 py-0.5 rounded-full ${st.pillCls}`}>
                  {pct}%
                </span>
              </div>
              <ScoreBar value={pct} color={color} height={6} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScoreBreakdownCard;
