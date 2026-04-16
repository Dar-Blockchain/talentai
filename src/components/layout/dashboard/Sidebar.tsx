"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { navigation, employeeNavGroups, EmployeeNavItem } from "@/constants/navigation";
import { selectEmployeePermissions, fetchEmployeePermissions } from "@/store/slices/memberSlice";
import { LogoutOutlined } from "@mui/icons-material";
import { useRouter } from "next/router";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import LogoutProgressModal from "@/components/ui/LogoutProgressModal";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 64;
const TEAL = "#0D9488";
const TEAL_LIGHT = "#14B8A6";

// Dark sidebar palette — teal-tinted navy, matches brand
const BG = "#0D1B2A"; // deep navy-teal
const BG_TOP = "#091422"; // logo bar + footer (deeper)
const BORDER = "#1E3448"; // border
const ICO_CLR = "#a3aed1"; // inactive icon — clear teal-blue
const TXT_CLR = "#a3aed1"; // inactive label — readable teal-blue
const HOVER_BG = "#162840"; // hover row
const HOVER_TXT = "#E8F6F9"; // hover text — near white
const LABEL_C = "#a3aed1"; // section label — visible

const GROUPS = [
  { label: "MAIN", ids: ["dashboard"] },
  { label: "JOBS", ids: ["posts", "applications"] },
  { label: "ACCOUNT", ids: ["settings"] },
];

const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  onCloseMobile,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await dispatch(logout());
    router.push("/signin");
  }, [dispatch, router]);

  const profile           = useSelector((state: RootState) => state.user.connectedUser.profile);
  const user              = useSelector((state: RootState) => state.user.connectedUser.user);
  const companyMembership = useSelector((state: RootState) => state.user.connectedUser.companyMembership);
  const employeePermissions = useSelector(selectEmployeePermissions);

  const isEmployee  = user?.role === "Employee";
  const companyName = companyMembership?.company?.profile?.companyDetails?.name
    || companyMembership?.company?.username
    || null;

  // Fetch permissions on reload if not yet in store
  useEffect(() => {
    if (isEmployee && !employeePermissions && user?._id) {
      dispatch(fetchEmployeePermissions(user._id));
    }
  }, [isEmployee, employeePermissions, user?._id]);

  // Build filtered groups for employees
  const activeEmployeeGroups = employeeNavGroups.map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.permission || !!employeePermissions?.[item.permission]
    ),
  })).filter((group) => group.items.length > 0);

  const displayName = (() => {
    if (user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate") {
      const full = `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
      return full || user?.username || "Employee";
    }
    return profile?.companyDetails?.name || "Company";
  })();
  const displayInitial = displayName[0]?.toUpperCase() || "E";
  const displayEmail = user?.role === "Employee" || user?.role === "Admin" || user?.role === "Candidate"
    ? user?.email
    : profile?.companyDetails?.email;

  const companyEmail = profile?.companyDetails?.email || "";
  const initial = companyName[0]?.toUpperCase() || "C";
  const avatarUrl = profile?.user_image
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${profile.user_image}`
    : null;

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;
  const handleToggle = useCallback(
    () => setCollapsed((c) => !c),
    [setCollapsed],
  );

  const content = (mobile = false) => {
    const isCollapsed = collapsed && !mobile;

    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: BG,
        }}
      >
        {/* ── Logo bar ── */}
        <Box
          sx={{
            height: 64,
            px: isCollapsed ? 0 : 2,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            bgcolor: BG_TOP,
            borderBottom: `1px solid ${BORDER}`,
            flexShrink: 0,
          }}
        >
          {/* Logo — only visible when expanded */}
          {!isCollapsed && (
            <Box
              component="img"
              src="/images/home/logocompany.png"
              alt="TalentAI"
              sx={{ height: 20 }}
            />
          )}

          {/* Collapse toggle */}
          {!mobile && !isCollapsed && (
            <Tooltip title="Collapse" placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "7px",
                  bgcolor: BORDER,
                  color: ICO_CLR,
                  "&:hover": { bgcolor: HOVER_BG, color: HOVER_TXT },
                  transition: "all 0.15s",
                }}
              >
                <ChevronLeftOutlined sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          )}

          {/* Expand float */}
          {!mobile && isCollapsed && (
            <Tooltip title="Expand" placement="right">
              <IconButton
                onClick={handleToggle}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  bgcolor: BORDER,
                  color: ICO_CLR,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    bgcolor: HOVER_BG,
                    color: HOVER_TXT,
                  },
                  transition: "all 0.15s",
                }}
              >
                <ChevronRightOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          {mobile && (
            <IconButton
              onClick={onCloseMobile}
              size="small"
              sx={{ color: ICO_CLR }}
            >
              <CloseOutlined sx={{ fontSize: 17 }} />
            </IconButton>
          )}
        </Box>

        {/* ── Nav ── */}
        <Box
          sx={{ flex: 1, overflowY: "auto", py: 2, px: 1 }}
          className="custom-scrollbar"
        >
          {GROUPS.map((group, gi) => {
            const items = navigation.filter((i) => group.ids.includes(i.id));
            if (items.length === 0) return null;

            return (
              <Box key={group.label || gi} sx={{ mb: 1.5 }}>
                {group.label && !isCollapsed && (
                  <Typography
                    sx={{
                      px: 1.25,
                      pt: gi === 0 ? 0 : 0.5,
                      pb: 0.5,
                      opacity: 0.5,
                      fontSize: "9px",
                      fontWeight: 700,
                      color: LABEL_C,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                    }}
                  >
                    {group.label}
                  </Typography>
                )}

                {gi > 0 && isCollapsed && (
                  <Box
                    sx={{
                      mx: "auto",
                      mb: 1.5,
                      width: 24,
                      height: "1px",
                      bgcolor: BORDER,
                    }}
                  />
                )}

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}
                >
                  {items.map((item) => {
                    const isActive =
                      router.pathname === item.href ||
                      router.pathname.startsWith(item.href + "/");

                    const btn = (
                      <Link
                        key={item.id}
                        href={item.href}
                        passHref
                        style={{ textDecoration: "none" }}
                      >
                        <Box
                          data-tour={`nav-${item.id}`}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: isCollapsed ? 0 : 1.25,
                            px: isCollapsed ? 0 : 1.25,
                            py: isCollapsed ? 0 : 0.875,
                            height: isCollapsed ? 42 : "auto",
                            borderRadius: "9px",
                            justifyContent: isCollapsed
                              ? "center"
                              : "flex-start",
                            cursor: "pointer",
                            transition: "all 0.12s",
                            position: "relative",
                            bgcolor: isActive ? `${TEAL}22` : "transparent",
                            color: isActive ? TEAL_LIGHT : TXT_CLR,
                            "&:hover": {
                              bgcolor: isActive ? `${TEAL}28` : HOVER_BG,
                              color: isActive ? TEAL_LIGHT : HOVER_TXT,
                              "& .nav-icon": {
                                color: isActive ? TEAL_LIGHT : HOVER_TXT,
                              },
                            },
                          }}
                        >
                          {/* Active bar */}
                          {isActive && (
                            <Box
                              sx={{
                                position: "absolute",
                                left: 0,
                                top: "20%",
                                bottom: "20%",
                                width: 3,
                                borderRadius: "0 3px 3px 0",
                                bgcolor: TEAL_LIGHT,
                              }}
                            />
                          )}

                          {/* Icon */}
                          <Box
                            className="nav-icon"
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: isCollapsed ? 38 : 28,
                              height: isCollapsed ? 38 : 28,
                              borderRadius: "8px",
                              flexShrink: 0,
                              color: isActive ? TEAL_LIGHT : ICO_CLR,
                              transition: "color 0.12s",
                            }}
                          >
                            <item.icon
                              sx={{ fontSize: isCollapsed ? 18 : 16 }}
                            />
                          </Box>

                          {/* Label */}
                          {!isCollapsed && (
                            <Typography
                              sx={{
                                fontSize: "0.85rem",
                                fontWeight: isActive ? 600 : 400,
                                color: "inherit",
                                lineHeight: 1,
                              }}
                            >
                              {item.label}
                            </Typography>
                          )}
                        </Box>
                      </Link>
                    );

                    return isCollapsed ? (
                      <Tooltip
                        key={item.id}
                        title={item.label}
                        placement="right"
                        arrow
                      >
                        <span>{btn}</span>
                      </Tooltip>
                    ) : (
                      btn
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 1,
            pb: 1.5,
            pt: 1.25,
            borderTop: `1px solid ${BORDER}`,
            bgcolor: BG_TOP,
            flexShrink: 0,
          }}
        >
          <Box
            onClick={() => router.push("/company/settings")}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: isCollapsed ? 0 : 1,
              px: isCollapsed ? 0 : 1,
              py: 0.75,
              height: isCollapsed ? 42 : "auto",
              borderRadius: "9px",
              cursor: "pointer",
              justifyContent: isCollapsed ? "center" : "flex-start",
              transition: "all 0.12s",
              "&:hover": { bgcolor: HOVER_BG },
            }}
          >
            <Avatar
              src={avatarUrl ?? undefined}
              sx={{
                bgcolor: TEAL,
                width: 28,
                height: 28,
                fontSize: "11px",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initial}
            </Avatar>

            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  noWrap
                  sx={{
                    fontSize: "12.5px",
                    fontWeight: 600,
                    color: "#E8F6F9",
                    lineHeight: 1.35,
                  }}
                >
                  {companyName}
                </Typography>
                {companyEmail && (
                  <Typography
                    noWrap
                    sx={{ fontSize: "10px", color: TXT_CLR, lineHeight: 1.3 }}
                  >
                    {companyEmail}
                  </Typography>
                )}
              </Box>
            )}

            {!isCollapsed && (
              <Tooltip title="Sign out">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLogout();
                  }}
                  sx={{
                    color: ICO_CLR,
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    flexShrink: 0,
                    "&:hover": {
                      bgcolor: "rgba(239,68,68,0.15)",
                      color: "#F87171",
                    },
                    transition: "all 0.15s",
                  }}
                >
                  <LogoutOutlined sx={{ fontSize: 18 }} />
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
              transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)",
              overflowX: "hidden",
              borderRight: `1px solid ${BORDER}`,
              boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
              bgcolor: BG,
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
          sx={{
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              borderRight: `1px solid ${BORDER}`,
              bgcolor: BG,
            },
          }}
        >
          {content(true)}
        </Drawer>
      )}
      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default Sidebar;
