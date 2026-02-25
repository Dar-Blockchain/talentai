"use client";

import React, { useState, useMemo } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { navigation } from "@/constants/navigation";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;
const HEADER_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const breadcrumb = useMemo(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const current = navigation.find((i) => path.includes(i.href));
    return current?.label || "Dashboard";
  }, []);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main content wrapper */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : drawerWidth,
            right: 0,
            height: HEADER_HEIGHT,
            zIndex: 1200,
            width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
            transition: "left 0.3s, width 0.3s",
          }}
        >
          <Header breadcrumb={breadcrumb} onOpenMobile={() => setMobileOpen(true)} />
        </Box>

        {/* Scrollable content container */}
        <Box
          sx={{
            flex: 1,
            mt: `${HEADER_HEIGHT}px`,
            px: 4,
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowY: "auto",
            backgroundColor: "rgb(249 250 251)!important",
            p: 3
          }}
          className="custom-scrollbar"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;