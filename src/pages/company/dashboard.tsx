import React, { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useDashboard } from "@/modules/company/dashboard/hooks/useDashboard";
import KpiStatCards         from "@/modules/company/dashboard/components/KpiStatCards";
import KpiFiltersBar        from "@/modules/company/dashboard/components/KpiFiltersBar";
import KpiActionsToTake     from "@/modules/company/dashboard/components/KpiActionsToTake";
import KpiPostsOverview     from "@/modules/company/dashboard/components/KpiPostsOverview";
import KpiRecruitmentFunnel from "@/modules/company/dashboard/components/KpiRecruitmentFunnel";
import KpiHiringVelocity    from "@/modules/company/dashboard/components/KpiHiringVelocity";
import KpiCandidateQuality  from "@/modules/company/dashboard/components/KpiCandidateQuality";
import KpiRoiSavings        from "@/modules/company/dashboard/components/KpiRoiSavings";
import { DashboardLayout } from "@/modules/shared/layouts";

const EMPTY_POSTS: never[] = [];

const CompanyDashboard = memo(() => {
  const { t } = useTranslation("dashboard");

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
      <div className="min-h-screen bg-slate-50/60">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-2">

          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t("pages.kpi.page_title", "Dashboard")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t("pages.kpi.page_subtitle", "Hiring analytics & recruitment overview")}
            </p>
          </div>

          {/* Top stat cards */}
          <KpiStatCards />

          {/* Filters */}
          <KpiFiltersBar
            postId={postId}
            activeDays={activeDays}
            availablePosts={availablePosts}
            onPostChange={handlePostChange}
            onPeriodChange={handlePeriodChange}
          />

          {/* Actions to take */}
          <KpiActionsToTake
            data={actionsQ.data}
            loading={actionsQ.isLoading}
          />

          {/* Posts overview table */}
          <KpiPostsOverview
            data={postsStatusQ.data}
            loading={postsStatusQ.isLoading}
            page={statusPage}
            onPageChange={handleStatusPageChange}
          />

          {/* Recruitment funnel */}
          <KpiRecruitmentFunnel
            data={funnelQ.data}
            loading={funnelQ.isLoading}
          />

          {/* Hiring velocity */}
          <KpiHiringVelocity
            data={velocityQ.data}
            loading={velocityQ.isLoading}
          />

          {/* Candidate quality */}
          <KpiCandidateQuality
            data={sourcingQ.data}
            loading={sourcingQ.isLoading}
          />

          {/* ROI & savings */}
          <KpiRoiSavings
            data={roiQ.data}
            loading={roiQ.isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
});
CompanyDashboard.displayName = "CompanyDashboard";

export default CompanyDashboard;
