import React from "react";
import PageContainer from "@/components/layout/PageContainer";
import Header from "@/components/layout/Header";
import WorkspaceSelector from "@/components/features/workspaces/WorkspaceSelector";

const Workspaces: React.FC = () => {
  return (
      <PageContainer>
        <Header />
        <WorkspaceSelector />
      </PageContainer>
  );
};

export default Workspaces;
