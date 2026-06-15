import React from "react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => (
  <div className="min-h-dvh w-full bg-white">
    <div className="w-full max-w-333.5 mx-auto px-5 min-h-dvh flex flex-col">
      {children}
    </div>
  </div>
);

export default AuthPageLayout;
