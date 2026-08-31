import React, { useState } from "react";
import { useSelector } from "react-redux";
import ActionNeededBanner  from "./ActionNeededBanner";
import DashboardStats      from "./DashboardStats";
import RecentApplications  from "./RecentApplications";
import SkillsSnapshot      from "./SkillsSnapshot";
import AssessmentModal     from "@/modules/candidate/interviews/components/AssessmentModal";

const CandidateDashboard: React.FC = () => {
  const connectedUser = useSelector((state: any) => state.user.connectedUser);
  const firstName     = connectedUser?.profile?.firstName || connectedUser?.user?.firstName || "";

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-5">

        {firstName && (
          <div>
            <h1 className="text-[1.05rem] font-extrabold text-gray-900 leading-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-[0.75rem] text-gray-400 mt-0.5">
              Here's what's happening with your job search
            </p>
          </div>
        )}

        <ActionNeededBanner />

        <DashboardStats />

        <RecentApplications />

        <SkillsSnapshot onStartInterview={() => setDialogOpen(true)} />

      </div>

      <AssessmentModal open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
};

export default CandidateDashboard;
