"use client";
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Badge } from '@mui/material';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { NotificationsNoneRounded, NotificationsRounded } from '@mui/icons-material';

const HeaderNotification = () => {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.user.connectedUser);
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const isCompany = useMemo(() => user?.role?.toLowerCase() === 'company', [user?.role]);

  const { notifications, unreadCount, markAsRead, markAllAsRead, archive, archiveAll, deleteById } = useNotifications();

  const isOpen = Boolean(anchor);

  const handleOpen  = useCallback((e: React.MouseEvent<HTMLElement>) => setAnchor(e.currentTarget), []);
  const handleClose = useCallback(() => setAnchor(null), []);
  const handleViewAll = useCallback(() => {
    setAnchor(null);
    router.push('/notifications');
  }, [router, isCompany]);

  return (
    <>
      <Box
        onClick={handleOpen}
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 34, height: 34, borderRadius: '9px', cursor: 'pointer',
          bgcolor: isOpen ? 'rgba(13,148,136,0.10)' : '#F9FAFB',
          border: `1px solid ${isOpen ? 'rgba(13,148,136,0.25)' : '#F3F4F6'}`,
          transition: 'all 0.18s',
          '&:hover': { bgcolor: '#F3F4F6', borderColor: '#E5E7EB' },
        }}
      >
        <Badge
          badgeContent={unreadCount > 9 ? '9+' : unreadCount || undefined}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: '#EF4444',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
              minWidth: 15,
              height: 15,
              padding: 0,
              boxShadow: '0 0 0 1.5px #fff',
              ...(unreadCount > 0 && {
                animation: 'badgePop 0.3s ease',
                '@keyframes badgePop': {
                  '0%':   { transform: 'scale(0.6)' },
                  '60%':  { transform: 'scale(1.2)' },
                  '100%': { transform: 'scale(1)' },
                },
              }),
            },
          }}
        >
          {isOpen
            ? <NotificationsRounded    sx={{ fontSize: 19, color: '#0D9488' }} />
            : <NotificationsNoneRounded sx={{ fontSize: 19, color: '#374151', transition: 'color 0.15s' }} />
          }
        </Badge>
      </Box>

      <NotificationDropdown
        anchorEl={anchor}
        open={isOpen}
        onClose={handleClose}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={handleViewAll}
        onArchive={archive}
        onArchiveAll={archiveAll}
        onDelete={deleteById}
        unreadCount={unreadCount}
      />
    </>
  );
};

export default HeaderNotification;
