"use client";
import React, { memo, useMemo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { KpiCard } from "../KpiAtoms";
import { fetchRecentActivity, toActivityRows, ActivityCard, type Activity } from "./activityShared";

const STALE = 60_000;
const WIDGET_LIMIT = 6;

const RecentActivity = memo(() => {
  const { t, i18n } = useTranslation("dashboard");
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["teamDashboard", "recentActivity", WIDGET_LIMIT],
    queryFn: () => fetchRecentActivity(WIDGET_LIMIT),
    staleTime: STALE,
  });

  const activities: Activity[] = data?.activities ?? [];
  const isEmpty = activities.length === 0;

  const rows = useMemo(() => toActivityRows(activities, t, i18n.language), [activities, t, i18n.language]);

  return (
    <KpiCard
      title={t("team.recent_activity.title", "Recent Activity")}
      subtitle={t("team.recent_activity.subtitle", "Latest member, post and campaign activity")}
      headerFilter={!isLoading && !isEmpty && (
        <Button
          variant="ghost" size="xs"
          onClick={() => router.push("/company/activity")}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
        >
          {t("team.recent_activity.show_all", "Show all")}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="space-y-1.5">
          {[1, 2, 3, 4].map((k) => <Skeleton key={k} className="h-9 w-full rounded-lg" />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex items-center justify-center">
          <span className="text-[0.82rem] text-slate-400">{t("team.recent_activity.empty", "No recent activity")}</span>
        </div>
      ) : (
        <div className="space-y-1.5">
          {rows.map((row) => (
            <ActivityCard key={row.key} row={row} onNavigate={(href) => router.push(href)} />
          ))}
        </div>
      )}
    </KpiCard>
  );
});
RecentActivity.displayName = "RecentActivity";
export default RecentActivity;
