"use client";

import React, { useState } from "react";
import { Box, Drawer, Modal, CircularProgress, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { isLoggingOutCheck } from "@/store/slices/authSlice";
import Header from "@/components/layout/dashboard/Header";
import CandidateQuickNav from "@/components/layout/candidate/CandidateQuickNav";

interface CandidateWorkspaceLayoutProps {
  children: React.ReactNode;
  breadcrumb?: string;
  fillHeight?: boolean;
}

const HEADER_HEIGHT = 64;
const NAV_WIDTH = 240;

const CandidateWorkspaceLayout: React.FC<CandidateWorkspaceLayoutProps> = ({
  children,
  breadcrumb,
  fillHeight = false,
}) => {
  const { t } = useTranslation("auth");
  const isLoggingOut = useSelector(isLoggingOutCheck);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
      <Modal open={isLoggingOut} disableAutoFocus>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(6px)",
            gap: 2.5,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              bgcolor: "#fff",
              borderRadius: "20px",
              px: 5,
              py: 4,
              boxShadow: "0 8px 40px rgba(0,0,0,0.12)",
              border: "1px solid #E8EAED",
            }}
          >
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

      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: HEADER_HEIGHT,
          zIndex: 1200,
        }}
      >
        <Header breadcrumb={breadcrumb} onOpenMobile={() => setMobileOpen(true)} />
      </Box>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            p: 2,
            bgcolor: "#F9FAFB",
          },
        }}
      >
        <CandidateQuickNav onNavigate={() => setMobileOpen(false)} />
      </Drawer>

      <Box
        sx={{
          flex: 1,
          mt: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflow: fillHeight ? "hidden" : "auto",
          p: { xs: 1.5, sm: 2.5, md: 3 },
        }}
        className={fillHeight ? undefined : "custom-scrollbar"}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: `1fr ${NAV_WIDTH}px` },
            gap: 2.5,
            alignItems: "start",
            height: fillHeight ? "100%" : "auto",
            minHeight: fillHeight ? 0 : undefined,
          }}
        >
          <Box
            sx={{
              minWidth: 0,
              minHeight: fillHeight ? 0 : undefined,
              height: fillHeight ? "100%" : "auto",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              gridColumn: { xs: "1", md: "1" },
            }}
          >
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <CandidateQuickNav variant="horizontal" />
            </Box>
            <Box
              sx={{
                flex: fillHeight ? 1 : undefined,
                minHeight: fillHeight ? 0 : undefined,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {children}
            </Box>
          </Box>

          <Box
            sx={{
              display: { xs: "none", md: "block" },
              position: "sticky",
              top: 16,
              alignSelf: "start",
              maxHeight: "calc(100vh - 96px)",
              overflowY: "auto",
              gridColumn: { xs: "1", md: "2" },
            }}
            className="custom-scrollbar"
          >
            <CandidateQuickNav />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CandidateWorkspaceLayout;
