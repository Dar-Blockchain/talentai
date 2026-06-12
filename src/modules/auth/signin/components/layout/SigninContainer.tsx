import React from "react";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";
import { BrandLeftPanel } from "@/modules/auth/shared";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-dvh flex flex-col md:flex-row overflow-hidden bg-white">
    <BrandLeftPanel tKey="signin_panel" />
    <AuthRightPanel footerTKey="signin_panel">{children}</AuthRightPanel>
  </div>
);

export default SigninContainer;
