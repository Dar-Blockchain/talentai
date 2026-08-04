"use client";
import React, { useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { useRouter } from 'next/router';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { Popover, PopoverTrigger } from '@/modules/shared/ui/shadcn/popover';
import { cn } from '@/lib/utils';

interface HeaderNotificationProps {
  onViewAll?: () => void;
}

const HeaderNotification = ({ onViewAll }: HeaderNotificationProps) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, archive, archiveAll, deleteById } = useNotifications();

  const notificationsPage = '/notifications';

  const handleViewAll = useCallback(() => {
    setOpen(false);
    if (onViewAll) onViewAll();
    else router.push(notificationsPage);
  }, [router, onViewAll, notificationsPage]);

  const handleNotificationClick = useCallback((id: string) => {
    setOpen(false);
    markAsRead(id);
    router.push(notificationsPage);
  }, [router, markAsRead, notificationsPage]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative size-8 rounded-lg flex items-center justify-center cursor-pointer",
            "transition-all duration-150",
            open
              ? "bg-primary/12 text-primary"
              : "text-gray-500 hover:bg-gray-100",
          )}
        >
          <Bell className="size-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute top-[5px] right-[5px] w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </button>
      </PopoverTrigger>

      <NotificationDropdown
        onClose={() => setOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onViewAll={handleViewAll}
        onNotificationClick={handleNotificationClick}
        onArchive={archive}
        onArchiveAll={archiveAll}
        onDelete={deleteById}
      />
    </Popover>
  );
};

export default HeaderNotification;
