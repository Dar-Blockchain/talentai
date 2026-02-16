import React, { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  InputBase,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const navItems = [
  { id: "dashboard", icon: DashboardOutlined, label: "Dashboard" },
  { id: "skills", icon: PsychologyOutlined, label: "Skills Matrix" },
  { id: "campaigns", icon: AssignmentTurnedInOutlined, label: "Assessment Campaigns" },
  { id: "enablement", icon: SchoolOutlined, label: "Employee Enablement" },
  { id: "analytics", icon: BarChartOutlined, label: "Analytics & Reports" },
  { id: "settings", icon: SettingsOutlined, label: "Settings" },
];

const breadcrumbMap: Record<string, string> = {
  dashboard: "Overview",
  skills: "Skills Matrix",
  campaigns: "Assessment Campaigns",
  enablement: "Employee Enablement",
  analytics: "Analytics & Reports",
  settings: "Settings",
};

interface WorkplaceLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const WorkplaceLayout: React.FC<WorkplaceLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile } = useSelector((state: RootState) => state.user.connectedUser);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const sidebarContent = (mobile = false) => (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Logo */}
      <Box sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {(!collapsed || mobile) ? (
          <Box
            sx={{
              backgroundColor: "#141415",
              borderRadius: "50px",
              width: 134,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/images/home/logocompany.png"
              alt="TalentAI"
              sx={{ height: 24 }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: "#141415",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              component="img"
              src="/images/home/logocompany.png"
              alt="TalentAI"
              sx={{ height: 16 }}
            />
          </Box>
        )}
        {mobile && (
          <IconButton onClick={() => setMobileOpen(false)} size="small">
            <CloseOutlined sx={{ color: "#6B7280" }} />
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, px: 1.5, mt: 2 }}>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <ListItemButton
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (mobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                py: 1.2,
                px: 2,
                position: "relative",
                bgcolor: active ? "#F0FDFA" : "transparent",
                color: active ? "#0D9488" : "#6B7280",
                "&:hover": { bgcolor: active ? "#F0FDFA" : "#F9FAFB" },
                justifyContent: collapsed && !mobile ? "center" : "flex-start",
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: "absolute",
                    left: 0,
                    top: "25%",
                    bottom: "25%",
                    width: 3,
                    bgcolor: "#0D9488",
                    borderRadius: "0 4px 4px 0",
                  }}
                />
              )}
              <ListItemIcon sx={{ minWidth: collapsed && !mobile ? 0 : 40, color: "inherit" }}>
                <item.icon sx={{ fontSize: 24 }} />
              </ListItemIcon>
              {(!collapsed || mobile) && (
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "13px",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* Bottom section */}
      <Box sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
        {!isMobile && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <IconButton onClick={() => setCollapsed(!collapsed)} size="small" sx={{ color: "#6B7280" }}>
              {collapsed ? <ChevronRightOutlined /> : <ChevronLeftOutlined />}
            </IconButton>
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: collapsed && !mobile ? "center" : "flex-start", px: collapsed && !mobile ? 0 : 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#0D9488", fontSize: 14 }}>
            {profile?.companyDetails?.name?.[0] || "T"}
          </Avatar>
          {(!collapsed || mobile) && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.companyDetails?.name || "Company"}
              </Typography>
              <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>HR Director</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#F9FAFB" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            transition: "width 0.3s",
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid #E5E7EB",
              transition: "width 0.3s",
              overflowX: "hidden",
            },
          }}
        >
          {sidebarContent(false)}
        </Drawer>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
            },
          }}
        >
          {sidebarContent(true)}
        </Drawer>
      )}

      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Top Bar */}
        <Box
          sx={{
            height: 64,
            bgcolor: "#fff",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: { xs: 2, md: 4 },
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ ml: -1 }}>
                <MenuOutlined sx={{ color: "#6B7280" }} />
              </IconButton>
            )}
            <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", fontSize: "13px", fontWeight: 500 }}>
              <Typography sx={{ color: "#6B7280", fontSize: "13px" }}>Dashboard</Typography>
              <Typography sx={{ mx: 1, color: "#9CA3AF", fontSize: "13px" }}>/</Typography>
              <Typography sx={{ color: "#111827", fontSize: "13px", fontWeight: 600 }}>{breadcrumbMap[activeTab] || "Overview"}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 2 } }}>
            {/* Search */}
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                alignItems: "center",
                bgcolor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                width: 240,
              }}
            >
              <SearchOutlined sx={{ color: "#9CA3AF", fontSize: 18, mr: 1 }} />
              <InputBase placeholder="Search anything..." sx={{ fontSize: "13px", flex: 1 }} />
            </Box>

            {/* Notifications */}
            <IconButton sx={{ color: "#6B7280", position: "relative" }}>
              <NotificationsOutlined sx={{ fontSize: 20 }} />
              <Box sx={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, bgcolor: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </IconButton>

            {/* Company Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: { xs: 1, md: 2 }, borderLeft: "1px solid #E5E7EB" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#0D9488", fontSize: 12 }}>
                {profile?.companyDetails?.name?.[0] || "T"}
              </Avatar>
              <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                {profile?.companyDetails?.name || "Company"}
              </Typography>
              <KeyboardArrowDownOutlined sx={{ color: "#6B7280", fontSize: 18 }} />
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflowY: "auto", bgcolor: "#F9FAFB" }}>
          <Box sx={{ maxWidth: 1280, mx: "auto", p: { xs: 2, md: 4 } }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkplaceLayout;
