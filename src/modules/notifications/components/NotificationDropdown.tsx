import React from 'react';
import {
  Box, Typography, Popover, Divider, IconButton, Button, Chip, Tooltip,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Settings as SettingsIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Archive as ArchiveIcon,
  DeleteOutline as DeleteIcon,
  NotificationsNone as EmptyIcon,
  Circle as DotIcon,
} from '@mui/icons-material';

// ─── Types ───────────────────────────────────────────────────────────────────

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
  anchorEl:       HTMLElement | null;
  open:           boolean;
  unreadCount:    number;
  onClose:        () => void;
  notifications:  Notification[];
  onMarkAsRead:   (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll:      () => void;
  onArchive:      (id: string) => void;
  onArchiveAll:   () => void;
  onDelete:       (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  success: { icon: <CheckCircleIcon sx={{ fontSize: 16 }} />, bg: '#D1FAE5', color: '#065F46', border: '#6EE7B7', dot: '#10B981' },
  warning: { icon: <WarningIcon     sx={{ fontSize: 16 }} />, bg: '#FEF3C7', color: '#92400E', border: '#FCD34D', dot: '#F59E0B' },
  error:   { icon: <ErrorIcon       sx={{ fontSize: 16 }} />, bg: '#FEE2E2', color: '#991B1B', border: '#FCA5A5', dot: '#EF4444' },
  info:    { icon: <InfoIcon        sx={{ fontSize: 16 }} />, bg: '#DBEAFE', color: '#1E40AF', border: '#93C5FD', dot: '#3B82F6' },
};

const cfg = (type: string) => TYPE_CONFIG[type as keyof typeof TYPE_CONFIG] ?? TYPE_CONFIG.info;

// ─── Component ───────────────────────────────────────────────────────────────

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  anchorEl, open, onClose,
  notifications, unreadCount,
  onMarkAsRead, onMarkAllAsRead,
  onViewAll, onArchive, onArchiveAll, onDelete,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, params?: Record<string, string | number>) =>
    t(`candidate_settings.notifications.${k}`, params);

  const displayed = notifications.slice(0, 6);
  const hasMore   = notifications.length > 6;

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      disableScrollLock
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top',    horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: 400,
            maxHeight: 560,
            mt: 1,
            borderRadius: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
            overflow: 'hidden',
            border: '1px solid #F1F5F9',
          },
        },
      }}
    >
      {/* ── Header ── */}
      <Box sx={{ px: 2.5, pt: 2, pb: 1.5, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', color: '#0D1B2A' }}>
              {s('dropdown_title')}
            </Typography>
            {unreadCount > 0 && (
              <Chip
                label={s('dropdown_new_count', { count: unreadCount })}
                size="small"
                sx={{
                  height: 20, fontSize: '0.68rem', fontWeight: 700,
                  bgcolor: '#FEE2E2', color: '#EF4444',
                  border: '1px solid #FECACA',
                  '& .MuiChip-label': { px: 1 },
                }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {unreadCount > 0 && (
              <Tooltip title={s('tooltip_mark_all_read')} placement="top">
                <IconButton size="small" onClick={onMarkAllAsRead}
                  sx={{ width: 28, height: 28, borderRadius: '8px', '&:hover': { bgcolor: '#F0FDFA', color: '#0D9488' } }}>
                  <MarkEmailReadIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                </IconButton>
              </Tooltip>
            )}
            {notifications.length > 0 && (
              <Tooltip title={s('tooltip_archive_all')} placement="top">
                <IconButton size="small" onClick={onArchiveAll}
                  sx={{ width: 28, height: 28, borderRadius: '8px', '&:hover': { bgcolor: '#F9FAFB', color: '#374151' } }}>
                  <ArchiveIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={s('tooltip_settings')} placement="top">
              <IconButton size="small" onClick={onViewAll}
                sx={{ width: 28, height: 28, borderRadius: '8px', '&:hover': { bgcolor: '#F9FAFB', color: '#374151' } }}>
                <SettingsIcon sx={{ fontSize: 16, color: '#6B7280' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {/* ── List ── */}
      <Box sx={{ maxHeight: 420, overflowY: 'auto', '&::-webkit-scrollbar': { width: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#E5E7EB', borderRadius: 4 } }}>
        {displayed.length === 0 ? (
          /* Empty state */
          <Box sx={{ py: 8, textAlign: 'center', px: 3 }}>
            <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
              <EmptyIcon sx={{ fontSize: 28, color: '#CBD5E1' }} />
            </Box>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151', mb: 0.5 }}>
              {s('dropdown_empty_title')}
            </Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#9CA3AF', lineHeight: 1.5 }}>
              {s('dropdown_empty_subtitle')}
            </Typography>
          </Box>
        ) : (
          displayed.map((n, i) => {
            const c = cfg(n.type);
            return (
              <React.Fragment key={n.id}>
                <Box
                  onClick={() => !n.isRead && onMarkAsRead(n.id)}
                  sx={{
                    px: 2.5, py: 1.5,
                    display: 'flex', gap: 1.5, alignItems: 'flex-start',
                    cursor: !n.isRead ? 'pointer' : 'default',
                    bgcolor: n.isRead ? 'transparent' : '#FAFEFF',
                    borderLeft: `3px solid ${n.isRead ? 'transparent' : c.dot}`,
                    transition: 'background 0.15s',
                    '&:hover': {
                      bgcolor: '#F8FAFC',
                      '& .notif-actions': { opacity: 1 },
                    },
                    position: 'relative',
                  }}
                >
                  {/* Icon */}
                  <Box sx={{
                    width: 34, height: 34, minWidth: 34, borderRadius: '10px',
                    bgcolor: c.bg, color: c.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, mt: 0.25,
                  }}>
                    {c.icon}
                  </Box>

                  {/* Text */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      <Typography sx={{ fontWeight: n.isRead ? 500 : 700, fontSize: '0.82rem', color: '#0D1B2A', lineHeight: 1.3 }}>
                        {n.title}
                      </Typography>
                      {!n.isRead && (
                        <DotIcon sx={{ fontSize: 7, color: c.dot, flexShrink: 0 }} />
                      )}
                    </Box>
                    <Typography sx={{ fontSize: '0.75rem', color: '#6B7280', lineHeight: 1.45, mb: 0.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {n.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 11, color: '#9CA3AF' }} />
                      <Typography sx={{ fontSize: '0.7rem', color: '#9CA3AF' }}>{n.timestamp}</Typography>
                    </Box>
                  </Box>

                  {/* Action buttons — visible on hover */}
                  <Box className="notif-actions" sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, opacity: 0, transition: 'opacity 0.15s', flexShrink: 0 }}>
                    <Tooltip title={s('tooltip_archive')} placement="left">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onArchive(n.id); }}
                        sx={{ width: 24, height: 24, borderRadius: '6px', '&:hover': { bgcolor: '#F1F5F9' } }}>
                        <ArchiveIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={s('tooltip_delete')} placement="left">
                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                        sx={{ width: 24, height: 24, borderRadius: '6px', '&:hover': { bgcolor: '#FEE2E2' } }}>
                        <DeleteIcon sx={{ fontSize: 14, color: '#EF4444' }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                {i < displayed.length - 1 && <Divider sx={{ mx: 2.5, borderColor: '#F8FAFC' }} />}
              </React.Fragment>
            );
          })
        )}
      </Box>

      {/* ── Footer ── */}
      {displayed.length > 0 && (
        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #F1F5F9', bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button
            fullWidth
            onClick={onViewAll}
            sx={{
              textTransform: 'none', fontWeight: 600, fontSize: '0.82rem',
              color: '#0D9488', borderRadius: '10px', py: 0.75,
              '&:hover': { bgcolor: '#F0FDFA' },
            }}
          >
            {hasMore ? s('view_all_count', { count: notifications.length }) : s('view_all')}
          </Button>
        </Box>
      )}
    </Popover>
  );
};

export default NotificationDropdown;
