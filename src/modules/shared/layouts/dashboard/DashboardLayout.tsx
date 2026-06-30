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
  tightenMainPaddingTop?: boolean;
  tightenMainPaddingBottom?: boolean;
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
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1280
  );
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

  useEffect(() => {
    const handleRouteChange = () => setMobileOpen(false);
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router.events]);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const breadcrumb = useMemo(() => {
    const path = typeof window !== "undefined" ? window.location.pathname : "";
    const current = navigation.find((i) => path.includes(i.href));
    return current?.label || "Dashboard";
  }, []);

  const sidebarWidth = isMobile ? 0 : (collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH);

  useEffect(() => {
    document.body.style.setProperty("--layout-sidebar-width", `${sidebarWidth}px`);
  }, [sidebarWidth]);

  return (
    <Box sx={{ display: "flex", height: "100dvh" }}>
      <OnboardingTour />
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: isMobile ? 0 : sidebarWidth,
            right: 0,
            height: HEADER_HEIGHT,
            zIndex: 1200,
            width: isMobile ? "100%" : `calc(100% - ${sidebarWidth}px)`,
            transition: "left 0.3s, width 0.3s",
          }}
        >
          <Header breadcrumb={breadcrumb} mobileOpen={mobileOpen} onOpenMobile={() => setMobileOpen((o) => !o)} />
        </Box>

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
