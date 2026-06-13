import React from "react";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";
import { BrandLeftPanel, AuthPageLayout } from "@/modules/auth/shared";

const RegisterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthPageLayout>
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      <BrandLeftPanel tKey="register_panel" />
      <AuthRightPanel footerTKey="register_panel" maxWidthClass="max-w-sm sm:max-w-xl lg:max-w-2xl">{children}</AuthRightPanel>
    </div>
  </AuthPageLayout>
);

export default RegisterContainer;
