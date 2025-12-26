import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton, Button, Chip, Tabs, Tab } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Delete as DeleteIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Send as SendIcon,
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { useNotifications } from '@/contexts/NotificationContext';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  createNotification,
  fetchArchivedNotifications,
  selectArchivedNotifications,
  selectArchivedLoading,
  selectArchivedCount,
  selectNonArchivedCount
} from '@/store/slices/notificationSlice';

interface NotificationsTabProps {
  notifications?: any[]; // Keep for backwards compatibility but won't use it
}

const NotificationsTab: React.FC<NotificationsTabProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState(0);

  // Use real notifications from Socket.IO context
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    archive,
    isConnected,
  } = useNotifications();

  // Archived notifications from Redux
  const archivedNotifications = useSelector(selectArchivedNotifications);
  const archivedLoading = useSelector(selectArchivedLoading);
  const archivedCount = useSelector(selectArchivedCount);
  const nonArchivedCount = useSelector(selectNonArchivedCount);

  // Fetch archived notifications when switching to archived tab
  React.useEffect(() => {
    if (activeTab === 1) {
      dispatch(fetchArchivedNotifications());
    }
  }, [activeTab, dispatch]);

  const handleSendTestNotification = () => {
    dispatch(createNotification({
      type: 'success',
      content: 'This is a test success notification! Everything is working perfectly. 🎉'
    }));
  };

  const totalNotifications = notifications.length;
  const unreadNotifications = unreadCount;
  const thisWeekNotifications = notifications.filter(n =>
    n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')
  ).length;
  const importantNotifications = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircleIcon />;
      case 'warning': return <WarningIcon />;
      case 'error': return <ErrorIcon />;
      default: return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' };
      case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
      case 'error': return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
      default: return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
    }
  };

  const displayNotifications = activeTab === 0 ? notifications : archivedNotifications;
  const isLoading = activeTab === 1 && archivedLoading;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'rgba(131, 16, 255, 0.04)', p: 3, borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                Notification History
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                View and manage all your notifications
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {/* Socket Connection Status */}
              <Chip
                icon={isConnected ? <WifiIcon /> : <WifiOffIcon />}
                label={isConnected ? 'Connected' : 'Disconnected'}
                size="small"
                color={isConnected ? 'success' : 'error'}
                sx={{ fontWeight: 600 }}
              />
              {/* Mark All As Read Button */}
              {unreadNotifications > 0 && (
                <Button
                  size="small"
                  startIcon={<MarkEmailReadIcon />}
                  onClick={markAllAsRead}
                  sx={{
                    textTransform: 'none',
                    color: '#8310FF',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(131, 16, 255, 0.1)',
                    },
                  }}
                >
                  Mark all read
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
              },
              '& .Mui-selected': {
                color: '#8310FF',
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#8310FF',
              },
            }}
          >
            <Tab label={`Active (${nonArchivedCount || notifications.length})`} />
            <Tab label={`Archived (${archivedCount || archivedNotifications.length})`} />
          </Tabs>
        </Box>

        {/* Notification Stats */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
          <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{totalNotifications}</Typography>
            <Typography variant="body2">Total</Typography>
          </Box>
          <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{unreadNotifications}</Typography>
            <Typography variant="body2">Unread</Typography>
          </Box>
          <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{thisWeekNotifications}</Typography>
            <Typography variant="body2">This Week</Typography>
          </Box>
          <Box sx={{ p: 3, borderRadius: 2, background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{importantNotifications}</Typography>
            <Typography variant="body2">Important</Typography>
          </Box>
        </Box>

        {/* Notifications List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {isLoading ? (
            <Box sx={{
              py: 8,
              px: 3,
              textAlign: 'center',
            }}>
              <Typography variant="body1" sx={{ color: '#6b7280' }}>
                Loading archived notifications...
              </Typography>
            </Box>
          ) : displayNotifications.length === 0 ? (
            <Box sx={{
              py: 8,
              px: 3,
              textAlign: 'center',
              borderRadius: 2,
              border: '2px dashed #e5e7eb',
              backgroundColor: '#f9fafb',
            }}>
              <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2
              }}>
                <InfoIcon sx={{ fontSize: 40, color: '#9ca3af' }} />
              </Box>
              <Typography variant="h6" sx={{ color: '#374151', fontWeight: 600, mb: 1 }}>
                {activeTab === 0 ? 'No notifications yet' : 'No archived notifications'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                {activeTab === 0
                  ? (isConnected
                    ? "You're all caught up! We'll notify you when something arrives."
                    : "Connecting to notification service...")
                  : "You haven't archived any notifications yet."}
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
                    p: 3,
                    borderRadius: 2,
                    border: `1px solid ${colors.border}`,
                    backgroundColor: notification.isRead ? '#ffffff' : colors.bg,
                    display: 'flex',
                    gap: 2,
                    transition: 'all 0.2s',
                    cursor: (activeTab === 0 && !notification.isRead) ? 'pointer' : 'default',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.color, flexShrink: 0 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 0.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        {notification.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#6b7280' }}>
                        <AccessTimeIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption">{notification.timestamp}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {!notification.isRead && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#8310FF', fontWeight: 600, backgroundColor: 'rgba(131, 16, 255, 0.1)', px: 1.5, py: 0.5, borderRadius: 1, display: 'inline-block' }}
                        >
                          NEW
                        </Typography>
                      )}
                      {!notification.isRead && (
                        <Typography
                          variant="caption"
                          sx={{ color: '#6b7280', fontSize: '0.75rem' }}
                        >
                          Click to mark as read
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {activeTab === 0 && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        archive(notification.id);
                      }}
                      sx={{
                        alignSelf: 'flex-start',
                        '&:hover': { backgroundColor: '#f3f4f6' }
                      }}
                      title="Archive notification"
                    >
                      <ArchiveIcon sx={{ fontSize: 20, color: '#9ca3af' }} />
                    </IconButton>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(NotificationsTab);
