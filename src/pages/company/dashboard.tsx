import React, { memo, useEffect, useMemo, useRef } from "react";
import { Box } from "@mui/material";
import { useDashboard } from "@/modules/company/dashboard/hooks/useDashboard";
import KpiStatCards         from "@/modules/company/dashboard/components/KpiStatCards";
import KpiFiltersBar        from "@/modules/company/dashboard/components/KpiFiltersBar";
import KpiActionsToTake     from "@/modules/company/dashboard/components/KpiActionsToTake";
import KpiPostsOverview     from "@/modules/company/dashboard/components/KpiPostsOverview";
import KpiRecruitmentFunnel from "@/modules/company/dashboard/components/KpiRecruitmentFunnel";
import KpiHiringVelocity    from "@/modules/company/dashboard/components/KpiHiringVelocity";
import KpiCandidateQuality  from "@/modules/company/dashboard/components/KpiCandidateQuality";
import KpiRoiSavings        from "@/modules/company/dashboard/components/KpiRoiSavings";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const CONTAINER_SX = { maxWidth: 1440, mx: "auto" } as const;
const EMPTY_POSTS:  never[] = [];

const CompanyDashboardContent = memo(() => {

  const pageId = useRef(Math.random().toString(36).slice(2, 8));

useEffect(() => {
  console.log(`DASHBOARD PAGE MOUNT ${pageId.current}`);

  return () => {
    console.log(`DASHBOARD PAGE UNMOUNT ${pageId.current}`);
  };
}, []);
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
  );
});
CompanyDashboardContent.displayName = "CompanyDashboardContent";

const CompanyDashboard: NextPageWithLayout = () => <CompanyDashboardContent />;
CompanyDashboard.getLayout = getDashboardLayout;

export default CompanyDashboard;
