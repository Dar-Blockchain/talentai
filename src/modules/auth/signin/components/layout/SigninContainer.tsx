import React from "react";
import { Box } from "@mui/material";
import { BrandLeftPanel } from "@/modules/auth/shared";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: { xs: "column", md: "row" }, overflowX: "hidden" }}>
    <BrandLeftPanel tKey="signin_panel" />
    <AuthRightPanel footerTKey="signin_panel">{children}</AuthRightPanel>
  </Box>
);

export default SigninContainer;
