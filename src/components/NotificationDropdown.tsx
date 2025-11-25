import React from 'react';
import {
  Box,
  Typography,
  Popover,
  Divider,
  IconButton,
  Button,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkEmailReadIcon,
} from '@mui/icons-material';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}

// Static sample notifications for display
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Interview Completed',
    message: 'Your React Developer technical interview has been completed successfully. Results are now available for review.',
    timestamp: '2 hours ago',
    isRead: false,
    icon: 'success'
  },
  {
    id: '2',
    type: 'info',
    title: 'New Match Found',
    message: 'A new candidate matches your Senior Frontend Developer position with 95% compatibility.',
    timestamp: '5 hours ago',
    isRead: false,
    icon: 'info'
  },
  {
    id: '3',
    type: 'success',
    title: 'Purchase Successful',
    message: 'Candidate profile for John Smith has been successfully revealed. You can now view full details.',
    timestamp: '1 day ago',
    isRead: true,
    icon: 'success'
  },
  {
    id: '4',
    type: 'warning',
    title: 'Bid Update',
    message: 'Another company has placed a higher bid on candidate Jane Doe. Current price: 5000 TAI.',
    timestamp: '2 days ago',
    isRead: true,
    icon: 'warning'
  },
  {
    id: '5',
    type: 'info',
    title: 'Profile Viewed',
    message: '3 new candidates have viewed your job posting for Full Stack Developer position.',
    timestamp: '3 days ago',
    isRead: true,
    icon: 'info'
  },
];

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl,
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onViewAll,
}) => {
  // Use sample data if no notifications provided
  const displayNotifications = notifications.length > 0 ? notifications : sampleNotifications;
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircleIcon sx={{ fontSize: 20 }} />;
      case 'warning': return <WarningIcon sx={{ fontSize: 20 }} />;
      case 'error': return <ErrorIcon sx={{ fontSize: 20 }} />;
      default: return <InfoIcon sx={{ fontSize: 20 }} />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return { bg: '#d1fae5', color: '#065f46' };
      case 'warning': return { bg: '#fef3c7', color: '#92400e' };
      case 'error': return { bg: '#fee2e2', color: '#991b1b' };
      default: return { bg: '#dbeafe', color: '#1e40af' };
    }
  };

  // Show only first 5 notifications
  const displayedNotifications = displayNotifications.slice(0, 5);
  const hasMore = displayNotifications.length > 5;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }
        }
      }}
    >
      {/* Header */}
      <Box sx={{
        p: 2,
        pb: 1.5,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
          Notifications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={onMarkAllAsRead}
            sx={{
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
            title="Mark all as read"
          >
            <MarkEmailReadIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={onViewAll}
            sx={{
              '&:hover': { backgroundColor: '#f3f4f6' }
            }}
            title="Notification settings"
          >
            <SettingsIcon sx={{ fontSize: 20, color: '#6b7280' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Notifications List */}
      <Box sx={{
        maxHeight: 450,
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#f1f1f1',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#888',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#555',
        },
      }}>
        {displayedNotifications.length === 0 ? (
          <Box sx={{
            py: 8,
            px: 3,
            textAlign: 'center',
          }}>
            <Box sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 2
            }}>
              <InfoIcon sx={{ fontSize: 30, color: '#9ca3af' }} />
            </Box>
            <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
              No notifications yet
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>
              We'll notify you when something arrives
            </Typography>
          </Box>
        ) : (
          displayedNotifications.map((notification, index) => {
            const colors = getNotificationColor(notification.type);
            return (
              <React.Fragment key={notification.id}>
                <Box
                  onClick={() => onMarkAsRead(notification.id)}
                  sx={{
                    p: 2,
                    display: 'flex',
                    gap: 1.5,
                    cursor: 'pointer',
                    backgroundColor: notification.isRead ? 'transparent' : '#f9fafb',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: '#f3f4f6',
                    },
                  }}
                >
                  <Box sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: '50%',
                    backgroundColor: colors.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: colors.color,
                  }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        color: '#111827',
                        mb: 0.25,
                      }}
                    >
                      {notification.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#6b7280',
                        fontSize: '0.8125rem',
                        lineHeight: 1.4,
                        mb: 0.5,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {notification.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 12, color: '#9ca3af' }} />
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#9ca3af',
                          fontSize: '0.75rem',
                        }}
                      >
                        {notification.timestamp}
                      </Typography>
                      {!notification.isRead && (
                        <Box sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: '#3b82f6',
                          ml: 1,
                        }} />
                      )}
                    </Box>
                  </Box>
                </Box>
                {index < displayedNotifications.length - 1 && <Divider />}
              </React.Fragment>
            );
          })
        )}
      </Box>

      {/* Footer */}
      {displayedNotifications.length > 0 && (
        <Box sx={{
          p: 1.5,
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#fafafa',
        }}>
          <Button
            fullWidth
            onClick={onViewAll}
            sx={{
              textTransform: 'none',
              color: '#8310FF',
              fontWeight: 600,
              fontSize: '0.875rem',
              '&:hover': {
                backgroundColor: '#f3f4f6',
              },
            }}
          >
            {hasMore ? `View all ${displayNotifications.length} notifications` : 'View all notifications'}
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationDropdown;
