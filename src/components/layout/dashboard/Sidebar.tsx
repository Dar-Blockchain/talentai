"use client";

import React, { useCallback } from "react";
import {
  Box,
  Drawer,
  IconButton,
  Avatar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { logout } from "@/store/slices/authSlice";
import { navigation } from "@/constants/navigation";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import { useRouter } from "next/router";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const DRAWER_WIDTH    = 248;
const COLLAPSED_WIDTH = 68;
const TEAL            = "#0D9488";

const GROUPS = [
  { label: "",        ids: ["dashboard"] },
  { label: "Jobs",    ids: ["posts", "applications"] },
  { label: "Account", ids: ["settings"] },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const handleLogout = useCallback(async () => {
    await dispatch(logout());
    router.push("/signin");
  }, [dispatch, router]);

  const profile       = useSelector((state: RootState) => state.user.connectedUser.profile);
  const companyName   = profile?.companyDetails?.name || "Company";
  const companyEmail  = profile?.companyDetails?.email || "";
  const initial       = companyName[0]?.toUpperCase() || "C";
  const avatarUrl     = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : null;

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleToggle = useCallback(() => setCollapsed((c) => !c), [setCollapsed]);

  const content = (mobile = false) => {
    const isCollapsed = collapsed && !mobile;

    return (
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#FAFAFA" }}>

        {/* ── Logo bar ── */}
        <Box sx={{
          height: 64, px: 2, display: "flex", alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          borderBottom: "1px solid #E5E7EB", flexShrink: 0, bgcolor: "#fff",
        }}>
          {!isCollapsed && (
            <Box sx={{
              bgcolor: "#141415", borderRadius: "14px",
              width: 110, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Box component="img" src="/images/home/logocompany.png" alt="TalentAI" sx={{ height: 20 }} />
            </Box>
          )}

          {/* Collapse toggle (desktop) */}
          {!mobile && (
            <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={{
                  width: 28, height: 28, borderRadius: "8px",
                  bgcolor: "#F3F4F6", color: "#6B7280",
                  border: "1px solid #E5E7EB",
                  "&:hover": { bgcolor: "#E5E7EB", color: "#111827" },
                  transition: "all 0.15s",
                }}
              >
                {isCollapsed ? <ChevronRightOutlined sx={{ fontSize: 16 }} /> : <ChevronLeftOutlined sx={{ fontSize: 16 }} />}
              </IconButton>
            </Tooltip>
          )}

          {/* Close (mobile) */}
          {mobile && (
            <IconButton onClick={onCloseMobile} size="small" sx={{ color: "#6B7280" }}>
              <CloseOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          )}
        </Box>

        {/* ── Nav ── */}
        <Box sx={{ flex: 1, overflowY: "auto", py: 1.5 }} className="custom-scrollbar">
          {GROUPS.map((group, gi) => {
            const items = navigation.filter((i) => group.ids.includes(i.id));
            if (items.length === 0) return null;

            return (
              <Box key={group.label || gi} sx={{ mb: 0.5 }}>
                {/* Section label */}
                {group.label && !isCollapsed && (
                  <Typography sx={{
                    px: 2.5, pt: gi === 0 ? 0 : 1, pb: 0.5,
                    fontSize: "0.6rem", fontWeight: 800, color: "#9CA3AF",
                    textTransform: "uppercase", letterSpacing: "0.12em",
                  }}>
                    {group.label}
                  </Typography>
                )}

                {/* Divider between groups */}
                {gi > 0 && (
                  <Box sx={{ mx: 2, mb: 1, height: "1px", bgcolor: "#E5E7EB" }} />
                )}

                <Box sx={{ px: 1.5, display: "flex", flexDirection: "column", gap: 0.25 }}>
                  {items.map((item) => {
                    const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + "/");

                    const btn = (
                      <Link key={item.id} href={item.href} passHref style={{ textDecoration: "none" }}>
                        <Box
                          data-tour={`nav-${item.id}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isCollapsed ? 0 : 1.5,
                            px: isCollapsed ? 0 : 1.5,
                            py: 0.9,
                            borderRadius: "10px",
                            justifyContent: isCollapsed ? "center" : "flex-start",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            bgcolor: isActive ? `${TEAL}12` : "transparent",
                            color: isActive ? TEAL : "#4B5563",
                            position: "relative",
                            "&:hover": {
                              bgcolor: isActive ? `${TEAL}18` : "#F3F4F6",
                              color: isActive ? TEAL : "#111827",
                              "& .nav-icon": {
                                color: isActive ? TEAL : "#374151",
                                bgcolor: isActive ? `${TEAL}15` : "#EBEBEB",
                              },
                            },
                          }}
                        >
                          {/* Active indicator pill */}
                          {isActive && (
                            <Box sx={{
                              position: "absolute", left: 0, top: "18%", bottom: "18%",
                              width: 3, borderRadius: "0 4px 4px 0", bgcolor: TEAL,
                            }} />
                          )}

                          {/* Icon */}
                          <Box className="nav-icon" sx={{
                            display: "flex", alignItems: "center", justifyContent: "center",
                            width: isCollapsed ? 38 : 32, height: isCollapsed ? 38 : 32,
                            borderRadius: "10px", flexShrink: 0,
                            bgcolor: isActive ? `${TEAL}15` : "transparent",
                            color: isActive ? TEAL : "#9CA3AF",
                            boxShadow: isActive ? `0 0 0 1px ${TEAL}22` : "none",
                            transition: "all 0.15s",
                          }}>
                            <item.icon sx={{ fontSize: isCollapsed ? 20 : 18, strokeWidth: isActive ? 1 : 0 }} />
                          </Box>

                          {/* Label */}
                          {!isCollapsed && (
                            <Typography sx={{
                              fontSize: "13px", fontWeight: isActive ? 700 : 500,
                              color: "inherit", lineHeight: 1, letterSpacing: "0.01em",
                            }}>
                              {item.label}
                            </Typography>
                          )}
                        </Box>
                      </Link>
                    );

                    return isCollapsed ? (
                      <Tooltip key={item.id} title={item.label} placement="right" arrow>
                        <span>{btn}</span>
                      </Tooltip>
                    ) : btn;
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Footer ── */}
        <Box sx={{
          px: 1.5, py: 1.5, borderTop: "1px solid #E5E7EB", flexShrink: 0, bgcolor: "#fff",
        }}>
          {/* User row */}
          <Box
            onClick={() => router.push("/company/settings")}
            sx={{
              display: "flex", alignItems: "center",
              gap: isCollapsed ? 0 : 1.25,
              px: isCollapsed ? 0 : 1.25, py: 0.875,
              borderRadius: "10px", cursor: "pointer",
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.15s",
              "&:hover": { bgcolor: "#F3F4F6" },
            }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                bgcolor: TEAL, width: 32, height: 32,
                fontSize: "13px", fontWeight: 700, flexShrink: 0,
              }}
            >
              {initial}
            </Avatar>

            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
                  {companyName}
                </Typography>
                {companyEmail && (
                  <Typography noWrap sx={{ fontSize: "10px", color: "#9CA3AF", lineHeight: 1.3 }}>
                    {companyEmail}
                  </Typography>
                )}
              </Box>
            )}

            {!isCollapsed && (
              <Tooltip title="Sign out">
                <IconButton
                  size="small"
                  onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                  sx={{
                    color: "#9CA3AF", width: 28, height: 28, borderRadius: "7px",
                    flexShrink: 0,
                    "&:hover": { bgcolor: "#FEF2F2", color: "#EF4444" },
                    transition: "all 0.15s",
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
              overflowX: "hidden",
              borderRight: "1px solid #E5E7EB",
              boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
            },
          }}
        >
          {content(false)}
        </Drawer>
      )}
      {isMobile && (
        <Drawer
          open={mobileOpen}
          onClose={onCloseMobile}
          sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH, borderRight: "1px solid #E5E7EB" } }}
        >
          {content(true)}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
