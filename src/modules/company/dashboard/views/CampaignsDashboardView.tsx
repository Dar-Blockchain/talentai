import React, { memo } from "react";
import CampaignsStatCards         from "@/modules/company/dashboard/components/campaigns/CampaignsStatCards";
import CampaignCompletionsTrend   from "@/modules/company/dashboard/components/campaigns/CampaignCompletionsTrend";
import CampaignsStatusOverview    from "@/modules/company/dashboard/components/team/CampaignsStatusOverview";
import CampaignModuleTypeBreakdown from "@/modules/company/dashboard/components/campaigns/CampaignModuleTypeBreakdown";
import CampaignRecentActivity     from "@/modules/company/dashboard/components/campaigns/CampaignRecentActivity";
import CampaignsOverviewTable     from "@/modules/company/dashboard/components/campaigns/CampaignsOverviewTable";

export const CampaignsDashboardContent = memo(() => (
  <div>
    <CampaignsStatCards />
    <div className="mb-6">
      <CampaignCompletionsTrend />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
      <CampaignModuleTypeBreakdown />
      <CampaignsStatusOverview />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch">
      <div className="lg:col-span-2 h-full">
        <CampaignsOverviewTable />
      </div>
      <div className="lg:col-span-1 h-full">
        <CampaignRecentActivity />
      </div>
    </div>
  </div>
));
CampaignsDashboardContent.displayName = "CampaignsDashboardContent";
