import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { Notification } from '@/types/profile';

interface NotificationsTabProps {
  notifications: Notification[];
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ notifications }) => {
  const totalNotifications = notifications.length;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  const thisWeekNotifications = notifications.filter(n =>
    n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')
  ).length;
  const importantNotifications = notifications.filter(n => n.type === 'warning').length;

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

  return (
    <Card sx={{ borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', mb: 3 }}>
      <CardContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ backgroundColor: 'rgba(131, 16, 255, 0.04)', p: 3, borderRadius: 2, mb: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            Notification History
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            View and manage all your notifications
          </Typography>
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
          {notifications.map((notification) => {
            const colors = getNotificationColor(notification.type);
            return (
              <Box
                key={notification.id}
                sx={{
                  p: 3,
                  borderRadius: 2,
                  border: `1px solid ${colors.border}`,
                  backgroundColor: notification.isRead ? '#ffffff' : colors.bg,
                  display: 'flex',
                  gap: 2,
                  transition: 'all 0.2s',
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
                  <Typography variant="body2" sx={{ color: '#6b7280' }}>
                    {notification.message}
                  </Typography>
                  {!notification.isRead && (
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{ color: '#8310FF', fontWeight: 600, backgroundColor: 'rgba(131, 16, 255, 0.1)', px: 1.5, py: 0.5, borderRadius: 1, display: 'inline-block' }}
                      >
                        NEW
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default React.memo(NotificationsTab);
