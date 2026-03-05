import React from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import RoleGuard from "@/components/guards/RoleGuard";
import WorkspaceSelector from "@/components/features/workspaces/WorkspaceSelector";

const Workspaces: React.FC = () => {
  return (
    <RoleGuard allowedRoles={["Candidate", "Company"]}>
      <PageContainer>
        <Header />
        <WorkspaceSelector />
      </PageContainer>
    </RoleGuard>
  );
};

export default Workspaces;
