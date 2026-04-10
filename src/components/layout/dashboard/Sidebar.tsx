"use client";

import React, { useCallback, useEffect, useState } from "react";
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

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleToggleCollapse = useCallback(
    () => setCollapsed((c) => !c),
    [setCollapsed],
  );

  const navItemSx = (isActive: boolean, isCollapsed: boolean, isMobileView: boolean) => ({
    borderRadius: 2,
    mb: 0.5,
    py: isCollapsed && !isMobileView ? 0.8 : 1,
    px: isCollapsed && !isMobileView ? 1.2 : 2,
    color: isActive ? "#0D9488" : "#4B5563",
    bgcolor: isActive ? "rgba(243, 244, 246, 0.6)" : "transparent",
    justifyContent: isCollapsed && !isMobileView ? "center" : "flex-start",
    transition: "all 0.2s ease",
    minHeight: isCollapsed && !isMobileView ? 40 : "auto",
    borderLeft: isActive ? "4px solid #0D9488" : "4px solid transparent",
    "&:hover": {
      bgcolor: "rgba(243, 244, 246, 0.6)",
      color: "#111827",
      borderLeft: "4px solid #0D9488",
      "& .MuiListItemIcon-root": { color: "#0D9488" },
    },
  });

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
        {user?.role === "Employee" ? (
          /* ── Employee: grouped sections ── */
          <Box sx={{ px: 1.5, py: 1 }}>
            {activeEmployeeGroups.map((group, groupIdx) => (
              <Box key={group.group}>
                {/* Divider between groups */}
                {groupIdx > 0 && (
                  <Box sx={{ mx: 1, my: 1.5, height: "1px", bgcolor: "#E5E7EB" }} />
                )}

                {/* Group label */}
                {(!collapsed || mobile) && (
                  <Box sx={{ px: 2, py: 0.75 }}>
                    <Typography sx={{
                      fontSize: "10px", fontWeight: 700, color: "#9CA3AF",
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}>
                      {group.group}
                    </Typography>
                    {group.group === "Company" && companyName && (
                      <Typography sx={{ fontSize: "11px", fontWeight: 600, color: "#374151", mt: 0.25, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {companyName}
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Group items */}
                <List disablePadding>
                  {group.items.map((item: EmployeeNavItem) => {
                    const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + "/");
                    return (
                      <Link key={item.id} href={item.href} passHref>
                        <ListItemButton sx={navItemSx(isActive, collapsed, mobile)}>
                          <ListItemIcon sx={{ minWidth: collapsed && !mobile ? 0 : 40, color: isActive ? "#0D9488" : "#6B7280", justifyContent: "center" }}>
                            <item.icon sx={{ fontSize: collapsed && !mobile ? 20 : 24 }} />
                          </ListItemIcon>
                          {(!collapsed || mobile) && (
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }} />
                          )}
                        </ListItemButton>
                      </Link>
                    );
                  })}
                </List>
              </Box>
            ))}
          </Box>
        ) : (
          /* ── Company: flat list ── */
          <List sx={{ px: 1.5 }}>
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + "/");
              return (
                <Link key={item.id} href={item.href} passHref>
                  <ListItemButton sx={navItemSx(isActive, collapsed, mobile)}>
                    <ListItemIcon sx={{ minWidth: collapsed && !mobile ? 0 : 40, color: isActive ? "#0D9488" : "#6B7280", justifyContent: "center" }}>
                      <item.icon sx={{ fontSize: collapsed && !mobile ? 20 : 24 }} />
                    </ListItemIcon>
                    {(!collapsed || mobile) && (
                      <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: "14px", fontWeight: 500 }} />
                    )}
                  </ListItemButton>
                </Link>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #E5E7EB", flexShrink: 0 }}>
        {collapsed && !mobile ? (
          /* Collapsed: stack avatar + logout icon */
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Avatar sx={{ bgcolor: "#0D9488", width: 36, height: 36, fontSize: 14 }}>
              {displayInitial}
            </Avatar>
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: "#6B7280", "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" } }}
            >
              <LogoutOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ) : (
          /* Expanded: avatar + name/email + logout */
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
              <Avatar sx={{ bgcolor: "#0D9488", width: 36, height: 36, fontSize: 14, flexShrink: 0 }}>
                {displayInitial}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayName}
                </Typography>
                <Typography sx={{ fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {displayEmail}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ flexShrink: 0, color: "#6B7280", "&:hover": { color: "#EF4444", bgcolor: "#FEF2F2" } }}
            >
              <LogoutOutlined sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}
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
      <LogoutProgressModal open={loggingOut} />
    </>
  );
};

export default Sidebar;
