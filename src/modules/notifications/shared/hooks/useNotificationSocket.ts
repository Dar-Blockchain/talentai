import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import { NOTIF_KEYS } from './useNotifications';
import { mapToNotificationItem } from '../api/notificationApi';
import { playNotificationSound } from '../utils/notificationSounds';
import { emitToast } from '@/utils/toastEmitter';
import type { NotificationsData, NotificationItem, NotificationLevel, NotificationCategory, RawNotification } from '../api/notificationApi';

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

const prependNotification = (old: NotificationsData, notif: NotificationItem): NotificationsData => {
  // Guard against double-insertion: a socket 'notification' event queued while
  // the initial GET /GetMyNotification is in flight gets replayed once that
  // fetch resolves (see applyOrQueue/pendingRef below). If the fetched data
  // already includes this notification (it was persisted before the fetch
  // returned), replaying the prepend on top of it would duplicate it in the UI
  // even though only one row exists in the database.
  if (old.notifications.some(n => n.id === notif.id)) return old;
  return {
    ...old,
    notifications:    [notif, ...old.notifications],
    nonArchivedCount: old.nonArchivedCount + 1,
    unreadCount:      old.unreadCount + 1,
  };
};

const INTERVIEW_TYPE_LABELS: Record<string, string> = {
  HR_INTERVIEW:          'HR',
  TECHNICAL_INTERVIEW:   'Technical',
  CODING_TEST:           'Coding Test',
  SOFT_SKILLS:           'Soft Skills',
};

// Schedule fn to run during browser idle time. Falls back to setTimeout(0)
// in environments where requestIdleCallback isn't available (e.g. Safari <16).
function scheduleIdle(fn: () => void): () => void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    const id = window.requestIdleCallback(fn);
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 0);
  return () => clearTimeout(id);
}

export const useNotificationSocket = (userId: string | undefined) => {
  const qc = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Events can arrive before useNotificationsQuery's initial fetch resolves
  // (the socket connects independently of any component mounting the query).
  // Queue updaters instead of dropping them, then replay in order once the
  // cache actually has data.
  const pendingRef = useRef<Array<(data: NotificationsData) => NotificationsData>>([]);

  const applyOrQueue = (updater: (data: NotificationsData) => NotificationsData) => {
    const current = qc.getQueryData<NotificationsData>(NOTIF_KEYS.active());
    if (current) {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), updater(current));
    } else {
      pendingRef.current.push(updater);
    }
  };

  useEffect(() => {
    const unsubscribe = qc.getQueryCache().subscribe(event => {
      if (event.type !== 'updated' || !pendingRef.current.length) return;
      const key = event.query.queryKey;
      const isActiveKey = key.length === NOTIF_KEYS.active().length && key.every((k, i) => k === NOTIF_KEYS.active()[i]);
      if (!isActiveKey) return;
      const data = event.query.state.data as NotificationsData | undefined;
      if (!data) return;
      const queued = pendingRef.current;
      pendingRef.current = [];
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), queued.reduce((acc, fn) => fn(acc), data));
    });
    return unsubscribe;
  }, [qc]);

  useEffect(() => {
    if (!userId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    // Defer socket connection until the browser is idle. When the user logs in,
    // this effect fires at the same moment router.replace() starts the page
    // transition. Yielding to idle time lets the navigation network request go
    // first; the socket handshake runs as a low-priority background task.
    const cancelIdle = scheduleIdle(() => {
      const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      let toastEnabled = false;

      socket.on('connect', () => {
        setIsConnected(true);
        socket.emit('join', userId);
        setTimeout(() => { toastEnabled = true; }, 2000);
      });

      socket.on('disconnect', () => setIsConnected(false));

      socket.on('notification', (payload: RawNotification) => {
        const notif = mapToNotificationItem(payload);
        applyOrQueue(old => prependNotification(old, notif));
        playNotificationSound(notif.type);
        if (toastEnabled && shouldShowToast(notif.message)) emitToast({ message: notif.message, severity: notif.type });
      });

      socket.on('notificationDeleted', (payload: NotificationIdPayload) => {
        const id = payload.id ?? payload.notificationId ?? '';
        if (!id) return;
        applyOrQueue(old => {
          const target = old.notifications.find(n => n.id === id);
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
        applyOrQueue(old => {
          const target = old.notifications.find(n => n.id === id);
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

      socket.on('notificationsArchived', () => {
        qc.invalidateQueries({ queryKey: NOTIF_KEYS.all });
      });

      socket.on('unreadCountUpdated', (payload: UnreadCountPayload) => {
        applyOrQueue(old => ({ ...old, unreadCount: payload.unreadCount ?? 0 }));
      });

      socket.on('notificationRead', (payload: NotificationIdPayload) => {
        const id = payload.id ?? payload.notificationId ?? payload._id ?? '';
        if (!id) return;
        applyOrQueue(old => ({ ...old, notifications: old.notifications.map(n => n.id === id ? { ...n, isRead: true } : n) }));
      });

      socket.on('allNotificationsDeleted', () => {
        applyOrQueue(old => ({ ...old, notifications: [], nonArchivedCount: 0, archivedCount: 0, unreadCount: 0 }));
        qc.setQueryData(NOTIF_KEYS.archived(), []);
      });

      socket.on('allArchivedNotificationsDeleted', () => {
        applyOrQueue(old => ({ ...old, archivedCount: 0 }));
        qc.setQueryData(NOTIF_KEYS.archived(), []);
      });

      socket.on('notificationsMarkedRead', () => {
        applyOrQueue(old => ({ ...old, notifications: old.notifications.map(n => ({ ...n, isRead: true })), unreadCount: 0 }));
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
        applyOrQueue(old => prependNotification(old, notif));
        playNotificationSound('success');
        if (toastEnabled) emitToast({ message, severity: 'success' });
      });

      socket.on('new_match', (payload: MessagePayload) => {
        const message = payload.message ?? 'A new candidate matches your job posting.';
        const notif   = makeInstantNotification('info', 'New Match Found', message);
        applyOrQueue(old => prependNotification(old, notif));
        playNotificationSound('info');
        if (toastEnabled) emitToast({ message, severity: 'info' });
      });

      socket.on('purchase_successful', (payload: MessagePayload) => {
        const message = payload.message ?? 'Candidate profile purchased successfully.';
        const notif   = makeInstantNotification('success', 'Purchase Successful', message);
        applyOrQueue(old => prependNotification(old, notif));
        playNotificationSound('success');
        if (toastEnabled) emitToast({ message, severity: 'success' });
      });
    });

    return () => {
      cancelIdle();
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [userId, qc]);

  return { isConnected };
};
