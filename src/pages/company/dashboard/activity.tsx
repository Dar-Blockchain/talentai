import React, { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { History as HistoryOutlined } from "lucide-react";
import { Card } from "@/modules/shared/ui/shadcn/card";
import { ZoneHeading } from "@/modules/company/dashboard/components/KpiAtoms";
import ApplicationHistoryRows, { RowSkeleton } from "@/modules/company/dashboard/components/ApplicationHistoryRows";
import { useKpiHistoryInfiniteQuery } from "@/modules/company/dashboard/queries";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const ActivityPage: NextPageWithLayout = () => {
  const { t } = useTranslation("dashboard");

  const {
    data, isLoading, isFetchingNextPage,
    hasNextPage, fetchNextPage,
  } = useKpiHistoryInfiniteQuery({});

  const items      = data?.pages.flatMap((p) => p.data) ?? [];
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite scroll: fetch the next page as soon as the sentinel at the
  // bottom of the list enters the viewport — react-query's own cache keeps
  // already-loaded pages, no manual page state needed.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage();
    }, { rootMargin: "200px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="max-w-225 mx-auto flex flex-col gap-4 sm:gap-6">
      <ZoneHeading icon={HistoryOutlined} label={t("pages.kpi.zone1_title_full", "Recent Activity")} color="#7C3AED" />
      <Card className="rounded-2xl overflow-hidden py-0 gap-0">
        {isLoading ? (
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }, (_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-[13px] text-slate-400">
            {t("pages.kpi.history_empty", "No recent activity yet")}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            <ApplicationHistoryRows items={items} showRail={false} />
          </div>
        )}

        {hasNextPage && (
          <div ref={sentinelRef} className="divide-y divide-slate-100">
            {isFetchingNextPage && <RowSkeleton />}
          </div>
        )}
      </Card>
    </div>
  );
};

ActivityPage.getLayout = getDashboardLayout;

export default ActivityPage;
