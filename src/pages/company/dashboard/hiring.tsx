import React, { memo, useMemo } from "react";
import { useDashboard } from "@/modules/company/dashboard/hooks/useDashboard";
import HiringStatCards      from "@/modules/company/dashboard/components/HiringStatCards";
import KpiFiltersBar        from "@/modules/company/dashboard/components/KpiFiltersBar";
import KpiApplicationHistory from "@/modules/company/dashboard/components/KpiApplicationHistory";
import KpiPostsOverview     from "@/modules/company/dashboard/components/KpiPostsOverview";
import KpiRecruitmentFunnel from "@/modules/company/dashboard/components/KpiRecruitmentFunnel";
import KpiCandidateQuality  from "@/modules/company/dashboard/components/KpiCandidateQuality";
import KpiRoiSavings        from "@/modules/company/dashboard/components/KpiRoiSavings";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EMPTY_POSTS: never[] = [];

const HiringDashboardContent = memo(() => {

  const {
    postId, activeDays,
    statusPage, handlePostChange, handlePeriodChange, handleStatusPageChange,
    historyQ, funnelQ, sourcingQ, roiQ, postsQ, postsStatusQ,
    statCardsQ, appMetricsQ,
  } = useDashboard();

  const availablePosts = useMemo(
    () => (Array.isArray(postsQ.data) ? postsQ.data : EMPTY_POSTS),
    [postsQ.data],
  );

  return (
      <div className="max-w-[1440px] mx-auto">
        <HiringStatCards
          stats={statCardsQ.data}
          appMetrics={appMetricsQ.data}
          loadingStats={statCardsQ.isLoading}
          loadingAppMetrics={appMetricsQ.isLoading}
        />
        <KpiFiltersBar
          postId={postId}
          activeDays={activeDays}
          availablePosts={availablePosts}
          onPostChange={handlePostChange}
          onPeriodChange={handlePeriodChange}
        />
        <KpiApplicationHistory
          data={historyQ.data}
          loading={historyQ.isLoading}
        />
        <KpiPostsOverview
          data={postsStatusQ.data}
          loading={postsStatusQ.isLoading}
          page={statusPage}
          onPageChange={handleStatusPageChange}
        />
        <KpiRecruitmentFunnel
          data={funnelQ.data}
          loading={funnelQ.isLoading}
        />
        <KpiCandidateQuality
          data={sourcingQ.data}
          loading={sourcingQ.isLoading}
        />
        <KpiRoiSavings
          data={roiQ.data}
          loading={roiQ.isLoading}
        />
      </div>
  );
});
HiringDashboardContent.displayName = "HiringDashboardContent";

const HiringDashboard: NextPageWithLayout = () => <HiringDashboardContent />;
HiringDashboard.getLayout = getDashboardLayout;

export default HiringDashboard;
