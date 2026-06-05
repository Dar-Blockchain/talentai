import React from "react";
import { Box, useMediaQuery } from "@mui/material";
import { BrandLeftPanel } from "@/modules/auth/shared";
import AuthRightPanel from "@/modules/auth/shared/components/AuthRightPanel";

const RegisterContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isWideSplit = useMediaQuery("(min-width:1280px)", { noSsr: true });

  return (
    <Box sx={{ minHeight: "100dvh", display: "flex", flexDirection: { xs: "column", custom: "row" }, overflowX: "hidden",
      "@media (min-width:1025px)": { flexDirection: "row" },
    }}>
      <BrandLeftPanel tKey="register_panel" flex={isWideSplit ? "0 0 50%" : "0 0 45%"} />
      <AuthRightPanel footerTKey="register_panel">{children}</AuthRightPanel>
    </Box>
  );
};

export default RegisterContainer;
