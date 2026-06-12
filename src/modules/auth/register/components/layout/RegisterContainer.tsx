import React from "react";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";
import { BrandLeftPanel } from "@/modules/auth/shared";

const RegisterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="h-dvh flex flex-col md:flex-row overflow-hidden bg-white">
    <BrandLeftPanel tKey="register_panel" />
    <AuthRightPanel footerTKey="register_panel" maxWidthClass="max-w-sm sm:max-w-xl lg:max-w-2xl">{children}</AuthRightPanel>
  </div>
);

export default RegisterContainer;
