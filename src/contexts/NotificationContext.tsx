import React, { useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead,
  clearNotifications as clearNotificationsAction,
  archiveNotification, archiveAllNotifications,
  selectNotifications, selectUnreadCount, selectIsConnected,
} from '@/store/slices/notificationSlice';
import { connectSocket, disconnectSocket } from '@/store/middleware/socketMiddleware';

export const NotificationProvider: React.FC<{ children: ReactNode; userId?: string }> = ({ children, userId }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!userId) return;
    dispatch(fetchNotifications());
    dispatch(connectSocket(userId) as any);
    return () => { dispatch(disconnectSocket() as any); };
  }, [userId, dispatch]);

  return <>{children}</>;
};

export const useNotifications = () => {
  const dispatch      = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);
  const unreadCount   = useSelector(selectUnreadCount);
  const isConnected   = useSelector(selectIsConnected);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead:         (id: string) => dispatch(markNotificationAsRead(id)),
    markAllAsRead:      ()           => dispatch(markAllNotificationsAsRead()),
    clearNotifications: ()           => dispatch(clearNotificationsAction()),
    archive:            (id: string) => dispatch(archiveNotification(id)),
    archiveAll:         ()           => dispatch(archiveAllNotifications()),
  };
};
