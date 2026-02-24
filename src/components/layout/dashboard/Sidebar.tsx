"use client";

import React, { useCallback } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
  Typography,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { navigation } from "@/constants/navigation";
import { LogoutOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();

  const profile = useSelector(
    (state: RootState) => state.user.connectedUser.profile,
  );
  const companyName = profile?.companyDetails?.name || "Company";
  const companyInitial = companyName[0] || "C";

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleToggleCollapse = useCallback(
    () => setCollapsed((c) => !c),
    [setCollapsed],
  );

  const content = (mobile = false) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box
        sx={{
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          borderBottom: "1px solid #E5E7EB",
          height: 64,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          {/* Logo */}
          {!collapsed && (
            <Box
              sx={{
                backgroundColor: "#141415",
                borderRadius: collapsed && !mobile ? "50%" : "24px",
                width: collapsed && !mobile ? 28 : 115,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
            >
              <Box
                component="img"
                src="/images/home/logocompany.png"
                alt="Company"
                sx={{ height: collapsed && !mobile ? 14 : 20 }}
              />
            </Box>
          )}

          {/* Collapse / Expand Button (Desktop only) */}
          {!mobile && (
            <IconButton
              onClick={handleToggleCollapse}
              size="small"
              sx={{
                color: "#6B7280",
                p: 0.5,
                backgroundColor: "rgba(243, 244, 246, 0.6)!important",
              }}
            >
              {collapsed ? <ChevronRightOutlined /> : <ChevronLeftOutlined />}
            </IconButton>
          )}
        </Box>

        {/* Close button for mobile */}
        {mobile && (
          <IconButton onClick={onCloseMobile} size="small">
            <CloseOutlined sx={{ color: "#6B7280" }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: "auto" }} className="custom-scrollbar">
        <List sx={{ px: 1.5 }}>
          {navigation.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <Link key={item.id} href={item.href} passHref>
                <ListItemButton
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: collapsed && !mobile ? 0.8 : 1,
                    px: collapsed && !mobile ? 1.2 : 2,
                    position: "relative",
                    color: isActive ? "#0D9488" : "#4B5563",
                    bgcolor: isActive
                      ? "rgba(243, 244, 246, 0.6)"
                      : "transparent",
                    justifyContent:
                      collapsed && !mobile ? "center" : "flex-start",
                    transition: "all 0.2s ease",
                    minHeight: collapsed && !mobile ? 40 : "auto",

                    // Left border
                    borderLeft: isActive
                      ? "4px solid #0D9488"
                      : "4px solid transparent",
                    "&:hover": {
                      bgcolor: "rgba(243, 244, 246, 0.6)",
                      color: "#111827",
                      borderLeft: "4px solid #0D9488",
                      "& .MuiListItemIcon-root": { color: "#0D9488" },
                    },
                    "&:focus": {
                      "& .MuiListItemIcon-root": { color: "#0D9488" },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed && !mobile ? 0 : 40,
                      color: isActive ? "#0D9488" : "#6B7280",
                      justifyContent: "center",
                    }}
                  >
                    <item.icon
                      sx={{ fontSize: collapsed && !mobile ? 20 : 24 }}
                    />
                  </ListItemIcon>

                  {(!collapsed || mobile) && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Link>
            );
          })}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #E5E7EB", flexShrink: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            justifyContent: collapsed && !mobile ? "center" : "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "#0D9488", width: 36, height: 36 }}>
              {companyInitial}
            </Avatar>

            {(!collapsed || mobile) && (
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
                  {companyName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                  HR Director
                </Typography>
              </Box>
            )}
          </Box>

          {!collapsed && (
            <IconButton
              size="small"
              sx={{ color: "#6B7280" }}
              onClick={() => {
                console.log("Logout clicked");
              }}
            >
              <LogoutOutlined />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.3s",
              overflowX: "hidden",
              borderRight: "1px solid #E5E7EB",
              display: "flex",
            },
          }}
        >
          {content(false)}
        </Drawer>
      )}
      {isMobile && (
        <Drawer open={mobileOpen} onClose={onCloseMobile}>
          {content(true)}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
