import React, { useState, useCallback, useMemo, useEffect } from "react";
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
  Badge,
  Popover,
  Divider,
  Button,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DashboardOutlined from "@mui/icons-material/DashboardOutlined";
import PsychologyOutlined from "@mui/icons-material/PsychologyOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import BarChartOutlined from "@mui/icons-material/BarChartOutlined";
import WorkOutlined from "@mui/icons-material/WorkOutlined";
import SettingsOutlined from "@mui/icons-material/SettingsOutlined";
import PaletteOutlined from "@mui/icons-material/PaletteOutlined";
import NotificationsActiveOutlined from "@mui/icons-material/NotificationsActiveOutlined";
import ChatOutlined from "@mui/icons-material/ChatOutlined";
import ChevronLeftOutlined from "@mui/icons-material/ChevronLeftOutlined";
import ChevronRightOutlined from "@mui/icons-material/ChevronRightOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import MenuOutlined from "@mui/icons-material/MenuOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";
import KeyboardArrowDownOutlined from "@mui/icons-material/KeyboardArrowDownOutlined";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import ArchiveOutlined from "@mui/icons-material/ArchiveOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { useNotifications } from "@/contexts/NotificationContext";
import { selectConversations, fetchConversations } from "@/store/slices/chatSlice";

const DRAWER_WIDTH = 240;
const COLLAPSED_WIDTH = 72;

const navItems = [
  { id: "dashboard", icon: DashboardOutlined, label: "Dashboard" },
  { id: "skills", icon: PsychologyOutlined, label: "Skills Matrix" },
  { id: "campaigns", icon: AssignmentTurnedInOutlined, label: "Assessment Campaigns" },
  { id: "enablement", icon: SchoolOutlined, label: "Employee Enablement" },
  { id: "analytics", icon: BarChartOutlined, label: "Analytics & Reports" },
  { id: "jobs",          icon: WorkOutlined,                label: "Job Posts" },
  { id: "notifications", icon: NotificationsActiveOutlined, label: "Notifications" },
  { id: "chat",          icon: ChatOutlined,                label: "Messages" },
  { id: "settings",      icon: SettingsOutlined,            label: "Settings" },
  { id: "design-system", icon: PaletteOutlined,             label: "Design System" },
];

const breadcrumbMap: Record<string, string> = {
  dashboard: "Overview",
  skills: "Skills Matrix",
  campaigns: "Assessment Campaigns",
  enablement: "Employee Enablement",
  analytics: "Analytics & Reports",
  jobs:          "Job Posts",
  notifications: "Notifications",
  chat:          "Messages",
  settings:      "Settings",
  "design-system": "Design System",
};

interface WorkplaceLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// ─── Notification type helpers (used inside popover) ──────────────────────────
const NOTIF_TYPE: Record<string, { color: string; bg: string; Icon: React.ElementType }> = {
  success: { color: "#16A34A", bg: "#F0FDF4", Icon: CheckCircleOutlined },
  warning: { color: "#D97706", bg: "#FFFBEB", Icon: WarningAmberOutlined },
  error:   { color: "#DC2626", bg: "#FEF2F2", Icon: ErrorOutlined },
  info:    { color: "#2563EB", bg: "#EFF6FF", Icon: InfoOutlined },
};

const WorkplaceLayout: React.FC<WorkplaceLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bellAnchor, setBellAnchor] = useState<null | HTMLElement>(null);
  const [chatAnchor, setChatAnchor] = useState<null | HTMLElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => (state as any).user.connectedUser);
  const { notifications, unreadCount, markAsRead, markAllAsRead, archive } = useNotifications();
  const conversations = useSelector(selectConversations);
  const totalUnreadMessages = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  useEffect(() => {
    dispatch(fetchConversations({}));
  }, [dispatch]);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleToggleCollapse = useCallback(() => setCollapsed((c) => !c), []);
  const handleCloseMobile = useCallback(() => setMobileOpen(false), []);
  const handleOpenMobile = useCallback(() => setMobileOpen(true), []);

  const companyInitial = useMemo(
    () => profile?.companyDetails?.name?.[0] || "T",
    [profile?.companyDetails?.name]
  );
  const companyName = useMemo(
    () => profile?.companyDetails?.name || "Company",
    [profile?.companyDetails?.name]
  );

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
          <IconButton onClick={handleCloseMobile} size="small">
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
                if (mobile) handleCloseMobile();
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
                  slotProps={{ primary: { sx: { fontSize: "13px", fontWeight: 500, whiteSpace: "nowrap" } } }}
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
            <IconButton onClick={handleToggleCollapse} size="small" sx={{ color: "#6B7280" }}>
              {collapsed ? <ChevronRightOutlined /> : <ChevronLeftOutlined />}
            </IconButton>
          </Box>
        )}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, justifyContent: collapsed && !mobile ? "center" : "flex-start", px: collapsed && !mobile ? 0 : 1 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#0D9488", fontSize: 14 }}>
            {companyInitial}
          </Avatar>
          {(!collapsed || mobile) && (
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {companyName}
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
          onClose={handleCloseMobile}
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
              <IconButton onClick={handleOpenMobile} sx={{ ml: -1 }}>
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

            {/* Notifications bell */}
            <IconButton
              onClick={(e) => setBellAnchor(e.currentTarget)}
              sx={{ color: "#6B7280" }}
            >
              <Badge
                badgeContent={unreadCount > 9 ? "9+" : unreadCount || undefined}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#EF4444", color: "#fff", fontSize: "10px", fontWeight: 700, minWidth: 18, height: 18 } }}
              >
                <NotificationsOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Notification popover */}
            <Popover
              open={Boolean(bellAnchor)}
              anchorEl={bellAnchor}
              onClose={() => setBellAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { width: 380, maxHeight: 520, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden", mt: 1 } } }}
            >
              {/* Popover header */}
              <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Notifications</Typography>
                  {unreadCount > 0 && (
                    <Box sx={{ bgcolor: "#EF4444", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Box>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {unreadCount > 0 && (
                    <IconButton size="small" onClick={markAllAsRead} title="Mark all as read" sx={{ color: "#6B7280", "&:hover": { color: "#0D9488", bgcolor: "#F0FDFA" } }}>
                      <MarkEmailReadOutlined sx={{ fontSize: 18 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Popover list */}
              <Box sx={{ maxHeight: 380, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#E5E7EB", borderRadius: 2 } }}>
                {notifications.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <NotificationsOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>No notifications yet</Typography>
                  </Box>
                ) : (
                  notifications.slice(0, 6).map((n, i) => {
                    const cfg = NOTIF_TYPE[n.type] ?? NOTIF_TYPE.info;
                    const { Icon } = cfg;
                    return (
                      <React.Fragment key={n.id}>
                        <Box
                          onClick={() => !n.isRead && markAsRead(n.id)}
                          sx={{
                            display: "flex", gap: 1.5, px: 2, py: 1.5, cursor: n.isRead ? "default" : "pointer",
                            bgcolor: n.isRead ? "transparent" : "#FAFAFA",
                            "&:hover": { bgcolor: "#F9FAFB" }, transition: "background 0.15s",
                          }}
                        >
                          <Box sx={{ width: 36, height: 36, flexShrink: 0, borderRadius: "50%", bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon sx={{ fontSize: 17, color: cfg.color }} />
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827", mb: 0.25 }}>{n.title}</Typography>
                            <Typography sx={{ fontSize: "12px", color: "#6B7280", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.message}</Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                              <AccessTimeOutlined sx={{ fontSize: 11, color: "#9CA3AF" }} />
                              <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>{n.timestamp}</Typography>
                              {!n.isRead && <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#0D9488", ml: 0.5 }} />}
                            </Box>
                          </Box>
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); archive(n.id); }} sx={{ alignSelf: "flex-start", color: "#D1D5DB", "&:hover": { color: "#6B7280" } }}>
                            <ArchiveOutlined sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Box>
                        {i < Math.min(notifications.length, 6) - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </Box>

              {/* Popover footer */}
              {notifications.length > 0 && (
                <Box sx={{ borderTop: "1px solid #E5E7EB", p: 1.5 }}>
                  <Button
                    fullWidth size="small"
                    onClick={() => { setActiveTab("notifications"); setBellAnchor(null); }}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#0D9488", borderRadius: 2, "&:hover": { bgcolor: "#F0FDFA" } }}
                  >
                    View all notifications
                  </Button>
                </Box>
              )}
            </Popover>

            {/* Chat icon */}
            <IconButton
              onClick={(e) => setChatAnchor(e.currentTarget)}
              sx={{ color: "#6B7280" }}
            >
              <Badge
                badgeContent={totalUnreadMessages > 9 ? "9+" : totalUnreadMessages || undefined}
                sx={{ "& .MuiBadge-badge": { bgcolor: "#0D9488", color: "#fff", fontSize: "10px", fontWeight: 700, minWidth: 18, height: 18 } }}
              >
                <ChatOutlined sx={{ fontSize: 20 }} />
              </Badge>
            </IconButton>

            {/* Chat popover */}
            <Popover
              open={Boolean(chatAnchor)}
              anchorEl={chatAnchor}
              onClose={() => setChatAnchor(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              slotProps={{ paper: { sx: { width: 340, maxHeight: 480, borderRadius: 3, boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden", mt: 1 } } }}
            >
              {/* Chat popover header */}
              <Box sx={{ px: 2.5, py: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #E5E7EB" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ fontSize: "15px", fontWeight: 700, color: "#111827" }}>Messages</Typography>
                  {totalUnreadMessages > 0 && (
                    <Box sx={{ bgcolor: "#0D9488", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>
                      {totalUnreadMessages > 9 ? "9+" : totalUnreadMessages}
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Chat popover list */}
              <Box sx={{ maxHeight: 340, overflowY: "auto", "&::-webkit-scrollbar": { width: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: "#E5E7EB", borderRadius: 2 } }}>
                {conversations.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <ChatOutlined sx={{ fontSize: 40, color: "#D1D5DB", mb: 1 }} />
                    <Typography sx={{ fontSize: "13px", color: "#9CA3AF" }}>No conversations yet</Typography>
                  </Box>
                ) : (
                  conversations.slice(0, 6).map((conv, i) => {
                    const other = conv.participants?.find((p: any) => p._id !== profile?._id);
                    const name = other
                      ? `${other.firstName || ""} ${other.lastName || ""}`.trim() || other.email || "Unknown"
                      : "Unknown";
                    const initial = name[0]?.toUpperCase() || "?";
                    const lastMsg = conv.lastMessage;
                    const hasUnread = (conv.unreadCount || 0) > 0;
                    return (
                      <React.Fragment key={conv._id}>
                        <Box
                          onClick={() => { setActiveTab("chat"); setChatAnchor(null); }}
                          sx={{
                            display: "flex", gap: 1.5, px: 2, py: 1.5, cursor: "pointer",
                            bgcolor: hasUnread ? "#F0FDFA" : "transparent",
                            "&:hover": { bgcolor: "#F9FAFB" }, transition: "background 0.15s",
                          }}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={conv.unreadCount > 0 ? conv.unreadCount : 0}
                            sx={{ "& .MuiBadge-badge": { bgcolor: "#0D9488", color: "#fff", fontSize: "9px", minWidth: 16, height: 16 } }}
                          >
                            <Avatar sx={{ width: 38, height: 38, bgcolor: "#0D9488", fontSize: 14, flexShrink: 0 }}>
                              {initial}
                            </Avatar>
                          </Badge>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.25 }}>
                              <Typography sx={{ fontSize: "13px", fontWeight: hasUnread ? 700 : 600, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {name}
                              </Typography>
                              {lastMsg?.timestamp && (
                                <Typography sx={{ fontSize: "11px", color: "#9CA3AF", flexShrink: 0, ml: 1 }}>
                                  {(() => {
                                    const d = new Date(lastMsg.timestamp);
                                    const now = new Date();
                                    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
                                    if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                                    if (diffDays === 1) return "Yesterday";
                                    if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
                                    return d.toLocaleDateString([], { month: "short", day: "numeric" });
                                  })()}
                                </Typography>
                              )}
                            </Box>
                            <Typography sx={{ fontSize: "12px", color: hasUnread ? "#0D9488" : "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: hasUnread ? 600 : 400 }}>
                              {lastMsg?.text || "No messages yet"}
                            </Typography>
                          </Box>
                        </Box>
                        {i < Math.min(conversations.length, 6) - 1 && <Divider />}
                      </React.Fragment>
                    );
                  })
                )}
              </Box>

              {/* Chat popover footer */}
              {conversations.length > 0 && (
                <Box sx={{ borderTop: "1px solid #E5E7EB", p: 1.5 }}>
                  <Button
                    fullWidth size="small"
                    onClick={() => { setActiveTab("chat"); setChatAnchor(null); }}
                    sx={{ textTransform: "none", fontWeight: 600, color: "#0D9488", borderRadius: 2, "&:hover": { bgcolor: "#F0FDFA" } }}
                  >
                    Open Messages
                  </Button>
                </Box>
              )}
            </Popover>

            {/* Company Info */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, pl: { xs: 1, md: 2 }, borderLeft: "1px solid #E5E7EB" }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: "#0D9488", fontSize: 12 }}>
                {companyInitial}
              </Avatar>
              <Typography sx={{ display: { xs: "none", sm: "block" }, fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                {companyName}
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
