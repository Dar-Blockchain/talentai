import React, { useState } from 'react';
import {
  Box, Typography, IconButton, Button, Chip, Tabs, Tab,
  CircularProgress, Divider, Pagination,
} from '@mui/material';
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

const T    = '#0D9488';
const TBG  = '#F0FDFA';
const TBRD = '#99F6E4';
const NAVY = '#0D1B2A';
const PAGE_SIZE = 10;

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircleIcon sx={{ fontSize: 18 }} />;
    case 'warning': return <WarningIcon     sx={{ fontSize: 18 }} />;
    case 'error':   return <ErrorIcon       sx={{ fontSize: 18 }} />;
    default:        return <InfoIcon        sx={{ fontSize: 18 }} />;
  }
};

const getColors = (type: string) => {
  switch (type) {
    case 'success': return { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' };
    case 'warning': return { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' };
    case 'error':   return { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' };
    default:        return { bg: TBG,       color: T,         border: TBRD      };
  }
};

// "tab" = embedded in settings (shows stats, connection chip, archive tab)
// "page" = full-page DashboardLayout view (shows pagination, no stats/tabs)
export type NotificationsPanelVariant = 'tab' | 'page';

interface Props {
  variant?: NotificationsPanelVariant;
}

const NotificationsPanel: React.FC<Props> = ({ variant = 'tab' }) => {
  const dispatch = useDispatch<AppDispatch>();
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

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);

  React.useEffect(() => {
    if (variant === 'tab' && activeTab === 1) dispatch(fetchArchivedNotifications());
  }, [activeTab, dispatch, variant]);

  const isPage = variant === 'page';

  // Page variant uses pagination on active notifications only
  const totalPages = isPage ? Math.ceil(notifications.length / PAGE_SIZE) : 0;
  const pagedNotifications = isPage
    ? notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : activeTab === 0 ? notifications : archivedNotifications;

  const isLoading = !isPage && activeTab === 1 && archivedLoading;

  const handleArchive = (id: string) => {
    archive(id);
    if (isPage && pagedNotifications.length === 1 && page > 1) setPage(p => p - 1);
  };

  // Stats (tab variant only)
  const thisWeekCount = notifications.filter(n =>
    n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')
  ).length;
  const importantCount = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  const statItems = [
    { label: s('stat_total'),     value: notifications.length, color: T },
    { label: s('stat_unread'),    value: unreadCount,          color: '#7C3AED' },
    { label: s('stat_this_week'), value: thisWeekCount,        color: '#0891B2' },
    { label: s('stat_important'), value: importantCount,       color: '#D97706' },
  ];

  const actionButtons = (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {unreadCount > 0 && (
        <Button size="small" variant={isPage ? 'outlined' : 'text'}
          startIcon={<MarkEmailReadIcon sx={{ fontSize: '14px !important' }} />}
          onClick={markAllAsRead}
          sx={{
            textTransform: 'none', fontWeight: 600, fontSize: isPage ? 13 : '0.75rem',
            color: T, ...(isPage ? { borderRadius: 2 } : { bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: '#CCFBF1' } }),
          }}>
          {s('mark_all_read')}
        </Button>
      )}
      <Button size="small" variant={isPage ? 'outlined' : 'text'}
        startIcon={<ArchiveIcon sx={{ fontSize: '14px !important' }} />}
        onClick={() => { archiveAll(); if (isPage) setPage(1); }}
        sx={{
          textTransform: 'none', fontWeight: 600, fontSize: isPage ? 13 : '0.75rem',
          color: '#6B7280', ...(isPage ? { borderRadius: 2, borderColor: '#E5E7EB' } : { bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: '#F3F4F6' } }),
        }}>
        {s('archive_all')}
      </Button>
    </Box>
  );

  const emptyState = (
    <Box sx={{ py: isPage ? 10 : 6, textAlign: 'center', ...(isPage ? {} : { border: '2px dashed #E5E7EB', borderRadius: '12px', bgcolor: '#FAFAFA' }) }}>
      <Box sx={{ width: isPage ? 64 : 56, height: isPage ? 64 : 56, borderRadius: '50%', bgcolor: isPage ? '#F3F4F6' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: isPage ? 2 : 1.5 }}>
        <InfoIcon sx={{ fontSize: isPage ? 32 : 28, color: isPage ? '#9CA3AF' : '#CBD5E1' }} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: isPage ? '0.9rem' : '0.9rem', color: isPage ? '#374151' : NAVY, mb: 0.5 }}>
        {activeTab === 0 ? (isPage ? 'No notifications' : s('empty_title')) : s('empty_archived_title')}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
        {activeTab === 0
          ? (isPage ? "We'll notify you when something arrives" : isConnected ? s('empty_subtitle') : s('empty_connecting'))
          : s('empty_archived_subtitle')}
      </Typography>
    </Box>
  );

  const notificationList = (items: any[]) => items.map((n: any, index: number) => {
    const colors = getColors(n.type);
    return (
      <React.Fragment key={n.id}>
        <Box
          onClick={() => !n.isRead && markAsRead(n.id)}
          sx={{
            p: isPage ? 2.5 : 2,
            display: 'flex', gap: isPage ? 2 : 1.5, alignItems: 'flex-start',
            borderRadius: isPage ? 0 : '12px',
            border: isPage ? 'none' : `1px solid ${n.isRead ? '#F1F5F9' : colors.border}`,
            bgcolor: n.isRead ? (isPage ? 'transparent' : '#FAFAFA') : (isPage ? '#F9FAFB' : colors.bg),
            cursor: !n.isRead ? 'pointer' : 'default',
            transition: 'background-color 0.15s',
            '&:hover': { bgcolor: isPage ? '#F3F4F6' : undefined, boxShadow: isPage ? 'none' : '0 2px 8px rgba(0,0,0,0.06)' },
          }}
        >
          <Box sx={{
            width: isPage ? 42 : 36, height: isPage ? 42 : 36,
            minWidth: isPage ? 42 : 36,
            borderRadius: isPage ? '50%' : '10px',
            bgcolor: colors.bg, border: isPage ? 'none' : `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.color, flexShrink: 0,
          }}>
            {getIcon(n.type)}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: NAVY }}>{n.title}</Typography>
                {!n.isRead && (
                  <Chip label={isPage ? 'New' : s('badge_new')} size="small" sx={{
                    height: 18, fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: isPage ? '#EFF6FF' : TBG,
                    color: isPage ? '#1D4ED8' : T,
                    border: `1px solid ${isPage ? '#BFDBFE' : TBRD}`,
                  }} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#94A3B8', flexShrink: 0 }}>
                <AccessTimeIcon sx={{ fontSize: 13 }} />
                <Typography sx={{ fontSize: '0.7rem' }}>{n.timestamp}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{n.message}</Typography>
          </Box>
          {(isPage || activeTab === 0) && (
            <IconButton size="small" title="Archive"
              onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
              sx={{ alignSelf: 'flex-start', '&:hover': { bgcolor: '#F1F5F9' } }}>
              <ArchiveIcon sx={{ fontSize: isPage ? 18 : 17, color: '#9CA3AF' }} />
            </IconButton>
          )}
        </Box>
        {isPage && index < items.length - 1 && <Divider />}
      </React.Fragment>
    );
  });

  return (
    <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', mb: isPage ? 0 : 2 }}>

      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: NAVY }}>
            {isPage ? 'Notifications' : s('title')}
          </Typography>
          {!isPage && (
            <Typography sx={{ fontSize: '0.72rem', color: '#94A3B8', mt: 0.25 }}>{s('subtitle')}</Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {!isPage && (
            <Chip
              icon={isConnected ? <WifiIcon sx={{ fontSize: '14px !important' }} /> : <WifiOffIcon sx={{ fontSize: '14px !important' }} />}
              label={isConnected ? s('connected') : s('disconnected')}
              size="small"
              color={isConnected ? 'success' : 'error'}
              sx={{ fontWeight: 600, fontSize: '0.72rem' }}
            />
          )}
          {notifications.length > 0 && (activeTab === 0 || isPage) && actionButtons}
        </Box>
      </Box>

      <Box sx={{ p: 2.5 }}>
        {/* Stats (tab variant only) */}
        {!isPage && (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5, mb: 2.5 }}>
            {statItems.map(({ label, value, color }) => (
              <Box key={label} sx={{ textAlign: 'center', p: 1.5, borderRadius: '12px', border: '1px solid #F1F5F9', bgcolor: '#FAFAFA' }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1 }}>{value}</Typography>
                <Typography sx={{ fontSize: '0.68rem', color: '#94A3B8', mt: 0.5, fontWeight: 600 }}>{label}</Typography>
              </Box>
            ))}
          </Box>
        )}

        {/* Tabs (tab variant only) */}
        {!isPage && (
          <Box sx={{ borderBottom: '1px solid #F1F5F9', mb: 2 }}>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', minHeight: 40, py: 0.5 },
                '& .Mui-selected': { color: T },
                '& .MuiTabs-indicator': { backgroundColor: T, height: 2 },
              }}>
              <Tab label={t('candidate_settings.notifications.tab_active', { count: nonArchivedCount || notifications.length })} />
              <Tab label={t('candidate_settings.notifications.tab_archived', { count: archivedCount || archivedNotifications.length })} />
            </Tabs>
          </Box>
        )}

        {/* List */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: isPage ? 0 : 1.5 }}>
          {isLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={24} sx={{ color: T }} />
            </Box>
          ) : pagedNotifications.length === 0 ? emptyState
            : notificationList(pagedNotifications)
          }
        </Box>

        {/* Pagination (page variant only) */}
        {isPage && totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, borderTop: '1px solid #E5E7EB' }}>
            <Pagination
              count={totalPages} page={page}
              onChange={(_, v) => setPage(v)}
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 500,
                  '&.Mui-selected': { bgcolor: 'rgba(131,16,255,0.1)', color: '#8310FF', fontWeight: 700 },
                  '&:hover': { bgcolor: '#F3F4F6' },
                },
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(NotificationsPanel);
