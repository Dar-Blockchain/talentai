import React, { memo } from "react";
import TeamStatCards          from "@/modules/company/dashboard/components/TeamStatCards";
import MembersByDepartment    from "@/modules/company/dashboard/components/team/MembersByDepartment";
import RecentActivity         from "@/modules/company/dashboard/components/team/RecentActivity";
import RolesBreakdown         from "@/modules/company/dashboard/components/team/RolesBreakdown";
import PendingInvitations     from "@/modules/company/dashboard/components/team/PendingInvitations";
import PermissionsMatrix      from "@/modules/company/dashboard/components/team/PermissionsMatrix";
import { useIsHR } from "@/modules/company/dashboard/hooks/useIsHR";

export const TeamDashboardContent = memo(() => {
  const isHR = useIsHR();

  return (
    <div>
      <TeamStatCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <PendingInvitations />
        <RecentActivity />
      </div>

      <div className={isHR ? "grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6" : "mb-6"}>
        <MembersByDepartment />
        {isHR && <RolesBreakdown />}
      </div>

      {isHR && <PermissionsMatrix />}
    </div>
  );
});
TeamDashboardContent.displayName = "TeamDashboardContent";
