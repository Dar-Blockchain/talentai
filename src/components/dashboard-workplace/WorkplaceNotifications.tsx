import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Switch,
  Slider,
  Divider,
  CircularProgress,
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

// ─── Design tokens ─────────────────────────────────────────────────────────────
const TEAL = "#0D9488";
const TEAL_BG = "#F0FDFA";
const TEAL_BORDER = "#99F6E4";

// ─── Helpers ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { bg: string; color: string; border: string; Icon: React.ElementType }> = {
  success: { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0", Icon: CheckCircleOutlined },
  warning: { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A", Icon: WarningAmberOutlined },
  error:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA", Icon: ErrorOutlined },
  info:    { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE", Icon: InfoOutlined },
};
const getConfig = (type: string) => TYPE_CONFIG[type] ?? TYPE_CONFIG.info;

// ─── Stat Card ──────────────────────────────────────────────────────────────────
const StatCard: React.FC<{ value: number; label: string; gradient: string }> = ({ value, label, gradient }) => (
  <Box
    sx={{
      flex: "1 1 120px",
      p: 2.5,
      borderRadius: 3,
      background: gradient,
      color: "#fff",
      textAlign: "center",
    }}
  >
    <Typography sx={{ fontSize: "32px", fontWeight: 800, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "12px", fontWeight: 600, mt: 0.5, opacity: 0.9 }}>{label}</Typography>
  </Box>
);

// ─── Individual notification row ────────────────────────────────────────────────
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
      {/* Icon circle */}
      <Box
        sx={{
          width: 42, height: 42, flexShrink: 0, borderRadius: "50%",
          bgcolor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
          border: `1px solid ${cfg.border}`,
        }}
      >
        <Icon sx={{ fontSize: 20, color: cfg.color }} />
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 0.5, gap: 1 }}>
          <Typography sx={{ fontSize: "14px", fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>
            {notification.title}
          </Typography>
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: TEAL }} />
            <Typography sx={{ fontSize: "11px", fontWeight: 700, color: TEAL }}>NEW</Typography>
            <Typography sx={{ fontSize: "11px", color: "#9CA3AF" }}>· Click to mark as read</Typography>
          </Box>
        )}
      </Box>

      {/* Archive button */}
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
  const archivedLoading       = useSelector(selectArchivedLoading);
  const archivedCount         = useSelector(selectArchivedCount);
  const nonArchivedCount      = useSelector(selectNonArchivedCount);

  const { enabled: soundEnabled, volume, setEnabled: setSoundEnabled, setVolume } = useNotificationSound();

  React.useEffect(() => {
    if (activeTab === "archived") dispatch(fetchArchivedNotifications());
  }, [activeTab, dispatch]);

  const thisWeek = notifications.filter((n) =>
    n.timestamp?.includes("hour") || n.timestamp?.includes("day")
  ).length;
  const important = notifications.filter((n) => n.type === "warning" || n.type === "error").length;

  const displayed = activeTab === "active" ? notifications : archivedNotifications;
  const isLoading = activeTab === "archived" && archivedLoading;

  const tabs: { id: "active" | "archived"; label: string; count: number }[] = [
    { id: "active",   label: "Active",   count: nonArchivedCount || notifications.length },
    { id: "archived", label: "Archived", count: archivedCount    || archivedNotifications.length },
  ];

  return (
    <Box>
      {/* ── Page header ── */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "22px", fontWeight: 700, color: "#111827" }}>Notifications</Typography>
          <Typography sx={{ fontSize: "13px", color: "#6B7280", mt: 0.25 }}>
            Stay updated on assessments, campaigns, and team activity.
          </Typography>
        </Box>

        {/* Connection status */}
        <Chip
          icon={isConnected
            ? <WifiOutlined sx={{ fontSize: 15 }} />
            : <WifiOffOutlined sx={{ fontSize: 15 }} />
          }
          label={isConnected ? "Live" : "Offline"}
          size="small"
          sx={{
            fontWeight: 700, fontSize: "11px", height: 26,
            bgcolor: isConnected ? "#F0FDF4" : "#FEF2F2",
            color:   isConnected ? "#16A34A" : "#DC2626",
            border:  `1px solid ${isConnected ? "#BBF7D0" : "#FECACA"}`,
          }}
        />
      </Box>

      {/* ── Stats ── */}
      <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
        <StatCard value={notifications.length} label="Total"     gradient="linear-gradient(135deg, #0D9488 0%, #0891B2 100%)" />
        <StatCard value={unreadCount}          label="Unread"    gradient="linear-gradient(135deg, #DC2626 0%, #f5576c 100%)" />
        <StatCard value={thisWeek}             label="This Week" gradient="linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)" />
        <StatCard value={important}            label="Important" gradient="linear-gradient(135deg, #D97706 0%, #B45309 100%)" />
      </Box>

      <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexDirection: { xs: "column", lg: "row" } }}>

        {/* ── Left: notification list ── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Tab row + actions */}
          <Box
            sx={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              mb: 2.5, flexWrap: "wrap", gap: 1,
            }}
          >
            {/* Tabs */}
            <Box sx={{ display: "flex", bgcolor: "#F3F4F6", borderRadius: 2, p: 0.5, gap: 0.5 }}>
              {tabs.map(({ id, label, count }) => (
                <Box
                  key={id}
                  onClick={() => setActiveTab(id)}
                  sx={{
                    px: 2, py: 0.8, borderRadius: 1.5, cursor: "pointer", fontSize: "13px",
                    fontWeight: 600, transition: "all 0.15s",
                    bgcolor: activeTab === id ? "#fff" : "transparent",
                    color:   activeTab === id ? TEAL : "#6B7280",
                    boxShadow: activeTab === id ? "0 1px 4px rgba(0,0,0,0.07)" : "none",
                  }}
                >
                  {label}
                  {count > 0 && (
                    <Box
                      component="span"
                      sx={{
                        ml: 1, px: 0.8, py: 0.1, borderRadius: 5, fontSize: "10px", fontWeight: 700,
                        bgcolor: activeTab === id ? TEAL : "#E5E7EB",
                        color: activeTab === id ? "#fff" : "#6B7280",
                      }}
                    >
                      {count}
                    </Box>
                  )}
                </Box>
              ))}
            </Box>

            {/* Actions — only when active tab has items */}
            {activeTab === "active" && notifications.length > 0 && (
              <Box sx={{ display: "flex", gap: 1 }}>
                {unreadCount > 0 && (
                  <Button
                    size="small" startIcon={<MarkEmailReadOutlined sx={{ fontSize: 15 }} />}
                    onClick={markAllAsRead}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "12px", color: TEAL,
                      border: `1px solid ${TEAL_BORDER}`, borderRadius: 2,
                      "&:hover": { bgcolor: TEAL_BG } }}
                  >
                    Mark all read
                  </Button>
                )}
                <Button
                  size="small" startIcon={<ArchiveOutlined sx={{ fontSize: 15 }} />}
                  onClick={archiveAll}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "12px", color: "#6B7280",
                    border: "1px solid #E5E7EB", borderRadius: 2,
                    "&:hover": { bgcolor: "#F9FAFB" } }}
                >
                  Archive all
                </Button>
              </Box>
            )}
          </Box>

          {/* List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress size={36} sx={{ color: TEAL }} />
              </Box>
            ) : displayed.length === 0 ? (
              <Box
                sx={{
                  py: 8, textAlign: "center",
                  bgcolor: TEAL_BG, border: `2px dashed ${TEAL_BORDER}`, borderRadius: 3,
                }}
              >
                <NotificationsOutlined sx={{ fontSize: 48, color: TEAL, opacity: 0.4, mb: 1 }} />
                <Typography sx={{ fontWeight: 600, color: "#374151" }}>
                  {activeTab === "active" ? "All caught up!" : "No archived notifications"}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#9CA3AF", mt: 0.5 }}>
                  {activeTab === "active"
                    ? isConnected
                      ? "We'll notify you when something arrives."
                      : "Connecting to notification service…"
                    : "Archive notifications to find them here."}
                </Typography>
              </Box>
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
        </Box>

        {/* ── Right: Sound settings panel ── */}
        <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0 }}>
          <Box
            sx={{
              bgcolor: "#fff", border: "1px solid #E5E7EB", borderRadius: 3, p: 3,
              position: { lg: "sticky" }, top: 24,
            }}
          >
            {/* Header */}
            <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#111827", mb: 0.5 }}>
              Sound Settings
            </Typography>
            <Typography sx={{ fontSize: "12px", color: "#6B7280", mb: 3 }}>
              Configure audio alerts for new notifications.
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {/* Toggle */}
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
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography sx={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>Volume</Typography>
                  <Chip
                    label={`${volume}%`} size="small"
                    sx={{ height: 20, fontSize: "10px", fontWeight: 700, bgcolor: TEAL_BG, color: TEAL }}
                  />
                </Box>
                <Slider
                  value={volume}
                  onChange={(_, v) => setVolume(v as number)}
                  min={0} max={100}
                  sx={{
                    color: TEAL,
                    "& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible": {
                      boxShadow: `0 0 0 8px ${TEAL}28`,
                    },
                  }}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Info hint */}
            <Box sx={{ p: 1.5, bgcolor: "#EFF6FF", borderRadius: 2, border: "1px solid #BFDBFE" }}>
              <Typography sx={{ fontSize: "12px", color: "#2563EB", lineHeight: 1.5 }}>
                Sounds play automatically even when the tab is in the background.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default WorkplaceNotifications;
