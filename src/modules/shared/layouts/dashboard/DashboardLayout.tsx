"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import { navigation } from "./navigation";
import { useRouter } from "next/router";
import OnboardingTour from "@/modules/company/tour";


interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Less top padding on the main scroll area (full-height chat, etc.). */
  tightenMainPaddingTop?: boolean;
  /** Less bottom padding so full-height chat uses more of the viewport. */
  tightenMainPaddingBottom?: boolean;
  /**
   * Main column becomes a flex viewport (overflow hidden); children use flex:1 to fill under the header.
   * Use with team messages + `chatDashboardShellFlexSx` so chat reaches the bottom with no dead gap.
   */
  fillMainHeight?: boolean;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const HEADER_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tightenMainPaddingTop = false,
  tightenMainPaddingBottom = false,
  fillMainHeight = false,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

const layoutId = useRef(Math.random().toString(36).slice(2, 8));

useEffect(() => {
  return () => {
  };
}, []);

  useEffect(() => {
    navigation.forEach((item) => router.prefetch(item.href));
  }, [router]);

  // Close mobile sidebar on every navigation
  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallDesktop = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const breadcrumb = useMemo(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const current = navigation.find((i) => path.includes(i.href));
    return current?.label || "Dashboard";
  }, []);

  const effectiveCollapsed = collapsed || isSmallDesktop;
  const drawerWidth = effectiveCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  useEffect(() => {
    document.body.style.setProperty(
      "--layout-sidebar-width",
      isMobile ? "0px" : `${drawerWidth}px`
    );
  }, [drawerWidth, isMobile]);

  return (
    <Box sx={{ display: "flex", height: "100dvh" }}>
      <OnboardingTour />
      {/* Sidebar */}
      <Sidebar
        collapsed={effectiveCollapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main content wrapper */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
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

        {/* Main content: scrollable dashboard pages, or flex viewport for full-height chat */}
        <DashboardMain
          fillMainHeight={fillMainHeight}
          tightenMainPaddingTop={tightenMainPaddingTop}
          tightenMainPaddingBottom={tightenMainPaddingBottom}
        >
          {children}
        </DashboardMain>
      </Box>
    </Box>
  );
};

export default DashboardLayout;