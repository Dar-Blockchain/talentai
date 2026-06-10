import React, { memo, useMemo } from "react";
import { Box } from "@mui/material";
import DashboardLayout from "@/components/layout/dashboard/DashboardLayout";
import { useDashboard } from "@/modules/company/dashboard/hooks/useDashboard";
import KpiStatCards         from "@/modules/company/dashboard/components/KpiStatCards";
import KpiFiltersBar        from "@/modules/company/dashboard/components/KpiFiltersBar";
import KpiActionsToTake     from "@/modules/company/dashboard/components/KpiActionsToTake";
import KpiPostsOverview     from "@/modules/company/dashboard/components/KpiPostsOverview";
import KpiRecruitmentFunnel from "@/modules/company/dashboard/components/KpiRecruitmentFunnel";
import KpiHiringVelocity    from "@/modules/company/dashboard/components/KpiHiringVelocity";
import KpiCandidateQuality  from "@/modules/company/dashboard/components/KpiCandidateQuality";
import KpiRoiSavings        from "@/modules/company/dashboard/components/KpiRoiSavings";

const CONTAINER_SX = { maxWidth: 1440, mx: "auto" } as const;
const EMPTY_POSTS:  never[] = [];

const CompanyDashboard = memo(() => {
  const {
    postId, activeDays,
    statusPage, handlePostChange, handlePeriodChange, handleStatusPageChange,
    actionsQ, funnelQ, velocityQ, sourcingQ, roiQ, postsQ, postsStatusQ,
  } = useDashboard();

  const availablePosts = useMemo(
    () => (Array.isArray(postsQ.data) ? postsQ.data : EMPTY_POSTS),
    [postsQ.data],
  );

  return (
    <DashboardLayout>
      <Box sx={CONTAINER_SX}>
        <KpiStatCards />
        <KpiFiltersBar
          postId={postId}
          activeDays={activeDays}
          availablePosts={availablePosts}
          onPostChange={handlePostChange}
          onPeriodChange={handlePeriodChange}
        />
        <KpiActionsToTake
          data={actionsQ.data}
          loading={actionsQ.isLoading}
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
        <KpiHiringVelocity
          data={velocityQ.data}
          loading={velocityQ.isLoading}
        />
        <KpiCandidateQuality
          data={sourcingQ.data}
          loading={sourcingQ.isLoading}
        />
        <KpiRoiSavings
          data={roiQ.data}
          loading={roiQ.isLoading}
        />
      </Box>
    </DashboardLayout>
  );
});
CompanyDashboard.displayName = "CompanyDashboard";

export default CompanyDashboard;
