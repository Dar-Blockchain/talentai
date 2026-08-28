"use client";
import React, { memo } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { History as HistoryOutlined } from "lucide-react";
import { KpiCard } from "../KpiAtoms";
import { useCampaignsAnalytics, type CampaignRecentActivityItem } from "../../hooks/useCampaignsAnalytics";
import { CampaignActivityRow } from "./campaignActivityShared";

const WIDGET_LIMIT = 5;

const RowSkeleton = () => (
  <div className="flex items-start gap-3 py-3">
    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
    <div className="flex-1 space-y-1.5 pt-0.5">
      <Skeleton className="h-3.5 w-2/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);

const CampaignRecentActivity = memo(() => {
  const { t } = useTranslation("dashboard");
  const router = useRouter();
  const { data, isLoading } = useCampaignsAnalytics();
  const items: CampaignRecentActivityItem[] = (data?.recentActivity ?? []).slice(0, WIDGET_LIMIT);
  const isEmpty = !isLoading && items.length === 0;

  return (
    <KpiCard
      className="h-full"
      title={t("campaigns_dashboard.recent_activity.title", "Recent Activity")}
      subtitle={t("campaigns_dashboard.recent_activity.subtitle", "Latest campaign completions")}
      headerFilter={!isEmpty && (
        <Button
          variant="ghost" size="xs"
          onClick={() => router.push("/company/campaigns/activity")}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
        >
          {t("campaigns_dashboard.recent_activity.show_all", "Show all")}
        </Button>
      )}
    >
      {isLoading ? (
        <div className="divide-y divide-slate-100">
          {[0, 1, 2, 3].map((i) => <RowSkeleton key={i} />)}
        </div>
      ) : isEmpty ? (
        <div className="h-[180px] flex flex-col items-center justify-center gap-2 text-slate-400">
          <HistoryOutlined size={22} />
          <span className="text-[0.82rem]">{t("campaigns_dashboard.recent_activity.empty", "No completions yet")}</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {items.map((item) => <CampaignActivityRow key={item.id} item={item} />)}
        </div>
      )}
    </KpiCard>
  );
});
CampaignRecentActivity.displayName = "CampaignRecentActivity";
export default CampaignRecentActivity;
