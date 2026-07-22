"use client";
import React, { memo } from "react";
import { useTranslation } from "react-i18next";
import { StatCard } from "./KpiAtoms";
import {
  Brain as PsychologyOutlined,
  Briefcase as WorkOutlined,
  Users as PeopleOutlined,
  CreditCard as CreditCardOutlined,
} from "lucide-react";
import { useCombinedDetailsQuery } from "@/modules/company/billing/queries";

interface Props {
  stats:       { interviewsCount?: number; activeJobPosts?: number } | undefined;
  appMetrics:  { totalApplicants?: number } | undefined;
  loadingStats:      boolean;
  loadingAppMetrics: boolean;
}

const HiringStatCards = memo<Props>(({ stats, appMetrics: appMet, loadingStats: l0, loadingAppMetrics: l1 }) => {
  const { t } = useTranslation("dashboard");
  const { data: combined, isLoading: l2 } = useCombinedDetailsQuery();
  const c = combined?.combined;
  const hasSub = !!c && (combined?.subscriptions?.length ?? 0) > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={PsychologyOutlined}
        color="#3B82F6" bg="#EFF6FF"
        loading={l0} value={stats?.interviewsCount ?? 0}
        label={t("overview.stat.interviews_count", "Interviews Completed")}
      />
      <StatCard
        icon={WorkOutlined}
        color="#0D9488" bg="#F0FDFA"
        loading={l0} value={stats?.activeJobPosts ?? "—"}
        label={t("overview.stat.active_job_posts")}
        href="/company/posts"
      />
      <StatCard
        icon={PeopleOutlined}
        color="#8B5CF6" bg="#F5F3FF"
        loading={l1} value={appMet?.totalApplicants ?? 0}
        label={t("overview.stat.applicants")}
        href="/company/applications"
      />
      {(l2 || hasSub) && (
        <StatCard
          icon={CreditCardOutlined}
          color="#DB2777" bg="#FDF2F8"
          loading={l2}
          value={
            <div className="flex items-center gap-2.5">
              <div>
                <span className="tabular-nums">{c?.usage.posts.remaining ?? 0}</span>
                <span className="text-[11px] font-semibold text-slate-400 ml-1">{t("overview.subscription.posts_short", "posts")}</span>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <div>
                <span className="tabular-nums">{c?.usage.monthlyInterviews.remaining ?? 0}</span>
                <span className="text-[11px] font-semibold text-slate-400 ml-1">{t("overview.subscription.interviews_short", "interviews")}</span>
              </div>
            </div>
          }
          label={t("overview.subscription.remaining_label", "Remaining This Cycle")}
          href="/company/plans"
        />
      )}
    </div>
  );
});
HiringStatCards.displayName = "HiringStatCards";
export default HiringStatCards;
