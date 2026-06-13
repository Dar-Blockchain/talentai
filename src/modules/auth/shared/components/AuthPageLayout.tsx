import React from "react";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

const AuthPageLayout: React.FC<AuthPageLayoutProps> = ({ children }) => (
  <div className="h-dvh w-full bg-white overflow-hidden">
    <div className="w-full max-w-333.5 mx-auto px-5 h-full flex flex-col">
      {children}
    </div>
  </div>
);

export default AuthPageLayout;
