import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, Chip, Tabs, Tab,
  CircularProgress, Divider, Pagination, Dialog, DialogContent,
} from '@mui/material';
import { Button } from '@/modules/shared/ui/shadcn/button';
import {
  CheckCircle2 as CheckCircleIcon,
  Info as InfoIcon,
  AlertTriangle as WarningIcon,
  AlertCircle as ErrorIcon,
  Clock as AccessTimeIcon,
  MailCheck as MarkEmailReadIcon,
  Archive as ArchiveIcon,
  Trash2 as DeleteIcon,
  Trash2 as DeleteForeverIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  ArrowRight as ArrowForwardIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/router';
import {
  useCandidateNotifications,
  useCandidateArchivedNotifications,
  useSyncCandidateArchivedCount,
} from '../hooks/useCandidateNotifications';
import type { NotificationItem } from '../hooks/useCandidateNotifications';
import { getNotifTypeStyle } from '../../shared/api/notificationApi';
import type { NotifTypeStyle } from '../../shared/api/notificationApi';

// ─── Design tokens ────────────────────────────────────────────────────────────

const T    = '#0D9488';
const TBG  = '#F0FDFA';
const TBRD = '#99F6E4';
const NAVY = '#0D1B2A';
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getIcon = (type: string) => {
  switch (type) {
    case 'success': return <CheckCircleIcon size={18} />;
    case 'warning': return <WarningIcon     size={18} />;
    case 'error':   return <ErrorIcon       size={18} />;
    default:        return <InfoIcon        size={18} />;
  }
};

// Panel uses brand teal for info/default instead of the standard blue
const TEAL_STYLE: NotifTypeStyle = { bg: TBG, color: T, border: TBRD, dot: T };
const getPanelTypeStyle = (type: string): NotifTypeStyle =>
  (type === 'success' || type === 'warning' || type === 'error')
    ? getNotifTypeStyle(type)
    : TEAL_STYLE;

const getLinkLabel = (link: string): string => {
  if (link.includes('/interview'))    return 'Start Interview';
  if (link.includes('/applications')) return 'View Applications';
  if (link.includes('/posts'))        return 'View Post';
  if (link.includes('/chat'))         return 'Open Chat';
  return 'View Details';
};

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface ConfirmState { open: boolean; type: 'single' | 'all'; id?: string }
const CLOSED: ConfirmState = { open: false, type: 'single' };

const DeleteConfirmDialog: React.FC<{
  confirm: ConfirmState;
  onCancel: () => void;
  onConfirm: () => void;
}> = ({ confirm, onCancel, onConfirm }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.notifications.${k}`);
  return (
    <Dialog open={confirm.open} onClose={onCancel}
      PaperProps={{
        sx: {
          borderRadius: '20px', p: 0, minWidth: 400, maxWidth: 420,
          overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.18)',
          border: '1px solid #F3F4F6',
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ bgcolor: '#fff', px: 3.5, pt: 4, pb: 3, textAlign: 'center' }}>
          <Box sx={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'radial-gradient(circle, #FEE2E2 60%, #FECACA 100%)',
            boxShadow: '0 0 0 10px rgba(239,68,68,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2.5,
          }}>
            <DeleteForeverIcon size={36} color='#EF4444' />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', mb: 1 }}>
            {confirm.type === 'all' ? s('confirm_delete_all_title') : s('confirm_delete_one_title')}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#9CA3AF', lineHeight: 1.7, px: 1 }}>
            {confirm.type === 'all' ? s('confirm_delete_all_body') : s('confirm_delete_one_body')}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#F3F4F6' }} />
        <div className="flex gap-2 p-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            {s('btn_cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1"
          >
            <DeleteForeverIcon size={18} />
            {s('btn_delete')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────

export type CandidateNotificationsPanelVariant = 'tab' | 'page';

interface Props {
  variant?: CandidateNotificationsPanelVariant;
}

const CandidateNotificationsPanel: React.FC<Props> = ({ variant = 'tab' }) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string) => t(`candidate_settings.notifications.${k}`);
  const router = useRouter();

  const {
    notifications, unreadCount, archivedCount,
    markAsRead, markAllAsRead, archive, archiveAll,
    deleteById, deleteAll, deleteAllArchived, isConnected,
  } = useCandidateNotifications();

  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage]           = useState(1);
  const [confirm, setConfirm]     = useState<ConfirmState>(CLOSED);

  const isOnArchivedTab = activeTab === 1;
  const isPage = variant === 'page';

  const { data: archivedNotifications = [], isLoading: archivedLoading } =
    useCandidateArchivedNotifications(isOnArchivedTab);

  useSyncCandidateArchivedCount(isOnArchivedTab, archivedLoading, archivedNotifications.length);

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

  const thisWeekCount  = notifications.filter(n => n.timestamp.includes('hour') || n.timestamp.includes('day') || n.timestamp.includes('days')).length;
  const importantCount = notifications.filter(n => n.type === 'warning' || n.type === 'error').length;

  const statItems = [
    { label: s('stat_total'),     value: notifications.length, color: T        },
    { label: s('stat_unread'),    value: unreadCount,          color: '#7C3AED' },
    { label: s('stat_this_week'), value: thisWeekCount,        color: '#0891B2' },
    { label: s('stat_important'), value: importantCount,       color: '#D97706' },
  ];

  const actionButtonClass = `rounded-lg font-semibold ${isPage ? 'text-[13px]' : 'text-xs'}`;

  const actionButtons = currentList.length > 0 && (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {!isOnArchivedTab && unreadCount > 0 && (
        <Button
          size="sm"
          variant={isPage ? 'outline' : 'ghost'}
          onClick={markAllAsRead}
          className={actionButtonClass}
          style={{ color: T, ...(isPage ? {} : { backgroundColor: TBG, border: `1px solid ${TBRD}` }) }}
        >
          <MarkEmailReadIcon size={14} />
          {s('mark_all_read')}
        </Button>
      )}
      {!isOnArchivedTab && (
        <Button
          size="sm"
          variant={isPage ? 'outline' : 'ghost'}
          onClick={() => { archiveAll(); setPage(1); }}
          className={actionButtonClass}
          style={{ color: '#6B7280', ...(isPage ? {} : { backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }) }}
        >
          <ArchiveIcon size={14} />
          {s('archive_all')}
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        onClick={() => setConfirm({ open: true, type: 'all' })}
        className={`${actionButtonClass} shadow-none`}
      >
        <DeleteForeverIcon size={14} />
        {s('delete_all')}
      </Button>
    </Box>
  );

  const emptyState = (
    <Box sx={{ py: isPage ? 10 : 6, textAlign: 'center', ...(!isPage ? { border: '2px dashed #E5E7EB', borderRadius: '12px', bgcolor: '#FAFAFA' } : {}) }}>
      <Box sx={{ width: isPage ? 64 : 56, height: isPage ? 64 : 56, borderRadius: '50%', bgcolor: isPage ? '#F3F4F6' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: isPage ? 2 : 1.5 }}>
        <InfoIcon size={isPage ? 32 : 28} color={isPage ? '#9CA3AF' : '#CBD5E1'} />
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

  const renderList = (items: NotificationItem[]) => items.map((n, index) => {
    const colors = getPanelTypeStyle(n.type);
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
                <AccessTimeIcon size={13} />
                <Typography sx={{ fontSize: '0.7rem' }}>{n.timestamp}</Typography>
              </Box>
            </Box>
            <Typography sx={{ fontSize: '0.78rem', color: '#6B7280', lineHeight: 1.5 }}>{n.message}</Typography>
            {n.link && (
              <Button
                size="sm"
                onClick={(e) => { e.stopPropagation(); if (!n.isRead) markAsRead(n.id); router.push(n.link!); }}
                className="mt-1 self-start rounded-lg px-3 py-1 text-xs font-semibold shadow-none"
              >
                {getLinkLabel(n.link!)}
                <ArrowForwardIcon size={14} />
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignSelf: 'flex-start' }}>
            {!isOnArchivedTab && (
              <IconButton size="small" title="Archive"
                onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
                sx={{ borderRadius: 1.5, '&:hover': { bgcolor: '#F1F5F9' } }}>
                <ArchiveIcon size={17} color='#9CA3AF' />
              </IconButton>
            )}
            <IconButton size="small" title="Delete"
              onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, type: 'single', id: n.id }); }}
              sx={{ borderRadius: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2', borderColor: '#FCA5A5' } }}>
              <DeleteIcon size={17} color='#EF4444' />
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
                icon={isConnected ? <WifiIcon size={14} /> : <WifiOffIcon size={14} />}
                label={isConnected ? s('connected') : s('disconnected')}
                size="small" color={isConnected ? 'success' : 'error'}
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />
            )}
            {actionButtons}
          </Box>
        </Box>
        <Box sx={{ p: 2.5 }}>
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
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: isPage ? 0 : 1.5 }}>
            {isOnArchivedTab && archivedLoading ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={24} sx={{ color: T }} />
              </Box>
            ) : visibleItems.length === 0 ? emptyState : renderList(visibleItems)}
          </Box>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2, borderTop: '1px solid #E5E7EB', mt: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} shape="rounded"
                sx={{ '& .MuiPaginationItem-root': { fontWeight: 500, '&.Mui-selected': { bgcolor: 'rgba(13,148,136,0.1)', color: T, fontWeight: 700 }, '&:hover': { bgcolor: '#F3F4F6' } } }}
              />
            </Box>
          )}
        </Box>
      </Box>
      <DeleteConfirmDialog confirm={confirm} onCancel={() => setConfirm(CLOSED)} onConfirm={handleConfirmDelete} />
    </>
  );
};

export default React.memo(CandidateNotificationsPanel);
