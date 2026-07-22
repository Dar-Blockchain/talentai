import React, { memo, useMemo } from "react";
import { useDashboard } from "@/modules/company/dashboard/hooks/useDashboard";
import HiringStatCards      from "@/modules/company/dashboard/components/HiringStatCards";
import KpiFiltersBar        from "@/modules/company/dashboard/components/KpiFiltersBar";
import KpiApplicationHistory from "@/modules/company/dashboard/components/KpiApplicationHistory";
import KpiPostsOverview     from "@/modules/company/dashboard/components/KpiPostsOverview";
import KpiRecruitmentFunnel from "@/modules/company/dashboard/components/KpiRecruitmentFunnel";
import KpiJobsByDepartment  from "@/modules/company/dashboard/components/KpiJobsByDepartment";
import KpiCandidateQuality  from "@/modules/company/dashboard/components/KpiCandidateQuality";
import KpiManualVsTalentAiSection from "@/modules/company/dashboard/components/KpiManualVsTalentAiSection";
import { useIsHR } from "@/modules/company/dashboard/hooks/useIsHR";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const EMPTY_POSTS: never[] = [];

const HiringDashboardContent = memo(() => {

  const {
    postId, activeDays,
    statusPage, sortBy, sortDir,
    handlePostChange, handlePeriodChange, handleStatusPageChange, handleSortChange,
    historyQ, funnelQ, sourcingQ, postsQ, postsStatusQ,
    statCardsQ, appMetricsQ,
  } = useDashboard();

  const isHR = useIsHR();

  const availablePosts = useMemo(
    () => (Array.isArray(postsQ.data) ? postsQ.data : EMPTY_POSTS),
    [postsQ.data],
  );

  return (
      <div className="max-w-[1440px] mx-auto flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-3">
          <KpiFiltersBar
            postId={postId}
            activeDays={activeDays}
            availablePosts={availablePosts}
            onPostChange={handlePostChange}
            onPeriodChange={handlePeriodChange}
          />
          <HiringStatCards
            stats={statCardsQ.data}
            appMetrics={appMetricsQ.data}
            loadingStats={statCardsQ.isLoading}
            loadingAppMetrics={appMetricsQ.isLoading}
          />
        </div>
        {isHR ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            <div className="flex flex-col">
              <KpiRecruitmentFunnel
                data={funnelQ.data}
                loading={funnelQ.isLoading}
              />
            </div>
            <div className="flex flex-col">
              <KpiJobsByDepartment />
            </div>
          </div>
        ) : (
          <div>
            <KpiRecruitmentFunnel
              data={funnelQ.data}
              loading={funnelQ.isLoading}
            />
          </div>
        )}
        <div>
          <KpiPostsOverview
            data={postsStatusQ.data}
            loading={postsStatusQ.isLoading}
            page={statusPage}
            onPageChange={handleStatusPageChange}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={handleSortChange}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">
          <div className="flex flex-col">
            <KpiApplicationHistory
              data={historyQ.data}
              loading={historyQ.isLoading}
            />
          </div>
          <div className="flex flex-col">
            <KpiCandidateQuality
              data={sourcingQ.data}
              loading={sourcingQ.isLoading}
            />
          </div>
        </div>
        <div>
          <KpiManualVsTalentAiSection postId={postId} />
        </div>
      </div>
  );
});
HiringDashboardContent.displayName = "HiringDashboardContent";

const HiringDashboard: NextPageWithLayout = () => <HiringDashboardContent />;
HiringDashboard.getLayout = getDashboardLayout;

export default HiringDashboard;
