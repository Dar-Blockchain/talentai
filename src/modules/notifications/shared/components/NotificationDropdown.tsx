import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  CheckCircle2, AlertTriangle, XCircle, Info,
  Clock, Settings, MailCheck, Archive, Trash2,
  Bell, Circle,
} from 'lucide-react';
import { PopoverContent } from '@/modules/shared/ui/shadcn/popover';
import { cn } from '@/lib/utils';
import { getNotifTypeStyle } from '../api/notificationApi';
import type { NotificationItem } from '../api/notificationApi';

const getTypeIcon = (type: string) => {
  const cls = "size-4";
  switch (type) {
    case 'success': return <CheckCircle2  className={cls} />;
    case 'warning': return <AlertTriangle className={cls} />;
    case 'error':   return <XCircle       className={cls} />;
    default:        return <Info          className={cls} />;
  }
};

interface NotificationDropdownProps {
  onClose:             () => void;
  unreadCount:         number;
  notifications:       NotificationItem[];
  onMarkAsRead:        (id: string) => void;
  onMarkAllAsRead:     () => void;
  onViewAll:           () => void;
  onNotificationClick: (id: string) => void;
  onArchive:           (id: string) => void;
  onArchiveAll:        () => void;
  onDelete:            (id: string) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  onClose,
  notifications, unreadCount,
  onMarkAsRead, onMarkAllAsRead,
  onViewAll, onNotificationClick, onArchive, onArchiveAll, onDelete,
}) => {
  const { t } = useTranslation('dashboard');
  const s = (k: string, params?: Record<string, string | number>) =>
    t(`candidate_settings.notifications.${k}`, params);

  const displayed = notifications.slice(0, 6);
  const hasMore   = notifications.length > 6;

  return (
    <PopoverContent
      align="end"
      sideOffset={8}
      className="w-[400px] max-h-[560px] p-0 rounded-[16px] border border-[#F1F5F9] shadow-[0_8px_40px_rgba(0,0,0,0.13)] overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#F1F5F9] flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[15px] text-[#0D1B2A]">{s('dropdown_title')}</span>
          {unreadCount > 0 && (
            <span className="inline-flex items-center h-5 px-2 rounded-full text-[10.5px] font-bold bg-red-50 text-red-500 border border-red-200">
              {s('dropdown_new_count', { count: unreadCount })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          {unreadCount > 0 && (
            <button
              title={s('tooltip_mark_all_read')}
              onClick={onMarkAllAsRead}
              className="size-7 rounded-[8px] flex items-center justify-center text-gray-400 hover:bg-teal-50 hover:text-teal-600 transition-colors"
            >
              <MailCheck className="size-4" />
            </button>
          )}
          {notifications.length > 0 && (
            <button
              title={s('tooltip_archive_all')}
              onClick={onArchiveAll}
              className="size-7 rounded-[8px] flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <Archive className="size-4" />
            </button>
          )}
          <button
            title={s('tooltip_settings')}
            onClick={() => { onClose(); onViewAll(); }}
            className="size-7 rounded-[8px] flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <Settings className="size-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        {displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <Bell className="size-7 text-slate-300" />
            </div>
            <p className="font-semibold text-sm text-gray-700 mb-1">{s('dropdown_empty_title')}</p>
            <p className="text-[12.5px] text-gray-400 leading-relaxed">{s('dropdown_empty_subtitle')}</p>
          </div>
        ) : (
          displayed.map((n, i) => {
            const style = getNotifTypeStyle(n.type);
            return (
              <React.Fragment key={n.id}>
                <div
                  onClick={() => { onNotificationClick(n.id); onClose(); }}
                  className={cn(
                    "group relative flex gap-3 items-start px-5 py-3 cursor-pointer transition-colors duration-150",
                    "border-l-[3px]",
                    n.isRead
                      ? "bg-transparent border-l-transparent hover:bg-slate-50"
                      : "bg-[#FAFEFF] border-l-current hover:bg-blue-50/30",
                  )}
                  style={n.isRead ? undefined : { borderLeftColor: style.dot }}
                >
                  {/* Type icon */}
                  <div
                    className="size-[34px] min-w-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: style.bg, color: style.color }}
                  >
                    {getTypeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        "text-[13px] text-[#0D1B2A] leading-snug",
                        n.isRead ? "font-medium" : "font-bold",
                      )}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <Circle className="size-[7px] flex-shrink-0" style={{ color: style.dot, fill: style.dot }} />
                      )}
                    </div>
                    <p className="text-[12px] text-gray-500 leading-[1.45] mb-1 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-1">
                      <Clock className="size-[11px] text-gray-400" />
                      <span className="text-[11px] text-gray-400">{n.timestamp}</span>
                    </div>
                  </div>

                  {/* Row actions (visible on hover) */}
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0">
                    <button
                      title={s('tooltip_archive')}
                      onClick={(e) => { e.stopPropagation(); onArchive(n.id); }}
                      className="size-6 rounded-[6px] flex items-center justify-center text-gray-400 hover:bg-slate-100 hover:text-gray-600"
                    >
                      <Archive className="size-3.5" />
                    </button>
                    <button
                      title={s('tooltip_delete')}
                      onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
                      className="size-6 rounded-[6px] flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
                {i < displayed.length - 1 && (
                  <div className="h-px bg-[#F8FAFC] mx-5" />
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Footer */}
      {displayed.length > 0 && (
        <div className="flex-shrink-0 px-3 py-2 border-t border-[#F1F5F9] bg-gray-50/60">
          <button
            onClick={() => { onClose(); onViewAll(); }}
            className="w-full text-[13px] font-semibold text-teal-600 rounded-[10px] py-1.5 hover:bg-teal-50 transition-colors"
          >
            {hasMore ? s('view_all_count', { count: notifications.length }) : s('view_all')}
          </button>
        </div>
      )}
    </PopoverContent>
  );
};

export default NotificationDropdown;
