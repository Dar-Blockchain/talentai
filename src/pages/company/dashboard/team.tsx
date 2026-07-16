import React, { memo } from "react";
import TeamStatCards          from "@/modules/company/dashboard/components/TeamStatCards";
import TeamGrowthChart        from "@/modules/company/dashboard/components/team/TeamGrowthChart";
import MembersByDepartment    from "@/modules/company/dashboard/components/team/MembersByDepartment";
import CampaignsStatusOverview from "@/modules/company/dashboard/components/team/CampaignsStatusOverview";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

const TeamDashboardContent = memo(() => (
  <div className="max-w-[1440px] mx-auto">
    <TeamStatCards />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      <TeamGrowthChart />
      <CampaignsStatusOverview />
    </div>
    <MembersByDepartment />
  </div>
));
TeamDashboardContent.displayName = "TeamDashboardContent";

const TeamDashboard: NextPageWithLayout = () => <TeamDashboardContent />;
TeamDashboard.getLayout = getDashboardLayout;

export default TeamDashboard;
