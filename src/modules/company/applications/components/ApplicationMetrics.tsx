import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Users, TrendingUp, Trophy, Briefcase } from "lucide-react";

interface Props {
  metrics: { totalApplicants: number; totalJobPosts: number; avgCVScore: number; topCVScore: number; topInterviewScore: number } | null;
}

const STAT_DEFS = [
  { key: "totalApplicants",   Icon: Users,      i18nKey: "pages.applications.metrics.total_applicants",  color: "#0D9488", bg: "#F0FDFA", fmt: (v: number) => v },
  { key: "totalJobPosts",     Icon: Briefcase,  i18nKey: "pages.applications.metrics.job_posts",          color: "#10B981", bg: "#F0FDF4", fmt: (v: number) => v },
  { key: "topCVScore",        Icon: TrendingUp, i18nKey: "pages.applications.metrics.top_match_score",    color: "#6366F1", bg: "#EEF2FF", fmt: (v: number) => v != null ? `${v}%` : "N/A" },
  { key: "topInterviewScore", Icon: Trophy,     i18nKey: "pages.applications.metrics.top_interview_score", color: "#D97706", bg: "#FEF3C7", fmt: (v: number) => v != null ? `${v}%` : "N/A" },
] as const;

const ApplicationMetrics = memo<Props>(({ metrics }) => {
  const { t } = useTranslation("dashboard");
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {STAT_DEFS.map(({ key, Icon, i18nKey, color, bg, fmt }) => (
        <div key={key} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
            <Icon size={20} style={{ color }} />
          </div>
          <div>
            {!metrics
              ? <Skeleton className="h-7 w-12 mb-1" />
              : <div className="text-[1.4rem] font-extrabold text-slate-900 leading-none">{fmt((metrics as any)[key])}</div>
            }
            <div className="text-[0.68rem] font-semibold text-slate-400 uppercase tracking-wider mt-1">{t(i18nKey)}</div>
          </div>
        </div>
      ))}
    </div>
  );
});
ApplicationMetrics.displayName = "ApplicationMetrics";

export default ApplicationMetrics;
