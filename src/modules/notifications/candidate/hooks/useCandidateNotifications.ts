import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../shared/context/NotificationContext';
import {
  useArchivedNotificationsQuery,
  NOTIF_KEYS,
} from '../../shared/hooks/useNotifications';
import type { NotificationItem, NotificationsData } from '../../shared/api/notificationApi';

export type { NotificationItem, NotificationsData };
export { NOTIF_KEYS };

export const useCandidateNotifications = () => useNotifications();

export const useCandidateArchivedNotifications = (enabled: boolean) =>
  useArchivedNotificationsQuery(enabled);

export const useSyncCandidateArchivedCount = (
  enabled: boolean,
  loading: boolean,
  archivedLength: number,
) => {
  const qc = useQueryClient();
  useEffect(() => {
    if (!enabled || loading) return;
    qc.setQueryData<NotificationsData>(NOTIF_KEYS.active(), old => {
      if (!old || old.archivedCount === archivedLength) return old;
      return { ...old, archivedCount: archivedLength };
    });
  }, [enabled, loading, archivedLength, qc]);
};
