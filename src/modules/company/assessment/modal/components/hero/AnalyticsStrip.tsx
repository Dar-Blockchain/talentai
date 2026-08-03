import React from "react";
import { Clock as AccessTimeOutlined, MessageCircle as ChatBubbleOutlineOutlined, TrendingUp as TrendingUpOutlined, VolumeX as VolumeOffOutlined } from "lucide-react";
import { fmtDuration } from "@/modules/company/assessment/constants";
import { PostAssessmentData } from "../../types";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconClass: string;
}

interface Props {
  analytics: PostAssessmentData["analytics"];
}

const AnalyticsStrip: React.FC<Props> = ({ analytics }) => {
  if (!analytics) return null;

  const stats: StatItem[] = [];

  if (analytics.duration !== undefined)
    stats.push({ icon: <AccessTimeOutlined size={14} />, label: "Duration", value: fmtDuration(analytics.duration), iconClass: "text-slate-400" });

  if (analytics.messageCount !== undefined)
    stats.push({ icon: <ChatBubbleOutlineOutlined size={14} />, label: "Exchanges", value: String(analytics.messageCount), iconClass: "text-slate-400" });

  if (analytics.completedAreas !== undefined && analytics.totalAreas !== undefined)
    stats.push({ icon: <TrendingUpOutlined size={14} />, label: "Areas", value: `${analytics.completedAreas} / ${analytics.totalAreas}`, iconClass: "text-teal-500" });

  if ((analytics.silenceEvents ?? 0) > 0)
    stats.push({ icon: <VolumeOffOutlined size={14} />, label: "Silences", value: String(analytics.silenceEvents), iconClass: "text-amber-500" });

  if (analytics.averageResponseLength !== undefined)
    stats.push({ icon: <ChatBubbleOutlineOutlined size={14} />, label: "Avg words", value: `~${analytics.averageResponseLength}`, iconClass: "text-slate-400" });

  if (stats.length === 0) return null;

  return (
    <div className="mx-7 mb-5 rounded-xl border border-slate-100 bg-slate-50 flex overflow-hidden divide-x divide-slate-100">
      {stats.map((s, i) => (
        <div key={i} className="flex-1 flex flex-col items-center justify-center py-3 px-3 min-w-0">
          <span className={`mb-0.5 ${s.iconClass}`}>{s.icon}</span>
          <div className="text-sm font-bold text-slate-800 leading-tight">{s.value}</div>
          <div className="text-[0.6rem] text-slate-400 font-medium mt-0.5 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsStrip;
