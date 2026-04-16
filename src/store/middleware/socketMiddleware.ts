import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import {
  setSocketConnected,
  addNotification,
  markAsReadLocal,
  markAllAsReadLocal,
  removeNotification,
} from '../slices/notificationSlice';
import { playNotificationSound, NotificationType } from '@/utils/notificationSounds';
import { emitToast } from '@/utils/toastEmitter';

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

const deriveTitle = (type: string, content: string): string => {
  if (content) {
    const c = content.toLowerCase();
    if (c.includes('interview'))                                      return 'Interview Update';
    if (c.includes('application'))                                    return 'Application Update';
    if (c.includes('unlocked') || c.includes('interested in your'))  return 'Profile Unlocked';
    if (c.includes('match') || c.includes('matches your'))           return 'New Job Match';
    if (c.includes('new offer') || c.includes('job') || c.includes('position') || c.includes('offer')) return 'New Job Offer';
    if (c.includes('score') || c.includes('test') || c.includes('passed') || c.includes('level up')) return 'Test Result';
    if (c.includes('profile'))                                        return 'Profile Update';
    if (c.includes('plan') || c.includes('limit') || c.includes('subscription')) return 'Plan Update';
    if (c.includes('company'))                                        return 'Company Update';
    if (c.includes('welcome') || c.includes('registered'))           return 'Welcome!';
    if (c.includes('password') || c.includes('login') || c.includes('sign')) return 'Account Security';
  }
  switch (type) {
    case 'success': return 'Success';
    case 'warning': return 'Warning';
    case 'error':   return 'Error';
    default:        return 'Notification';
  }
};

const mapNotificationData = (data: any) => {
  const type = data.type === 'system' ? 'info' : (data.type || 'info');
  const message = data.content || data.message || '';
  return {
    id: data._id || data.id || Date.now().toString(),
    type,
    title: data.title || deriveTitle(type, message),
    message,
    timestamp: formatTimestamp(data.createdAt ? new Date(data.createdAt) : new Date()),
    isRead: data.read !== undefined ? data.read : (data.isRead || false),
    icon: type,
  };
};

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

      let toastEnabled = false;
      // Delay toasts by 2s after connect so login-time notifications don't flash before the page loads
      socket.on('connect', () => {
        store.dispatch(setSocketConnected(true));
        socket!.emit('join', userId);
        setTimeout(() => { toastEnabled = true; }, 2000);
      });

      socket.on('disconnect', () => {
        store.dispatch(setSocketConnected(false));
      });

      // Helper: suppress welcome toasts after first login
      const shouldShowToast = (message: string): boolean => {
        const isWelcome = message.toLowerCase().includes('welcome') || message.toLowerCase().includes('registered');
        if (isWelcome) {
          const trafficCounter = (store.getState() as any).user?.connectedUser?.user?.trafficCounter ?? 0;
          return trafficCounter <= 1;
        }
        return true;
      };

      // Listen for new notifications from backend
      socket.on('notification', (data: any) => {
        const notification = mapNotificationData(data);
        store.dispatch(addNotification(notification));
        playNotificationSound(notification.type as NotificationType);
        if (toastEnabled && shouldShowToast(notification.message)) emitToast({ message: notification.message, severity: notification.type as any });
      });

      // Listen for broadcast system notifications
      socket.on('broadcast_notification', (data: any) => {
        const notification = mapNotificationData(data);
        store.dispatch(addNotification(notification));
        playNotificationSound(notification.type as NotificationType);
        if (toastEnabled && shouldShowToast(notification.message)) emitToast({ message: notification.message, severity: notification.type as any });
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
        const message = `Your ${data.interviewType || 'interview'} has been completed successfully. Results are now available.`;
        const notification = {
          id: Date.now().toString(),
          type: 'success' as const,
          title: 'Interview Completed',
          message,
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'success',
        };
        store.dispatch(addNotification(notification));
        playNotificationSound('success');
        if (toastEnabled) emitToast({ message, severity: 'success' });
      });

      // Listen for match notifications
      socket.on('new_match', (data: any) => {
        const message = data.message || 'A new candidate matches your job posting.';
        const notification = {
          id: Date.now().toString(),
          type: 'info' as const,
          title: 'New Match Found',
          message,
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'info',
        };
        store.dispatch(addNotification(notification));
        playNotificationSound('info');
        if (toastEnabled) emitToast({ message, severity: 'info' });
      });

      // Listen for purchase notifications
      socket.on('purchase_successful', (data: any) => {
        const message = data.message || 'Candidate profile purchased successfully.';
        const notification = {
          id: Date.now().toString(),
          type: 'success' as const,
          title: 'Purchase Successful',
          message,
          timestamp: formatTimestamp(new Date()),
          isRead: false,
          icon: 'success',
        };
        store.dispatch(addNotification(notification));
        playNotificationSound('success');
        if (toastEnabled) emitToast({ message, severity: 'success' });
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
