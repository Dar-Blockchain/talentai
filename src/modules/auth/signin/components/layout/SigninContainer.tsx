import React from "react";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";
import { BrandLeftPanel, AuthPageLayout } from "@/modules/auth/shared";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthPageLayout>
    <div className="flex-1 flex flex-col lg:flex-row">
      <BrandLeftPanel tKey="signin_panel" />
      <AuthRightPanel footerTKey="signin_panel">{children}</AuthRightPanel>
    </div>
  </AuthPageLayout>
);

export default SigninContainer;
