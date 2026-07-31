import React, { useState } from 'react';
import { ConfirmDialog } from '@/modules/shared/ui/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger } from '@/modules/shared/ui/shadcn/tabs';
import { Badge } from '@/modules/shared/ui/shadcn/badge';
import { Spinner } from '@/modules/shared/ui/shadcn/spinner';
import { Pagination } from '@/modules/shared/ui/shadcn/pagination';
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
    <ConfirmDialog
      open={confirm.open}
      onCancel={onCancel}
      onConfirm={onConfirm}
      icon={DeleteForeverIcon}
      title={confirm.type === 'all' ? s('confirm_delete_all_title') : s('confirm_delete_one_title')}
      description={confirm.type === 'all' ? s('confirm_delete_all_body') : s('confirm_delete_one_body')}
      cancelLabel={s('btn_cancel')}
      confirmLabel={s('btn_delete')}
    />
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

  const handleTabChange = (value: string) => {
    setActiveTab(Number(value));
    setPage(1);
  };

  const handleArchive = (id: string) => {
    archive(id);
    if (visibleItems.length === 1 && page > 1) setPage(p => p - 1);
  };

  const handleConfirmDelete = () => {
    if (confirm.type === 'all') {
      if (isOnArchivedTab) {
        deleteAllArchived();
      } else {
        deleteAll();
      }
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
    <div className="flex flex-wrap gap-2">
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
    </div>
  );

  const emptyState = (
    <div className={`text-center ${isPage ? 'py-10' : 'py-6 rounded-xl border-2 border-dashed border-[#E5E7EB] bg-[#FAFAFA]'}`}>
      <div className={`mx-auto flex items-center justify-center rounded-full ${isPage ? 'w-16 h-16 mb-4 bg-[#F3F4F6]' : 'w-14 h-14 mb-3 bg-[#F1F5F9]'}`}>
        <InfoIcon size={isPage ? 32 : 28} color={isPage ? '#9CA3AF' : '#CBD5E1'} />
      </div>
      <p className="mb-0.5 text-[0.9rem] font-semibold" style={{ color: isPage ? '#374151' : NAVY }}>
        {isOnArchivedTab ? s('empty_archived_title') : s(isPage ? 'page_empty_title' : 'empty_title')}
      </p>
      <p className="text-[0.78rem] text-[#9CA3AF]">
        {isOnArchivedTab
          ? s('empty_archived_subtitle')
          : (isPage ? s('page_empty_subtitle') : isConnected ? s('empty_subtitle') : s('empty_connecting'))}
      </p>
    </div>
  );

  const renderList = (items: NotificationItem[]) => items.map((n, index) => {
    const colors = getPanelTypeStyle(n.type);
    return (
      <React.Fragment key={n.id}>
        <div
          onClick={() => !n.isRead && markAsRead(n.id)}
          className={`flex items-start transition-colors hover:[box-shadow:var(--row-hover-shadow)] hover:bg-[var(--row-hover-bg)] ${isPage ? 'gap-4 p-5 rounded-none' : 'gap-3 p-4 rounded-xl'} ${!n.isRead ? 'cursor-pointer' : 'cursor-default'}`}
          style={{
            border: isPage ? 'none' : `1px solid ${n.isRead ? '#F1F5F9' : colors.border}`,
            backgroundColor: n.isRead ? (isPage ? 'transparent' : '#FAFAFA') : (isPage ? '#F9FAFB' : colors.bg),
            ['--row-hover-bg' as string]: isPage ? '#F3F4F6' : (n.isRead ? '#FAFAFA' : colors.bg),
            ['--row-hover-shadow' as string]: isPage ? 'none' : '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          <div
            className={`flex shrink-0 items-center justify-center ${isPage ? 'w-[42px] h-[42px] rounded-full' : 'w-9 h-9 rounded-[10px]'}`}
            style={{ background: colors.bg, border: isPage ? 'none' : `1px solid ${colors.border}`, color: colors.color }}
          >
            {getIcon(n.type)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[0.85rem] font-semibold" style={{ color: NAVY }}>{n.title}</span>
                {!n.isRead && (
                  <Badge
                    variant="outline"
                    className="h-[18px] rounded-full text-[0.65rem] font-bold"
                    style={{
                      backgroundColor: isPage ? '#EFF6FF' : TBG,
                      color: isPage ? '#1D4ED8' : T,
                      borderColor: isPage ? '#BFDBFE' : TBRD,
                    }}
                  >
                    {s(isPage ? 'badge_new_inline' : 'badge_new')}
                  </Badge>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1 text-[#94A3B8]">
                <AccessTimeIcon size={13} />
                <span className="text-[0.7rem]">{n.timestamp}</span>
              </div>
            </div>
            <p className="text-[0.78rem] leading-[1.5] text-[#6B7280]">{n.message}</p>
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
          </div>
          <div className="flex shrink-0 flex-col gap-0.5 self-start">
            {!isOnArchivedTab && (
              <button title="Archive"
                onClick={(e) => { e.stopPropagation(); handleArchive(n.id); }}
                className="rounded-md p-1.5 hover:bg-[#F1F5F9]">
                <ArchiveIcon size={17} color='#9CA3AF' />
              </button>
            )}
            <button title="Delete"
              onClick={(e) => { e.stopPropagation(); setConfirm({ open: true, type: 'single', id: n.id }); }}
              className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-1.5 hover:border-[#FCA5A5] hover:bg-[#FEE2E2]">
              <DeleteIcon size={17} color='#EF4444' />
            </button>
          </div>
        </div>
        {isPage && index < items.length - 1 && <hr className="border-slate-100" />}
      </React.Fragment>
    );
  });

  return (
    <>
      <div className={`overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${isPage ? '' : 'mb-4'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1F5F9] px-5 py-4">
          <div>
            <p className="text-[0.95rem] font-bold" style={{ color: NAVY }}>
              {s(isPage ? 'page_title' : 'title')}
            </p>
            {!isPage && (
              <p className="mt-0.5 text-[0.72rem] text-[#94A3B8]">{s('subtitle')}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPage && (
              <Badge
                variant="outline"
                className="gap-1 border-transparent text-[0.72rem] font-semibold"
                style={isConnected
                  ? { backgroundColor: '#ECFDF5', color: '#059669' }
                  : { backgroundColor: '#FEF2F2', color: '#DC2626' }}
              >
                {isConnected ? <WifiIcon size={14} /> : <WifiOffIcon size={14} />}
                {isConnected ? s('connected') : s('disconnected')}
              </Badge>
            )}
            {actionButtons}
          </div>
        </div>
        <div className="p-5">
          {!isPage && (
            <div className="mb-5 grid grid-cols-4 gap-3">
              {statItems.map(({ label, value, color }) => (
                <div key={label} className="rounded-xl border border-[#F1F5F9] bg-[#FAFAFA] p-3 text-center">
                  <p className="text-[1.4rem] font-extrabold leading-none" style={{ color }}>{value}</p>
                  <p className="mt-1 text-[0.68rem] font-semibold text-[#94A3B8]">{label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mb-4 border-b border-[#F1F5F9]">
            <Tabs value={String(activeTab)} onValueChange={handleTabChange}>
              <TabsList variant="line" className="h-10 w-auto gap-0 rounded-none border-b-0 bg-transparent">
                <TabsTrigger value="0" className="rounded-none px-4 text-[0.82rem] data-[state=active]:text-teal-600 data-[state=active]:after:bg-teal-500">
                  {t('candidate_settings.notifications.tab_active', { count: notifications.length })}
                </TabsTrigger>
                <TabsTrigger value="1" className="rounded-none px-4 text-[0.82rem] data-[state=active]:text-teal-600 data-[state=active]:after:bg-teal-500">
                  {t('candidate_settings.notifications.tab_archived', { count: archivedCount })}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className={`flex flex-col ${isPage ? 'gap-0' : 'gap-3'}`}>
            {isOnArchivedTab && archivedLoading ? (
              <div className="py-6 text-center">
                <Spinner className="mx-auto size-6" style={{ color: T }} />
              </div>
            ) : visibleItems.length === 0 ? emptyState : renderList(visibleItems)}
          </div>
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center border-t border-[#E5E7EB] pt-4">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
      <DeleteConfirmDialog confirm={confirm} onCancel={() => setConfirm(CLOSED)} onConfirm={handleConfirmDelete} />
    </>
  );
};

export default React.memo(CandidateNotificationsPanel);
