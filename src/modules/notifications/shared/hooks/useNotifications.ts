import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi, NotificationItem, NotificationsData } from '../api/notificationApi';

export const NOTIF_KEYS = {
  all:      ['notifications']                    as const,
  active:   () => ['notifications', 'active']   as const,
  archived: () => ['notifications', 'archived'] as const,
};

export const useNotificationsQuery = () =>
  useQuery<NotificationsData>({
    queryKey: NOTIF_KEYS.active(),
    queryFn:  notificationApi.getAll,
    staleTime: 30_000,
  });

export const useArchivedNotificationsQuery = (enabled: boolean) =>
  useQuery<NotificationItem[]>({
    queryKey: NOTIF_KEYS.archived(),
    queryFn:  notificationApi.getArchived,
    enabled,
    staleTime: 60_000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: (_, id) => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        const wasUnread = old.notifications.find(n => n.id === id && !n.isRead);
        return {
          ...old,
          notifications: old.notifications.map(n => n.id === id ? { ...n, isRead: true } : n),
          unreadCount:   wasUnread ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });
    },
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return {
          ...old,
          notifications: old.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount:   0,
        };
      });
    },
  });
};

export const useArchiveNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.archiveById(id),
    onSuccess: (_, id) => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
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
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.archived() });
    },
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.deleteById(id),
    onSuccess: (_, id) => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        const target = old.notifications.find(n => n.id === id);
        if (!target) return old;
        return {
          ...old,
          notifications:    old.notifications.filter(n => n.id !== id),
          nonArchivedCount: Math.max(0, old.nonArchivedCount - 1),
          unreadCount:      !target.isRead ? Math.max(0, old.unreadCount - 1) : old.unreadCount,
        };
      });
      qc.setQueryData<NotificationItem[]>(NOTIF_KEYS.archived(), old =>
        old ? old.filter(n => n.id !== id) : old
      );
    },
  });
};

export const useDeleteAllNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.deleteAll(),
    onSuccess: () => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, notifications: [], nonArchivedCount: 0, unreadCount: 0 };
      });
    },
  });
};

export const useDeleteAllArchivedNotifications = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.deleteAllArchived(),
    onSuccess: () => {
      qc.setQueryData<NotificationItem[]>(NOTIF_KEYS.archived(), []);
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return { ...old, archivedCount: 0 };
      });
    },
  });
};

export const useArchiveAll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.archiveAll(),
    onSuccess: () => {
      qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
        if (!old) return old;
        return {
          ...old,
          archivedCount:    old.archivedCount + old.notifications.length,
          nonArchivedCount: 0,
          unreadCount:      0,
          notifications:    [],
        };
      });
      qc.invalidateQueries({ queryKey: NOTIF_KEYS.archived() });
    },
  });
};
