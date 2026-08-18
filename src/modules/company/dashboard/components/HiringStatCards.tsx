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
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/modules/shared/ui/shadcn/hover-card";

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
  const subs = combined?.subscriptions ?? [];
  const hasSub = !!c && subs.length > 0;
  const planLabelText = subs.length > 1
    ? t("overview.subscription.multi_plan", "{{count}} active plans", { count: subs.length })
    : subs[0]?.planName
      ? t("overview.subscription.plan_name", "{{name}} Plan", { name: subs[0].planName })
      : t("overview.subscription.plan_suffix", "Plan");

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
        <HoverCard openDelay={150} closeDelay={100}>
          <HoverCardTrigger asChild>
            {/* Needs a real box (not display:contents) — Radix positions
                HoverCardContent off this element's own bounding rect, and an
                element with no box has nothing to anchor against. h-full
                keeps it matching its StatCard sibling's height in the grid. */}
            <div className="h-full">
              <StatCard
                icon={CreditCardOutlined}
                color="#DB2777" bg="#FDF2F8"
                loading={l2}
                // StatCard's value slot is styled text-2xl/font-black for
                // short numeric metrics — a plan name is a word/phrase, not
                // a number, so it needs its own smaller weight here instead
                // of inheriting that sizing.
                value={<span className="block truncate text-base font-bold text-slate-800">{planLabelText}</span>}
                label={t("pages.subscription.card.current_plan_banner", "Current Plan")}
                href="/company/plans"
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent align="start" className="w-56">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              {t("overview.subscription.remaining_label", "Remaining This Cycle")}
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t("overview.subscription.posts_short", "posts")}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {c?.usage.posts.remaining === -1 ? t("overview.subscription.unlimited_short", "∞") : c?.usage.posts.remaining ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t("overview.subscription.generations_short", "AI gens")}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {c?.usage.postGenerations.remaining === -1 ? t("overview.subscription.unlimited_short", "∞") : c?.usage.postGenerations.remaining ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">{t("overview.subscription.interviews_short", "interviews")}</span>
                <span className="text-sm font-bold tabular-nums text-slate-800">
                  {c?.usage.monthlyInterviews.remaining === -1 ? t("overview.subscription.unlimited_short", "∞") : c?.usage.monthlyInterviews.remaining ?? 0}
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      )}
    </div>
  );
});
HiringStatCards.displayName = "HiringStatCards";
export default HiringStatCards;
