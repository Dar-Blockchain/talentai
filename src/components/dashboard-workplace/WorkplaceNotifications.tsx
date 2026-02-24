import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Switch,
  Slider,
} from "@mui/material";
import CheckCircleOutlined from "@mui/icons-material/CheckCircleOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import WarningAmberOutlined from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlined from "@mui/icons-material/ErrorOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import ArchiveOutlined from "@mui/icons-material/ArchiveOutlined";
import VolumeUpOutlined from "@mui/icons-material/VolumeUpOutlined";
import VolumeOffOutlined from "@mui/icons-material/VolumeOffOutlined";
import WifiOutlined from "@mui/icons-material/WifiOutlined";
import WifiOffOutlined from "@mui/icons-material/WifiOffOutlined";
import NotificationsOutlined from "@mui/icons-material/NotificationsOutlined";
import { useNotifications } from "@/contexts/NotificationContext";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  fetchArchivedNotifications,
  selectArchivedNotifications,
  selectArchivedLoading,
  selectArchivedCount,
  selectNonArchivedCount,
} from "@/store/slices/notificationSlice";
import { useNotificationSound } from "@/hooks/useNotificationSound";

// ── Reusable UI primitives ────────────────────────────────────────────────────
import {
  StatCard,
  SectionCard,
  SectionHeader,
  PageBanner,
  TabBar,
  StatusBadge,
  InfoBanner,
  EmptyState,
  LoadingOverlay,
} from "./ui";

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

// ─── Notification type config ──────────────────────────────────────────────────
const TYPE_CONFIG: Record<
  string,
  { bg: string; color: string; border: string; Icon: React.ElementType }
> = {
  success: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", Icon: CheckCircleOutlined },
  warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", Icon: WarningAmberOutlined },
  error: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", Icon: ErrorOutlined },
  info: { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", Icon: InfoOutlined },
};
const getConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

// ─── Notification row ───────────────────────────────────────────────────────────
const NotifRow: React.FC<{
  notification: any;
  onMarkAsRead: (id: string) => void;
  onArchive: (id: string) => void;
  isArchived?: boolean;
}> = ({ notification, onMarkAsRead, onArchive, isArchived }) => {
  const cfg = getConfig(notification.type);
  const { Icon } = cfg;

  return (
    <Box
      onClick={() => !isArchived && !notification.isRead && onMarkAsRead(notification.id)}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2.5,
        borderRadius: 2.5,
        border: `1px solid ${notification.isRead ? "#E5E7EB" : cfg.border}`,
        bgcolor: notification.isRead ? "#fff" : cfg.bg,
        cursor: !isArchived && !notification.isRead ? "pointer" : "default",
        transition: "all 0.15s",
        "&:hover": { boxShadow: "0 2px 12px rgba(0,0,0,0.06)", transform: "translateY(-1px)" },
      }}
    >
      {/* Type icon */}
      <Box
        sx={{
          width: 42, height: 42, flexShrink: 0, borderRadius: "50%",
          bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${cfg.border}`,
        }}
      >
        <Icon sx={{ fontSize: 20, color: cfg.color }} />
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
              {notification.title}
            </Typography>
            {/* StatusBadge for read state */}
            {!notification.isRead && !isArchived && (
              <StatusBadge status="active" label="New" size="sm" />
            )}
            {isArchived && (
              <StatusBadge status="paused" label="Archived" size="sm" />
            )}
          </Box>

          {/* Timestamp */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
            <AccessTimeOutlined sx={{ fontSize: 12, color: "#9CA3AF" }} />
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
              {notification.timestamp}
            </Typography>
          </Box>
        </Box>

        <Typography sx={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.5 }}>
          {notification.message}
        </Typography>

        {!notification.isRead && !isArchived && (
          <Typography sx={{ fontSize: "11px", color: "#9CA3AF", mt: 0.75 }}>
            Click to mark as read
          </Typography>
        )}
      </Box>

      {/* Archive action */}
      {!isArchived && (
        <IconButton
          size="small"
          onClick={(e) => { e.stopPropagation(); onArchive(notification.id); }}
          sx={{ alignSelf: "flex-start", color: "#9CA3AF", "&:hover": { color: TEAL, bgcolor: TEAL_BG } }}
          title="Archive"
        >
          <ArchiveOutlined sx={{ fontSize: 18 }} />
        </IconButton>
      )}
    </Box>
  );
};

// ─── Main component ─────────────────────────────────────────────────────────────
const WorkplaceNotifications: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");

  const {
    notifications, unreadCount, isConnected,
    markAsRead, markAllAsRead, archive, archiveAll,
  } = useNotifications();

  const archivedNotifications = useSelector(selectArchivedNotifications);
  const archivedLoading = useSelector(selectArchivedLoading);
  const archivedCount = useSelector(selectArchivedCount);
  const nonArchivedCount = useSelector(selectNonArchivedCount);

  const { enabled: soundEnabled, volume, setEnabled: setSoundEnabled, setVolume } = useNotificationSound();

  React.useEffect(() => {
    if (activeTab === "archived") dispatch(fetchArchivedNotifications());
  }, [activeTab, dispatch]);

  const thisWeek = notifications.filter(
    (n) => n.timestamp?.includes("hour") || n.timestamp?.includes("day")
  ).length;
  const important = notifications.filter(
    (n) => n.type === "warning" || n.type === "error"
  ).length;

  const displayed = activeTab === "active" ? notifications : archivedNotifications;
  const isLoading = activeTab === "archived" && archivedLoading;

  // TabBar items
  const tabItems = [
    { id: "active", label: "Active", count: nonArchivedCount || notifications.length },
    { id: "archived", label: "Archived", count: archivedCount || archivedNotifications.length },
  ];

  return (
    <Box>
      {/* ── PageBanner ─────────────────────────────────────────────────────────── */}
      <PageBanner
        title="Notifications"
        subtitle="Stay updated on assessments, campaigns, and team activity."
        icon={<NotificationsOutlined />}
        gradient="135deg, #0D9488 0%, #0891B2 100%"

        action={
          <Chip
            icon={isConnected
              ? <WifiOutlined sx={{ fontSize: 14 }} />
              : <WifiOffOutlined sx={{ fontSize: 14 }} />
            }
            label={isConnected ? "Live" : "Offline"}
            size="small"
            sx={{
              fontWeight: 700, fontSize: "11px", height: 26,
              bgcolor: isConnected ? "rgba(255,255,255,0.2)" : "rgba(255,0,0,0.2)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
            }}
          />
        }
      />

      {/* ── Stat cards ─────────────────────────────────────────────────────────── */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2, mb: 4 }}>
        <StatCard
          icon={<NotificationsOutlined />}
          label="Total"
          value={notifications.length}
          color={TEAL}
        />
        <StatCard
          icon={<InfoOutlined />}
          label="Unread"
          value={unreadCount}
          color="#DC2626"
        />
        <StatCard
          icon={<CheckCircleOutlined />}
          label="This Week"
          value={thisWeek}
          color="#7C3AED"
        />
        <StatCard
          icon={<WarningAmberOutlined />}
          label="Important"
          value={important}
          color="#D97706"
        />
      </Box>

      {/* ── Two-column layout ───────────────────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", lg: "row" } }}>

        {/* ── LEFT: notification list ─────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <SectionCard>
            {/* Header with TabBar + bulk actions */}
            <SectionHeader
              title="Inbox"
              subtitle={activeTab === "active"
                ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                : `${archivedNotifications.length} archived`
              }
              action={
                activeTab === "active" && notifications.length > 0 ? (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {unreadCount > 0 && (
                      <Button
                        size="small"
                        startIcon={<MarkEmailReadOutlined sx={{ fontSize: 15 }} />}
                        onClick={markAllAsRead}
                        sx={{
                          textTransform: "none", fontWeight: 600, fontSize: "12px",
                          color: TEAL, border: `1px solid ${TEAL_BORDER}`, borderRadius: 2,
                          "&:hover": { bgcolor: TEAL_BG },
                        }}
                      >
                        Mark all read
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<ArchiveOutlined sx={{ fontSize: 15 }} />}
                      onClick={archiveAll}
                      sx={{
                        textTransform: "none", fontWeight: 600, fontSize: "12px",
                        color: "#6B7280", border: "1px solid #E5E7EB", borderRadius: 2,
                        "&:hover": { bgcolor: "#F9FAFB" },
                      }}
                    >
                      Archive all
                    </Button>
                  </Box>
                ) : undefined
              }
            />

            {/* TabBar */}
            <TabBar
              tabs={tabItems}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as "active" | "archived")}
              color={TEAL}
            />

            {/* Notification list body */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {isLoading ? (
                <LoadingOverlay height={240} message="Loading archived notifications…" color={TEAL} />
              ) : displayed.length === 0 ? (
                <EmptyState
                  icon={<NotificationsOutlined />}
                  title={activeTab === "active" ? "All caught up!" : "No archived notifications"}
                  description={
                    activeTab === "active"
                      ? isConnected
                        ? "We'll notify you when something arrives."
                        : "Connecting to notification service…"
                      : "Archive notifications to find them here."
                  }
                  minHeight={200}
                />
              ) : (
                displayed.map((n) => (
                  <NotifRow
                    key={n.id}
                    notification={n}
                    onMarkAsRead={markAsRead}
                    onArchive={archive}
                    isArchived={activeTab === "archived"}
                  />
                ))
              )}
            </Box>
          </SectionCard>
        </Box>

        {/* ── RIGHT: Sound settings ───────────────────────────────────────────── */}
        <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0, position: { lg: "sticky" }, top: 24 }}>
          <SectionCard>
            <SectionHeader
              title="Sound Settings"
              subtitle="Configure audio alerts for new notifications."
              compact
            />

            {/* Toggle row */}
            <Box
              sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: 2, borderRadius: 2, mb: 2,
                bgcolor: soundEnabled ? TEAL_BG : "#F9FAFB",
                border: `1px solid ${soundEnabled ? TEAL_BORDER : "#E5E7EB"}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                {soundEnabled
                  ? <VolumeUpOutlined sx={{ fontSize: 22, color: TEAL }} />
                  : <VolumeOffOutlined sx={{ fontSize: 22, color: "#9CA3AF" }} />
                }
                <Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                    {soundEnabled ? "Sounds on" : "Sounds off"}
                  </Typography>
                  <Typography sx={{ fontSize: "11px", color: "#6B7280" }}>
                    {soundEnabled ? "Playing for all notifications" : "Muted"}
                  </Typography>
                </Box>
              </Box>
              <Switch
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                size="small"
                sx={{
                  "& .MuiSwitch-switchBase.Mui-checked": { color: TEAL },
                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: TEAL },
                }}
              />
            </Box>

            {/* Volume slider */}
            {soundEnabled && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                    Volume
                  </Typography>
                  <Chip
                    label={`${volume}%`}
                    size="small"
                    sx={{ height: 20, fontSize: "10px", fontWeight: 700, bgcolor: TEAL_BG, color: TEAL }}
                  />
                </Box>
                <Slider
                  value={volume}
                  onChange={(_, v) => setVolume(v as number)}
                  min={0}
                  max={100}
                  sx={{
                    color: TEAL,
                    "& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible": {
                      boxShadow: `0 0 0 8px ${TEAL}28`,
                    },
                  }}
                />
              </Box>
            )}

            {/* InfoBanner hint */}
            <InfoBanner
              type="info"
              message="Sounds play automatically even when the tab is in the background."
            />
          </SectionCard>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkplaceNotifications;
