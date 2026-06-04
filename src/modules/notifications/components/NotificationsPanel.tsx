import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Button, Chip, Tabs, Tab,
  CircularProgress, Divider, Pagination, Dialog, DialogContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Archive as ArchiveIcon,
  DeleteOutline as DeleteIcon,
  DeleteForever as DeleteForeverIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
} from '@mui/icons-material';
import { useNotifications } from '../context/NotificationContext';
import { useArchivedNotificationsQuery, NOTIF_KEYS } from '../hooks/useNotifications';
import { useQueryClient } from '@tanstack/react-query';
import type { NotificationsData } from '../api/notificationApi';
import type { NotificationItem } from '../api/notificationApi';
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

// ─── Confirm Dialog ───────────────────────────────────────────────────────────

interface ConfirmState {
  open: boolean;
  type: 'single' | 'all';
  id?:  string;
}

const CLOSED: ConfirmState = { open: false, type: 'single' };

interface DeleteConfirmDialogProps {
  confirm: ConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({ confirm, onCancel, onConfirm }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.notifications.${k}`);
  return (
  <Dialog
    open={confirm.open}
    onClose={onCancel}
    PaperProps={{
      sx: {
        borderRadius: '20px',
        p: 0,
        minWidth: 400,
        maxWidth: 420,
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
        border: '1px solid #F3F4F6',
      },
    }}
  >
    <DialogContent sx={{ p: 0 }}>
      {/* Top section */}
      <Box sx={{ bgcolor: '#fff', px: 3.5, pt: 4, pb: 3, textAlign: 'center' }}>
        {/* Outer glow ring + icon */}
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'radial-gradient(circle, #FEE2E2 60%, #FECACA 100%)',
          boxShadow: '0 0 0 10px rgba(239,68,68,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
        }}>
          <DeleteForeverIcon sx={{ fontSize: 36, color: '#EF4444' }} />
        </Box>

        <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', mb: 1 }}>
          {confirm.type === 'all' ? s('confirm_delete_all_title') : s('confirm_delete_one_title')}
        </Typography>
        <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.7, px: 1 }}>
          {confirm.type === 'all' ? s('confirm_delete_all_body') : s('confirm_delete_one_body')}
        </Typography>
      </Box>

      {/* Divider */}
      <Divider sx={{ borderColor: '#F3F4F6' }} />

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 1.5, px: 3.5, py: 3, bgcolor: '#FAFAFA' }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={onCancel}
          sx={{
            textTransform: 'none', fontWeight: 600, fontSize: '0.9rem',
            borderRadius: '12px', borderColor: '#E5E7EB', color: '#374151',
            bgcolor: '#fff', py: 1.25,
            '&:hover': { borderColor: '#D1D5DB', bgcolor: '#F9FAFB' },
          }}
        >
          {s('btn_cancel')}
        </Button>
        <Button
          fullWidth
          variant="contained"
          onClick={onConfirm}
          startIcon={<DeleteForeverIcon sx={{ fontSize: '18px !important' }} />}
          sx={{
            textTransform: 'none', fontWeight: 700, fontSize: '0.9rem',
            borderRadius: '12px', py: 1.25,
            bgcolor: '#EF4444', color: '#fff',
            boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
            border: '1px solid #EF4444',
            '&:hover': {
              bgcolor: '#DC2626',
              boxShadow: '0 6px 20px rgba(239,68,68,0.45)',
              border: '1px solid #DC2626',
            },
          }}
        >
          {s('btn_delete')}
        </Button>
      </Box>
    </DialogContent>
  </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export type NotificationsPanelVariant = 'tab' | 'page';

interface Props {
  variant?: NotificationsPanelVariant;
}

const NotificationsPanel: React.FC<Props> = ({ variant = 'tab' }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.notifications.${k}`);

  const {
    notifications, unreadCount, archivedCount,
    markAsRead, markAllAsRead, archive, archiveAll,
    deleteById, deleteAll, deleteAllArchived, isConnected,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage]           = useState(1);
  const [confirm, setConfirm]     = useState<ConfirmState>(CLOSED);

  const qc = useQueryClient();
  const isOnArchivedTab = activeTab === 1;
  const { data: archivedNotifications = [], isLoading: archivedLoading } =
    useArchivedNotificationsQuery(isOnArchivedTab);

  // Sync archivedCount in cache once archived data loads to correct any drift from double-counting
  useEffect(() => {
    if (!isOnArchivedTab || archivedLoading) return;
    qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
      if (!old || old.archivedCount === archivedNotifications.length) return old;
      return { ...old, archivedCount: archivedNotifications.length };
    });
  }, [isOnArchivedTab, archivedLoading, archivedNotifications.length, qc]);

  const isPage = variant === 'page';

  const currentList  = isOnArchivedTab ? archivedNotifications : notifications;
  const totalPages   = Math.ceil(currentList.length / PAGE_SIZE);
  const visibleItems = currentList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (_: React.SyntheticEvent, value: number) => {
    setActiveTab(value);
    setPage(1);
  };

  const handleArchive = (id: string) => {
    archive(id);
    if (visibleItems.length === 1 && page > 1) setPage(p => p - 1);
  };

  const handleConfirmDelete = () => {
    if (confirm.type === 'all') {
      isOnArchivedTab ? deleteAllArchived() : deleteAll();
      setPage(1);
    } else if (confirm.id) {
      deleteById(confirm.id);
      if (visibleItems.length === 1 && page > 1) setPage(p => p - 1);
    }
    setConfirm(CLOSED);
  };

  // Stats
  const thisWeekCount  = notifications.filter(n => n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')).length;
  const importantCount = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  const statItems = [
    { label: s('stat_total'),     value: notifications.length, color: T        },
    { label: s('stat_unread'),    value: unreadCount,          color: '#7C3AED' },
    { label: s('stat_this_week'), value: thisWeekCount,        color: '#0891B2' },
    { label: s('stat_important'), value: importantCount,       color: '#D97706' },
  ];

  const btnBase = {
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: isPage ? 13 : '0.75rem',
  };

  const actionButtons = currentList.length > 0 && (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {!isOnArchivedTab && unreadCount > 0 && (
        <Button size="small" variant={isPage ? 'outlined' : 'text'}
          startIcon={<MarkEmailReadIcon sx={{ fontSize: '14px !important' }} />}
          onClick={markAllAsRead}
          sx={{
            ...btnBase, color: T,
            ...(isPage
              ? { borderRadius: 2 }
              : { bgcolor: TBG, border: `1px solid ${TBRD}`, borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: '#CCFBF1' } }),
          }}>
          {s('mark_all_read')}
        </Button>
      )}
      {!isOnArchivedTab && (
        <Button size="small" variant={isPage ? 'outlined' : 'text'}
          startIcon={<ArchiveIcon sx={{ fontSize: '14px !important' }} />}
          onClick={() => { archiveAll(); setPage(1); }}
          sx={{
            ...btnBase, color: '#6B7280',
            ...(isPage
              ? { borderRadius: 2, borderColor: '#E5E7EB' }
              : { bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', px: 1.5, '&:hover': { bgcolor: '#F3F4F6' } }),
          }}>
          {s('archive_all')}
        </Button>
      )}
      <Button size="small" variant="contained"
        startIcon={<DeleteForeverIcon sx={{ fontSize: '14px !important' }} />}
        onClick={() => setConfirm({ open: true, type: 'all' })}
        sx={{
          ...btnBase,
          bgcolor: '#EF4444', color: '#fff', boxShadow: 'none',
          borderRadius: isPage ? 2 : '8px',
          px: isPage ? undefined : 1.5,
          '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' },
        }}>
        {s('delete_all')}
      </Button>
    </Box>
  );

  const emptyState = (
    <Box sx={{ py: isPage ? 10 : 6, textAlign: 'center', ...(!isPage ? { border: '2px dashed #E5E7EB', borderRadius: '12px', bgcolor: '#FAFAFA' } : {}) }}>
      <Box sx={{ width: isPage ? 64 : 56, height: isPage ? 64 : 56, borderRadius: '50%', bgcolor: isPage ? '#F3F4F6' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: isPage ? 2 : 1.5 }}>
        <InfoIcon sx={{ fontSize: isPage ? 32 : 28, color: isPage ? '#9CA3AF' : '#CBD5E1' }} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem', color: isPage ? '#374151' : NAVY, mb: 0.5 }}>
        {isOnArchivedTab ? s('empty_archived_title') : s(isPage ? 'page_empty_title' : 'empty_title')}
      </Typography>
      <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF' }}>
        {isOnArchivedTab
          ? s('empty_archived_subtitle')
          : (isPage ? s('page_empty_subtitle') : isConnected ? s('empty_subtitle') : s('empty_connecting'))}
      </Typography>
    </Box>
  );

  const notificationList = (items: NotificationItem[]) => items.map((n, index) => {
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
            width: isPage ? 42 : 36, height: isPage ? 42 : 36, minWidth: isPage ? 42 : 36,
            borderRadius: isPage ? '50%' : '10px', bgcolor: colors.bg,
            border: isPage ? 'none' : `1px solid ${colors.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.color, flexShrink: 0,
          }}>
            {getIcon(n.type)}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.85rem', color: NAVY }}>{n.title}</Typography>
                {!n.isRead && (
                  <Chip label={s(isPage ? 'badge_new_inline' : 'badge_new')} size="small" sx={{
                    height: 18, fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: isPage ? '#EFF6FF' : TBG,
                    color:   isPage ? '#1D4ED8' : T,
                    border:  `1px solid ${isPage ? '#BFDBFE' : TBRD}`,
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

          {/* Action buttons per item */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignSelf: 'flex-start' }}>
            {!isOnArchivedTab && (
              <IconButton size="small" title="Archive"
                onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
                sx={{ borderRadius: 1.5, '&:hover': { bgcolor: '#F1F5F9' } }}>
                <ArchiveIcon sx={{ fontSize: 17, color: '#9CA3AF' }} />
              </IconButton>
            )}
            <IconButton size="small" title="Delete"
              onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, type: 'single', id: n.id }); }}
              sx={{
                borderRadius: 1.5,
                bgcolor: '#FEF2F2',
                border: '1px solid #FECACA',
                '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' },
              }}>
              <DeleteIcon sx={{ fontSize: 17, color: '#EF4444' }} />
            </IconButton>
          </Box>
        </Box>
        {isPage && index < items.length - 1 && <Divider />}
      </React.Fragment>
    );
  });

  return (
    <>
      <Box sx={{ bgcolor: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', mb: isPage ? 0 : 2 }}>

        {/* Header */}
        <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: NAVY }}>
              {s(isPage ? 'page_title' : 'title')}
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
            {actionButtons}
          </Box>
        </Box>

        <Box sx={{ p: 2.5 }}>
          {/* Stats — tab variant only */}
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

          {/* Tabs — both variants */}
          <Box sx={{ borderBottom: '1px solid #F1F5F9', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}
              sx={{
                minHeight: 40,
                '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.82rem', minHeight: 40, py: 0.5 },
                '& .Mui-selected': { color: T },
                '& .MuiTabs-indicator': { backgroundColor: T, height: 2 },
              }}>
              <Tab label={t('candidate_settings.notifications.tab_active', { count: notifications.length })} />
              <Tab label={t('candidate_settings.notifications.tab_archived', { count: archivedCount })} />
            </Tabs>
          </Box>

          {/* List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isPage ? 0 : 1.5 }}>
            {isOnArchivedTab && archivedLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ color: T }} />
              </Box>
            ) : visibleItems.length === 0 ? emptyState
              : notificationList(visibleItems)
            }
          </Box>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, borderTop: '1px solid #E5E7EB', mt: 2 }}>
              <Pagination
                count={totalPages} page={page}
                onChange={(_, v) => setPage(v)}
                shape="rounded"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontWeight: 500,
                    '&.Mui-selected': { bgcolor: 'rgba(13,148,136,0.1)', color: T, fontWeight: 700 },
                    '&:hover': { bgcolor: '#F3F4F6' },
                  },
                }}
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Confirmation dialog */}
      <DeleteConfirmDialog
        confirm={confirm}
        onCancel={() => setConfirm(CLOSED)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default React.memo(NotificationsPanel);
