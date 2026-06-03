import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { NOTIF_KEYS } from './useNotifications';
import { mapToNotificationItem } from '../api/notificationApi';
import { playNotificationSound } from '../utils/notificationSounds';
import { emitToast } from '@/utils/toastEmitter';
import type { NotificationsData, NotificationItem, NotificationLevel, NotificationCategory } from '../api/notificationApi';

// ─── Socket event payload types ───────────────────────────────────────────────

interface NotificationPayload {
  _id?: string;
  id?:  string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'custom' | 'system';
  category?: 'system' | 'job' | 'chat' | 'account' | 'profile';
  title?: string;
  content?: string;
  message?: string;
  createdAt?: string | number;
  read?: boolean;
}

interface NotificationIdPayload {
  id?:             string;
  notificationId?: string;
  _id?:            string;
}

interface UnreadCountPayload {
  unreadCount?: number;
}

interface InterviewCompletedPayload {
  interviewType?: string;
  jobTitle?:      string;
}

interface MessagePayload {
  message?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const shouldShowToast = (message: string): boolean => {
  const lower = message.toLowerCase();
  return !(lower.includes('welcome') || lower.includes('registered'));
};

const makeInstantNotification = (
  type: NotificationLevel,
  title: string,
  message: string,
  category: NotificationCategory = 'system'
): NotificationItem => ({
  id:        Date.now().toString(),
  type,
  category,
  title,
  message,
  timestamp: 'Just now',
  isRead:    false,
  icon:      type,
});

const prependNotification = (old: NotificationsData | undefined, notif: NotificationItem): NotificationsData | undefined => {
  if (!old) return old;
  return {
    ...old,
    notifications:    [notif, ...old.notifications],
    nonArchivedCount: old.nonArchivedCount + 1,
    unreadCount:      old.unreadCount + 1,
  };
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  HR_INTERVIEW:          'HR',
  TECHNICAL_INTERVIEW:   'Technical',
  CODING_TEST:           'Coding Test',
  SOFT_SKILLS:           'Soft Skills',
};

export const useNotificationSocket = (userId: string | undefined) => {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
    const socket    = io(socketUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    let toastEnabled = false;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', userId);
      setTimeout(() => { toastEnabled = true; }, 2000);
    });

    socket.on('disconnect', () => setIsConnected(false));

    // New real-time notification pushed from backend
    socket.on('notification', (payload: NotificationPayload) => {
      const notif = mapToNotificationItem(payload);
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => prependNotification(old, notif));
      playNotificationSound(notif.type);
      if (toastEnabled && shouldShowToast(notif.message)) emitToast({ message: notif.message, severity: notif.type });
    });

    socket.on('notificationDeleted', (payload: NotificationIdPayload) => {
      const id = payload.id ?? payload.notificationId ?? '';
      if (!id) return;
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        const target = old.notifications.find(n => n.id === id);
        // Skip if mutation already removed it — avoids double-decrement of nonArchivedCount
        if (!target) return old;
        return {
          ...old,
          notifications:    old.notifications.filter(n => n.id !== id),
          nonArchivedCount: Math.max(0, old.nonArchivedCount - 1),
          unreadCount:      !target.isRead ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });
    });

    socket.on('notificationArchived', (payload: NotificationIdPayload) => {
      const id = payload.id ?? payload._id ?? '';
      if (!id) return;
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        const target = old.notifications.find(n => n.id === id);
        // Skip if mutation already removed it — avoids double-increment of archivedCount
        if (!target) return old;
        return {
          ...old,
          notifications:    old.notifications.filter(n => n.id !== id),
          nonArchivedCount: Math.max(0, old.nonArchivedCount - 1),
          archivedCount:    old.archivedCount + 1,
          unreadCount:      !target.isRead ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });
    });

    // FIX: was completely ignored before
    socket.on('notificationsArchived', () => {
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.all });
    });

    // FIX: was completely ignored before
    socket.on('unreadCountUpdated', (payload: UnreadCountPayload) => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, unreadCount: payload.unreadCount ?? 0 };
      });
    });

    socket.on('notificationRead', (payload: NotificationIdPayload) => {
      const id = payload.id ?? payload.notificationId ?? payload._id ?? '';
      if (!id) return;
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) };
      });
    });

    socket.on('allNotificationsDeleted', () => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, notifications: [], nonArchivedCount: 0, archivedCount: 0, unreadCount: 0 };
      });
      qc.setQueryData(NOTIF_KEYS.archived(), []);
    });

    socket.on('notificationsMarkedRead', () => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, notifications: old.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 };
      });
    });

    socket.on('interview_completed', (payload: InterviewCompletedPayload) => {
      const typeLabel = payload.interviewType
        ? (INTERVIEW_TYPE_LABELS[payload.interviewType] ?? payload.interviewType.replace(/_/g, ' '))
        : null;
      const jobSuffix = payload.jobTitle ? ` for ${payload.jobTitle}` : '';
      const message   = typeLabel
        ? `You completed your ${typeLabel} interview${jobSuffix}. Your results are now available in your dashboard.`
        : `You completed your interview${jobSuffix}. Your results are now available in your dashboard.`;
      const notif = makeInstantNotification('success', 'Interview Completed', message);
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => prependNotification(old, notif));
      playNotificationSound('success');
      if (toastEnabled) emitToast({ message, severity: 'success' });
    });

    socket.on('new_match', (payload: MessagePayload) => {
      const message = payload.message ?? 'A new candidate matches your job posting.';
      const notif   = makeInstantNotification('info', 'New Match Found', message);
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => prependNotification(old, notif));
      playNotificationSound('info');
      if (toastEnabled) emitToast({ message, severity: 'info' });
    });

    socket.on('purchase_successful', (payload: MessagePayload) => {
      const message = payload.message ?? 'Candidate profile purchased successfully.';
      const notif   = makeInstantNotification('success', 'Purchase Successful', message);
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => prependNotification(old, notif));
      playNotificationSound('success');
      if (toastEnabled) emitToast({ message, severity: 'success' });
    });

    return () => {
      socket.close();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [userId, qc]);

  return { isConnected };
};
