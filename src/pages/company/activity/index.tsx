import React, { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { fetchRecentActivity, toActivityRows, ActivityCard, type Activity, type ActivityRow } from "@/modules/company/dashboard/components/team/activityShared";
import { groupByDay } from "@/utils/dayGrouping";

const PAGE_SIZE = 30;

const TeamActivityPage: NextPageWithLayout = () => {
  const { t, i18n } = useTranslation("dashboard");
  const router = useRouter();
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["teamActivityPage", limit],
    queryFn: () => fetchRecentActivity(limit),
    staleTime: 30_000,
  });

  const activities: Activity[] = data?.activities ?? [];
  const rows = useMemo(() => toActivityRows(activities, t, i18n.language), [activities, t, i18n.language]);
  const groups = useMemo(
    () => groupByDay<ActivityRow>(rows, (row) => row.createdAt, t, i18n.language),
    [rows, t, i18n.language],
  );
  const isEmpty = !isLoading && rows.length === 0;
  // The feed is capped server-side at 100 — once we've fetched that many and
  // still got a full page back, there's a good chance more exist; once a
  // fetch comes back shorter than requested, that's everything there is.
  const canLoadMore = !isLoading && rows.length >= limit && limit < 100;

  return (
    <>
      <PageHeader
        title={t("pages.team_activity.title", "Team Activity")}
        subtitle={t("pages.team_activity.subtitle", "Every recent member, post and campaign action")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.team_activity.title", "Team Activity") },
        ]}
      />

      <div className="w-full">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6].map((k) => <Skeleton key={k} className="h-11 w-full rounded-lg" />)}
          </div>
        ) : isEmpty ? (
          <div className="h-[240px] flex items-center justify-center rounded-2xl border border-slate-100 bg-white">
            <span className="text-[0.85rem] text-slate-400">{t("team.recent_activity.empty", "No recent activity")}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">{group.label}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="space-y-2">
                  {group.items.map((row) => (
                    <ActivityCard key={row.key} row={row} onNavigate={(href) => router.push(href)} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {canLoadMore && (
          <div className="flex justify-center mt-6">
            <Button
              variant="outline" size="sm"
              onClick={() => setLimit((v) => v + PAGE_SIZE)}
              disabled={isFetching}
              className="gap-1.5"
            >
              {isFetching
                ? t("pages.team_activity.loading", "Loading…")
                : (<>{t("pages.team_activity.load_more", "Load more")}<ChevronDown size={14} /></>)}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
TeamActivityPage.getLayout = getDashboardLayout;

export default TeamActivityPage;
