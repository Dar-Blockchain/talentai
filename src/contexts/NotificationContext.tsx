import React, { useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/store/store';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearNotifications as clearNotificationsAction,
  selectNotifications,
  selectUnreadCount,
  selectIsConnected,
} from '@/store/slices/notificationSlice';
import { connectSocket, disconnectSocket } from '@/store/middleware/socketMiddleware';

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const dispatch = useDispatch<AppDispatch>();

  // Load existing notifications from database and connect socket on mount
  useEffect(() => {
    if (!userId) return;

    // Fetch notifications from database
    dispatch(fetchNotifications());

    // Connect socket for real-time updates
    dispatch(connectSocket(userId) as any);

    return () => {
      // Disconnect socket on unmount
      dispatch(disconnectSocket() as any);
    };
  }, [userId, dispatch]);

  return <>{children}</>;
};

// Custom hook to use notifications with Redux
export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isConnected = useSelector(selectIsConnected);

  const markAsRead = (id: string) => {
    dispatch(markNotificationAsRead(id));
  };

  const markAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const clearNotifications = () => {
    dispatch(clearNotificationsAction());
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    isConnected,
  };
};
