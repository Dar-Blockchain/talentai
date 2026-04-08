"use client";

import React, { useState, useMemo } from "react";
import { Box, useTheme, useMediaQuery, Modal, CircularProgress, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
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
  const isLoggingOut = useSelector(isLoggingOutCheck);

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

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
                Déconnexion en cours…
              </Typography>
              <Typography sx={{ fontSize: "0.8125rem", color: "#94A3B8", mt: 0.5 }}>
                Veuillez patienter
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
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflowY: "auto",
            overflowX: "hidden",
            backgroundColor: "rgb(249 250 251)!important",
            p: { xs: 1.5, sm: 2.5, md: 3 },
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