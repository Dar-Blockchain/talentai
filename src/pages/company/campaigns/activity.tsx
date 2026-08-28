import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, History as HistoryOutlined } from "lucide-react";
import PageHeader from "@/modules/shared/layouts/dashboard/PageHeader";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";
import { Button } from "@/modules/shared/ui/shadcn/button";
import { Skeleton } from "@/modules/shared/ui/shadcn/skeleton";
import { fetchRecentCompletions, CampaignActivityCard } from "@/modules/company/dashboard/components/campaigns/campaignActivityShared";
import type { CampaignRecentActivityItem } from "@/modules/company/dashboard/hooks/useCampaignsAnalytics";
import { groupByDay } from "@/utils/dayGrouping";

const PAGE_SIZE = 30;

const CampaignActivityPage: NextPageWithLayout = () => {
  const { t, i18n } = useTranslation("dashboard");
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["campaignActivityPage", limit],
    queryFn: () => fetchRecentCompletions(1, limit),
    staleTime: 30_000,
  });

  const items: CampaignRecentActivityItem[] = data?.activity ?? [];
  const total = data?.pagination?.total ?? 0;
  const groups = useMemo(
    () => groupByDay<CampaignRecentActivityItem>(items, (item) => item.completedAt, t, i18n.language),
    [items, t, i18n.language],
  );
  const isEmpty = !isLoading && items.length === 0;
  const canLoadMore = !isLoading && items.length < total && limit < 100;

  return (
    <>
      <PageHeader
        title={t("pages.campaign_activity.title", "Campaign Activity")}
        subtitle={t("pages.campaign_activity.subtitle", "Every recent campaign completion")}
        breadcrumbs={[
          { label: t("pages.common.dashboard"), href: "/company/dashboard" },
          { label: t("pages.campaign_activity.title", "Campaign Activity") },
        ]}
      />

      <div className="w-full">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((k) => <Skeleton key={k} className="h-[68px] w-full rounded-xl" />)}
          </div>
        ) : isEmpty ? (
          <div className="h-[240px] flex flex-col items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white text-slate-400">
            <HistoryOutlined size={22} />
            <span className="text-[0.85rem]">{t("campaigns_dashboard.recent_activity.empty", "No completions yet")}</span>
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.key}>
                <div className="flex items-center gap-3 mb-2.5">
                  <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wide">{group.label}</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => <CampaignActivityCard key={item.id} item={item} />)}
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
                ? t("pages.campaign_activity.loading", "Loading…")
                : (<>{t("pages.campaign_activity.load_more", "Load more")}<ChevronDown size={14} /></>)}
            </Button>
          </div>
        )}
      </div>
    </>
  );
};
CampaignActivityPage.getLayout = getDashboardLayout;

export default CampaignActivityPage;
