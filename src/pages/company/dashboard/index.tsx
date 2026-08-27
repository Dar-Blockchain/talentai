import React from "react";
import { useRouter } from "next/router";
import { Target, Users2, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/modules/shared/ui/shadcn/tabs";
import { HiringDashboardContent } from "@/modules/company/dashboard/views/HiringDashboardView";
import { TeamDashboardContent } from "@/modules/company/dashboard/views/TeamDashboardView";
import { CampaignsDashboardContent } from "@/modules/company/dashboard/views/CampaignsDashboardView";
import { getDashboardLayout } from "@/modules/shared/layouts";
import type { NextPageWithLayout } from "@/pages/_app";

type DashboardTab = "hiring" | "team" | "campaigns";
const VALID_TABS: DashboardTab[] = ["hiring", "team", "campaigns"];

const TAB_TRIGGER_CN =
  "gap-1.5 px-2.5 text-[13px] font-semibold text-[#9CA3AF] data-[state=active]:text-[#10453F]";

const CompanyDashboard: NextPageWithLayout = () => {
  const router = useRouter();
  const queryTab = router.query.tab as string | undefined;
  const activeTab: DashboardTab = VALID_TABS.includes(queryTab as DashboardTab)
    ? (queryTab as DashboardTab)
    : "hiring";

  const setActiveTab = (tab: DashboardTab) =>
    router.push({ pathname: router.pathname, query: { tab } }, undefined, { shallow: true });

  return (
    <div className="max-w-[1440px] mx-auto flex flex-col gap-4 sm:gap-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DashboardTab)}>
        <TabsList variant="line" className="h-9 gap-1 p-0">
          <TabsTrigger value="hiring" className={TAB_TRIGGER_CN}>
            <Target size={14} /> Hiring
          </TabsTrigger>
          <TabsTrigger value="team" className={TAB_TRIGGER_CN}>
            <Users2 size={14} /> Team
          </TabsTrigger>
          <TabsTrigger value="campaigns" className={TAB_TRIGGER_CN}>
            <BarChart3 size={14} /> Campaigns
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "hiring" ? (
        <HiringDashboardContent />
      ) : activeTab === "team" ? (
        <TeamDashboardContent />
      ) : (
        <CampaignsDashboardContent />
      )}
    </div>
  );
};
CompanyDashboard.getLayout = getDashboardLayout;

export default CompanyDashboard;
