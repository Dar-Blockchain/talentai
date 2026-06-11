"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Box, useTheme, useMediaQuery, Modal, CircularProgress, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import { useTranslation } from "react-i18next";
import Sidebar from "./DashboardSidebar";
import Header from "./DashboardHeader";
import DashboardMain from "./DashboardMain";
import { navigation } from "@/constants/navigation";
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
const COLLAPSED_WIDTH = 72;
const HEADER_HEIGHT = 64;

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tightenMainPaddingTop = false,
  tightenMainPaddingBottom = false,
  fillMainHeight = false,
}) => {
  const { t } = useTranslation("auth");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggingOut = useSelector(isLoggingOutCheck);
  const router = useRouter();

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
      {/* Logout loading modal */}
      <Modal open={isLoggingOut} disableAutoFocus>
        <Box sx={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          bgcolor: "rgba(255,255,255,0.85)", backdropFilter: "blur(6px)",
          gap: 2.5,
        }}>
          <Box sx={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            bgcolor: "#fff", borderRadius: "20px", px: 5, py: 4,
            boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
            border: "1px solid #E8EAED",
          }}>
            <CircularProgress size={40} sx={{ color: "#8310FF" }} />
            <Box sx={{ textAlign: "center" }}>
              <Typography sx={{ fontWeight: 700, fontSize: "1rem", color: "#0F172A" }}>
                {t("logout.signing_out")}
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.5 }}>
                {t("logout.please_wait")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
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