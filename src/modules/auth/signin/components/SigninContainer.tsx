import React from "react";
import { Box } from "@mui/material";
import AuthLeftPanel from "./ui/AuthLeftPanel";
import AuthRightPanel from "./ui/AuthRightPanel";

const SigninContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: { xs: "column", md: "row" }, overflowX: "hidden" }}>
    <AuthLeftPanel />
    <AuthRightPanel>{children}</AuthRightPanel>
  </Box>
);

export default SigninContainer;
