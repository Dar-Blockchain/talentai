"use client";

import React, { useState } from "react";
import { Box, Drawer } from "@mui/material";
import Header from "@/modules/shared/layouts/dashboard/DashboardHeader";
import CandidateQuickNav from "@/modules/shared/layouts/candidate/CandidateQuickNav";

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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "rgb(249 250 251)" }}>
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
        id="main-scroll"
        sx={{
          flex: 1,
          mt: `${HEADER_HEIGHT}px`,
          height: `calc(100vh - ${HEADER_HEIGHT}px)`,
          overflow: fillHeight ? "hidden" : "auto",
          px: { xs: 1.5, sm: 2.5, md: 3 },
          pb: { xs: 1.5, sm: 2.5, md: 3 },
          pt: { xs: 0.5, sm: 1, md: 1 },
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
              alignSelf: { xs: "start", md: "start" },
              mt: { xs: 0, md: 2 },
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
