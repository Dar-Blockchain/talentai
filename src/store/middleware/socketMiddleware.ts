import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import {
  setSocketConnected,
  addNotification,
  markAsReadLocal,
  markAllAsReadLocal,
  removeNotification,
} from '../slices/notificationSlice';

let socket: Socket | null = null;

interface SocketAction {
  type: string;
  payload?: {
    userId?: string;
  };
}

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
};

const mapNotificationData = (data: any) => ({
  id: data._id || data.id || Date.now().toString(),
  type: data.type === 'system' ? 'info' : (data.type || 'info'),
  title: data.title || 'System Notification',
  message: data.content || data.message || '',
  timestamp: formatTimestamp(data.createdAt ? new Date(data.createdAt) : new Date()),
  isRead: data.read || data.isRead || false,
  icon: data.type === 'system' ? 'info' : (data.type || 'info'),
});

export const socketMiddleware: Middleware = (store) => {
  return (next) => (action: unknown) => {
    const socketAction = action as SocketAction;

    // Check if we need to initialize socket connection
    if (socketAction.type === 'socket/connect') {
      const userId = socketAction.payload?.userId;

      if (!userId) {
        return next(action);
      }

      // Close existing socket if any
      if (socket) {
        socket.close();
      }

      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      socket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        store.dispatch(setSocketConnected(true));
        socket!.emit('join', userId);
      });

      socket.on('disconnect', () => {
        store.dispatch(setSocketConnected(false));
      });

      // Listen for new notifications from backend
      socket.on('notification', (data: any) => {
        const notification = mapNotificationData(data);
        store.dispatch(addNotification(notification));
      });

      // Listen for notification read events
      socket.on('notificationRead', (data: any) => {
        const notifId = data.id || data.notificationId || data._id;
        if (notifId) {
          store.dispatch(markAsReadLocal(String(notifId)));
        }
      });

      // Listen for notifications marked read event
      socket.on('notificationsMarkedRead', () => {
        store.dispatch(markAllAsReadLocal());
      });

      // Listen for notification deleted event
      socket.on('notificationDeleted', (data: any) => {
        if (data.notificationId) {
          store.dispatch(removeNotification(data.notificationId));
        }
      });

      // Listen for interview completion notifications
      socket.on('interview_completed', (data: any) => {
        const notification = {
          id: Date.now().toString(),
          type: 'success' as const,
          title: 'Interview Completed',
          message: `Your ${data.interviewType || 'interview'} has been completed successfully. Results are now available.`,
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'success',
        };
        store.dispatch(addNotification(notification));
      });

      // Listen for match notifications
      socket.on('new_match', (data: any) => {
        const notification = {
          id: Date.now().toString(),
          type: 'info' as const,
          title: 'New Match Found',
          message: data.message || 'A new candidate matches your job posting.',
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'info',
        };
        store.dispatch(addNotification(notification));
      });

      // Listen for purchase notifications
      socket.on('purchase_successful', (data: any) => {
        const notification = {
          id: Date.now().toString(),
          type: 'success' as const,
          title: 'Purchase Successful',
          message: data.message || 'Candidate profile purchased successfully.',
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'success',
        };
        store.dispatch(addNotification(notification));
      });
    }

    // Check if we need to disconnect socket
    if (socketAction.type === 'socket/disconnect') {
      if (socket) {
        socket.close();
        socket = null;
        store.dispatch(setSocketConnected(false));
      }
    }

    return next(action);
  };
};

// Action creators for socket connection
export const connectSocket = (userId: string) => ({
  type: 'socket/connect',
  payload: { userId },
});

export const disconnectSocket = () => ({
  type: 'socket/disconnect',
});
