import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { io } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  userId?: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children, userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  // Helper function to format timestamps (memoized to prevent re-creation)
  const formatTimestamp = useCallback((date: Date): string => {
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
  }, []);

  // Load existing notifications from database on mount
  useEffect(() => {
    if (!userId) return;

    const loadNotifications = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const token = localStorage.getItem('api_token');

        const response = await fetch(`${apiUrl}/notification-system/GetMyNotification`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const mappedNotifications: Notification[] = data.map((notif: any) => ({
            id: notif._id || notif.id,
            type: notif.type === 'system' ? 'info' : (notif.type || 'info'),
            title: notif.title || 'System Notification',
            message: notif.content || notif.message || '',
            timestamp: formatTimestamp(new Date(notif.createdAt)),
            isRead: notif.read || notif.isRead || false,
            icon: notif.type === 'system' ? 'info' : (notif.type || 'info'),
          }));
          setNotifications(mappedNotifications);
        }
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    };

    loadNotifications();
  }, [userId, formatTimestamp]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!userId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      newSocket.emit('join', userId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for new notifications from backend
    newSocket.on('notification', (data: any) => {
      const newNotification: Notification = {
        id: data._id || data.id || Date.now().toString(),
        type: data.type === 'system' ? 'info' : (data.type || 'info'),
        title: data.title || 'System Notification',
        message: data.content || data.message || '',
        timestamp: formatTimestamp(data.createdAt ? new Date(data.createdAt) : new Date()),
        isRead: data.read || data.isRead || false,
        icon: data.type === 'system' ? 'info' : (data.type || 'info'),
      };
      setNotifications((prev) => [newNotification, ...prev]);
    });

    // Listen for notification read events
    newSocket.on('notificationRead', (data: any) => {
      const notifId = data.id || data.notificationId || data._id;
      if (notifId) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === String(notifId) ? { ...notif, isRead: true } : notif))
        );
      }
    });

    // Listen for notifications marked read event
    newSocket.on('notificationsMarkedRead', () => {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    });

    // Listen for notification deleted event
    newSocket.on('notificationDeleted', (data: any) => {
      if (data.notificationId) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== data.notificationId));
      }
    });

    // Listen for interview completion notifications
    newSocket.on('interview_completed', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        title: 'Interview Completed',
        message: `Your ${data.interviewType || 'interview'} has been completed successfully. Results are now available.`,
        timestamp: formatTimestamp(new Date()),
        isRead: false,
        icon: 'success',
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Listen for match notifications
    newSocket.on('new_match', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'info',
        title: 'New Match Found',
        message: data.message || 'A new candidate matches your job posting.',
        timestamp: formatTimestamp(new Date()),
        isRead: false,
        icon: 'info',
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    // Listen for purchase notifications
    newSocket.on('purchase_successful', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'success',
        title: 'Purchase Successful',
        message: data.message || 'Candidate profile purchased successfully.',
        timestamp: formatTimestamp(new Date()),
        isRead: false,
        icon: 'success',
      };
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      newSocket.close();
    };
  }, [userId, formatTimestamp]);

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: formatTimestamp(new Date()),
      isRead: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif))
    );

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('api_token');

      await fetch(`${apiUrl}/notification-system/markAsRead/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('api_token');

      await fetch(`${apiUrl}/notification-system/mark-all-read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
