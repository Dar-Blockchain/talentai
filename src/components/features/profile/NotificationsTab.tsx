import React, { useState } from 'react';
import { Box, Typography, IconButton, Button, Chip, Tabs, Tab, CircularProgress } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Archive as ArchiveIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/contexts/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchArchivedNotifications,
  selectArchivedNotifications,
  selectArchivedLoading,
  selectArchivedCount,
  selectNonArchivedCount,
} from '@/store/slices/notificationSlice';
import { useTranslation } from 'react-i18next';

const T    = "#0D9488";
const TBG  = "#F0FDFA";
const TBRD = "#99F6E4";
const NAVY = "#0D1B2A";

interface NotificationsTabProps {
  notifications?: any[];
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.notifications.${k}`);

  const {
    notifications, unreadCount,
    markAsRead, markAllAsRead,
    archive, archiveAll,
    isConnected,
  } = useNotifications();

  const archivedNotifications = useSelector(selectArchivedNotifications);
  const archivedLoading       = useSelector(selectArchivedLoading);
  const archivedCount         = useSelector(selectArchivedCount);
  const nonArchivedCount      = useSelector(selectNonArchivedCount);

  React.useEffect(() => {
    if (activeTab === 1) dispatch(fetchArchivedNotifications());
  }, [activeTab, dispatch]);

  const totalNotifications    = notifications.length;
  const thisWeekNotifications = notifications.filter(n =>
    n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')
  ).length;
  const importantNotifications = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleIcon sx={{ fontSize: 18 }} />;
      case 'warning': return <WarningIcon     sx={{ fontSize: 18 }} />;
      case 'error':   return <ErrorIcon       sx={{ fontSize: 18 }} />;
      default:        return <InfoIcon        sx={{ fontSize: 18 }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' };
      case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'error':   return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      default:        return { bg: TBG,       color: T,         border: TBRD      };
    }
  };

  const displayNotifications = activeTab === 0 ? notifications : archivedNotifications;
  const isLoading            = activeTab === 1 && archivedLoading;

  const statItems = [
    { label: s('stat_total'),     value: totalNotifications,    color: T },
    { label: s('stat_unread'),    value: unreadCount,           color: "#7C3AED" },
    { label: s('stat_this_week'), value: thisWeekNotifications, color: "#0891B2" },
    { label: s('stat_important'), value: importantNotifications,color: "#D97706" },
  ];

  return (
    <>
      <Box sx={{ bgcolor: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", mb: 2 }}>
        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem", color: NAVY }}>{s('title')}</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>{s('subtitle')}</Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
            <Chip
              icon={isConnected ? <WifiIcon sx={{ fontSize: "14px !important" }} /> : <WifiOffIcon sx={{ fontSize: "14px !important" }} />}
              label={isConnected ? s('connected') : s('disconnected')}
              size="small"
              color={isConnected ? "success" : "error"}
              sx={{ fontWeight: 600, fontSize: "0.72rem" }}
            />
            {activeTab === 0 && notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <Button size="small" startIcon={<MarkEmailReadIcon sx={{ fontSize: "14px !important" }} />} onClick={markAllAsRead}
                    sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: T, bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#CCFBF1" } }}>
                    {s('mark_all_read')}
                  </Button>
                )}
                <Button size="small" startIcon={<ArchiveIcon sx={{ fontSize: "14px !important" }} />} onClick={archiveAll}
                  sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", color: "#6B7280", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: "8px", px: 1.5, "&:hover": { bgcolor: "#F3F4F6" } }}>
                  {s('archive_all')}
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ p: 2.5 }}>
          {/* Stats row */}
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1.5, mb: 2.5 }}>
            {statItems.map(({ label, value, color }) => (
              <Box key={label} sx={{ textAlign: "center", p: 1.5, borderRadius: "12px", border: "1px solid #F1F5F9", bgcolor: "#FAFAFA" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ fontSize: "0.68rem", color: "#94A3B8", mt: 0.5, fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: "1px solid #F1F5F9", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 40,
                "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.82rem", minHeight: 40, py: 0.5 },
                "& .Mui-selected": { color: T },
                "& .MuiTabs-indicator": { backgroundColor: T, height: 2 },
              }}
            >
              <Tab label={t('candidate_settings.notifications.tab_active', { count: nonArchivedCount || notifications.length })} />
              <Tab label={t('candidate_settings.notifications.tab_archived', { count: archivedCount || archivedNotifications.length })} />
            </Tabs>
          </Box>

          {/* List */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {isLoading ? (
              <Box sx={{ py: 6, textAlign: "center" }}>
                <CircularProgress size={24} sx={{ color: T }} />
              </Box>
            ) : displayNotifications.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", border: "2px dashed #E5E7EB", borderRadius: "12px", bgcolor: "#FAFAFA" }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "#F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", mx: "auto", mb: 1.5 }}>
                  <InfoIcon sx={{ fontSize: 28, color: "#CBD5E1" }} />
                </Box>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: NAVY, mb: 0.5 }}>
                  {activeTab === 0 ? s('empty_title') : s('empty_archived_title')}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#94A3B8" }}>
                  {activeTab === 0
                    ? (isConnected ? s('empty_subtitle') : s('empty_connecting'))
                    : s('empty_archived_subtitle')}
                </Typography>
              </Box>
            ) : (
              displayNotifications.map((notification) => {
                const colors = getNotificationColor(notification.type);
                return (
                  <Box
                    key={notification.id}
                    onClick={() => activeTab === 0 && !notification.isRead && markAsRead(notification.id)}
                    sx={{
                      p: 2, borderRadius: "12px",
                      border: `1px solid ${notification.isRead ? "#F1F5F9" : colors.border}`,
                      bgcolor: notification.isRead ? "#FAFAFA" : colors.bg,
                      display: "flex", gap: 1.5, alignItems: "flex-start",
                      transition: "all 0.15s",
                      cursor: activeTab === 0 && !notification.isRead ? "pointer" : "default",
                      "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
                    }}
                  >
                    <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: colors.bg, border: `1px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: colors.color, flexShrink: 0 }}>
                      {getNotificationIcon(notification.type)}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 0.25 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: NAVY }}>{notification.title}</Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94A3B8", flexShrink: 0 }}>
                          <AccessTimeIcon sx={{ fontSize: 13 }} />
                          <Typography sx={{ fontSize: "0.7rem" }}>{notification.timestamp}</Typography>
                        </Box>
                      </Box>
                      <Typography sx={{ fontSize: "0.78rem", color: "#6B7280", mb: 0.5 }}>{notification.message}</Typography>
                      {!notification.isRead && (
                        <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: T, bgcolor: TBG, border: `1px solid ${TBRD}`, px: 1, py: 0.25, borderRadius: "6px", display: "inline-block" }}>
                          {s('badge_new')}
                        </Typography>
                      )}
                    </Box>
                    {activeTab === 0 && (
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); archive(notification.id); }}
                        sx={{ alignSelf: "flex-start", "&:hover": { bgcolor: "#F1F5F9" } }} title="Archive">
                        <ArchiveIcon sx={{ fontSize: 17, color: "#CBD5E1" }} />
                      </IconButton>
                    )}
                  </Box>
                );
              })
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(NotificationsTab);
