import React from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/modules/shared/layouts/dashboard/DashboardLayout";

const KpiStatCards         = dynamic(() => import("@/components/features/company/kpi/KpiStatCards"));
const KpiFiltersBar        = dynamic(() => import("@/components/features/company/kpi/KpiFiltersBar"));
const KpiActionsToTake     = dynamic(() => import("@/components/features/company/kpi/KpiActionsToTake"));
const KpiPostsOverview     = dynamic(() => import("@/components/features/company/kpi/KpiPostsOverview"));
const KpiRecruitmentFunnel = dynamic(() => import("@/components/features/company/kpi/KpiRecruitmentFunnel"));
const KpiHiringVelocity    = dynamic(() => import("@/components/features/company/kpi/KpiHiringVelocity"));
const KpiCandidateQuality  = dynamic(() => import("@/components/features/company/kpi/KpiCandidateQuality"));
const KpiRoiSavings        = dynamic(() => import("@/components/features/company/kpi/KpiRoiSavings"));

const CompanyDashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="max-w-[1440px] mx-auto">
        <KpiStatCards />
        <KpiFiltersBar />
        <KpiActionsToTake />
        <KpiPostsOverview />
        <KpiRecruitmentFunnel />
        <KpiHiringVelocity />
        <KpiCandidateQuality />
        <KpiRoiSavings />
      </div>
    </DashboardLayout>
  );
};

export default CompanyDashboard;
