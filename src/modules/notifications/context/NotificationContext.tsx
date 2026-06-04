import React, { createContext, useContext, ReactNode } from 'react';
import {
  useNotificationsQuery, useMarkAsRead, useMarkAllAsRead,
  useArchiveNotification, useArchiveAll,
  useDeleteNotification, useDeleteAllNotifications, useDeleteAllArchivedNotifications,
} from '../hooks/useNotifications';
import { useNotificationSocket } from '../hooks/useNotificationSocket';
import type { NotificationItem } from '../api/notificationApi';

interface NotificationContextValue {
  isConnected: boolean;
}

const NotificationStateContext = createContext<NotificationContextValue>({ isConnected: false });

export const NotificationProvider: React.FC<{ children: ReactNode; userId?: string }> = ({ children, userId }) => {
  const { isConnected } = useNotificationSocket(userId);
  return (
    <NotificationStateContext.Provider value={{ isConnected }}>
      {children}
    </NotificationStateContext.Provider>
  );
};

export const useNotifications = () => {
  const { isConnected } = useContext(NotificationStateContext);
  const { data }        = useNotificationsQuery();
  const markAsRead      = useMarkAsRead();
  const markAllAsRead   = useMarkAllAsRead();
  const archiveOne      = useArchiveNotification();
  const archiveAll      = useArchiveAll();
  const deleteOne       = useDeleteNotification();
  const deleteAll               = useDeleteAllNotifications();
  const deleteAllArchived       = useDeleteAllArchivedNotifications();

  return {
    notifications:    (data?.notifications ?? []) as NotificationItem[],
    unreadCount:      data?.unreadCount     ?? 0,
    nonArchivedCount: data?.nonArchivedCount ?? 0,
    archivedCount:    data?.archivedCount   ?? 0,
    isConnected,
    markAsRead:         (id: string) => markAsRead.mutate(id),
    markAllAsRead:      ()           => markAllAsRead.mutate(),
    archive:            (id: string) => archiveOne.mutate(id),
    archiveAll:         ()           => archiveAll.mutate(),
    deleteById:         (id: string) => deleteOne.mutate(id),
    deleteAll:          ()           => deleteAll.mutate(),
    deleteAllArchived:  ()           => deleteAllArchived.mutate(),
  };
};
