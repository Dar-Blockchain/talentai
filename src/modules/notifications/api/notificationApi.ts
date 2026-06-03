import axiosInstance from '@/utils/axiosInstance';
import i18n from '@/i18n/config';

const NS = 'modules/notifications/notifications';
const nt = (key: string, params?: Record<string, string | number>) =>
  i18n.t(key, { ns: NS, ...params });

// ─── Public types ────────────────────────────────────────────────────────────

export type NotificationLevel = 'success' | 'info' | 'warning' | 'error';
export type NotificationCreateType = 'success' | 'info' | 'warning' | 'error' | 'custom';
export type NotificationCategory = 'system' | 'job' | 'chat' | 'account' | 'profile';

export interface NotificationItem {
  id:        string;
  type:      NotificationLevel;
  category:  NotificationCategory;
  title:     string;
  message:   string;
  timestamp: string;
  isRead:    boolean;
  icon:      NotificationLevel;
  archived?: boolean;
}

export interface NotificationsData {
  notifications:    NotificationItem[];
  nonArchivedCount: number;
  archivedCount:    number;
  unreadCount:      number;
}

export interface BroadcastResult {
  count:    number;
  message:  string;
  notifications: NotificationItem[];
}

// ─── Raw backend shapes (before mapping) ────────────────────────────────────

interface RawNotification {
  _id?:       string;
  id?:        string;
  type?:      NotificationLevel | 'system' | 'custom';
  category?:  NotificationCategory;
  title?:     string;
  content?:   string;
  message?:   string;
  createdAt?: string | number;
  read?:      boolean;
  isRead?:    boolean;
  archived?:  boolean;
}

interface RawNotificationsResponse {
  nonArchived?: { notifications: RawNotification[]; count?: number };
  archived?:    { notifications: RawNotification[]; count?: number };
  notifications?: RawNotification[];
  unreadCount?: number;
}

// ─── Utility helpers ─────────────────────────────────────────────────────────

export const deriveTitleFromContent = (type: string, content: string): string => {
  if (content) {
    const lower = content.toLowerCase();
    if (lower.includes('interview'))                                         return 'Interview Update';
    if (lower.includes('application'))                                       return 'Application Update';
    if (lower.includes('unlocked') || lower.includes('interested in your')) return 'Profile Unlocked';
    if (lower.includes('match') || lower.includes('matches your'))          return 'New Job Match';
    if (lower.includes('new offer') || lower.includes('job') || lower.includes('position') || lower.includes('offer')) return 'New Job Offer';
    if (lower.includes('score') || lower.includes('test') || lower.includes('passed') || lower.includes('level up')) return 'Test Result';
    if (lower.includes('profile'))     return 'Profile Update';
    if (lower.includes('plan') || lower.includes('limit') || lower.includes('subscription')) return 'Plan Update';
    if (lower.includes('company'))     return 'Company Update';
    if (lower.includes('welcome') || lower.includes('registered')) return 'Welcome!';
    if (lower.includes('password') || lower.includes('login') || lower.includes('sign')) return 'Account Security';
  }
  switch (type) {
    case 'success': return 'Success';
    case 'warning': return 'Warning';
    case 'error':   return 'Error';
    default:        return 'Notification';
  }
};

export const formatRelativeTime = (date: Date): string => {
  const diffMs  = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours   = Math.floor(diffMs / 3_600_000);
  const days    = Math.floor(diffMs / 86_400_000);
  const weeks   = Math.floor(days / 7);
  if (minutes < 1)  return nt('time_just_now');
  if (minutes < 60) return nt('time_minutes_ago', { count: minutes });
  if (hours   < 24) return nt('time_hours_ago',   { count: hours   });
  if (days    < 7)  return nt('time_days_ago',     { count: days    });
  return nt('time_weeks_ago', { count: weeks });
};

export const mapToNotificationItem = (raw: RawNotification, archived = false): NotificationItem => {
  const type: NotificationLevel = raw.type === 'system' || raw.type === 'custom'
    ? 'info'
    : (raw.type ?? 'info');
  return {
    id:        raw._id ?? raw.id ?? '',
    type,
    category:  raw.category ?? 'system',
    title:     raw.title ?? deriveTitleFromContent(type, raw.content ?? raw.message ?? ''),
    message:   raw.content ?? raw.message ?? '',
    timestamp: formatRelativeTime(new Date(raw.createdAt ?? Date.now())),
    isRead:    archived ? true : (raw.read ?? raw.isRead ?? false),
    icon:      type,
    ...(archived ? { archived: true } : {}),
  };
};

// ─── API calls ───────────────────────────────────────────────────────────────

export const notificationApi = {
  getAll: async (): Promise<NotificationsData> => {
    try {
      const { data } = await axiosInstance.get<RawNotificationsResponse>('/notification-system/GetMyNotification');
      let items: RawNotification[] = [], nonArchivedCount = 0, archivedCount = 0, unreadCount = 0;
      if (data.nonArchived?.notifications) {
        items            = data.nonArchived.notifications;
        nonArchivedCount = data.nonArchived.count ?? items.length;
        archivedCount    = data.archived?.count ?? 0;
        unreadCount      = data.unreadCount ?? 0;
      } else {
        items = data.notifications ?? (Array.isArray(data) ? data : []);
      }
      return { notifications: items.map(n => mapToNotificationItem(n)), nonArchivedCount, archivedCount, unreadCount };
    } catch {
      return { notifications: [], nonArchivedCount: 0, archivedCount: 0, unreadCount: 0 };
    }
  },

  getArchived: async (): Promise<NotificationItem[]> => {
    const { data } = await axiosInstance.get<RawNotificationsResponse>('/notification-system/GetMyNotification');
    const items: RawNotification[] = data.archived?.notifications
      ?? data.notifications
      ?? (Array.isArray(data) ? data : []);
    return items.map(n => mapToNotificationItem(n, true));
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/notification-system/markAsRead/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosInstance.patch('/notification-system/mark-all-read');
  },

  archiveById: async (id: string): Promise<void> => {
    await axiosInstance.patch(`/notification-system/archiveNotification/${id}`);
  },

  archiveAll: async (): Promise<void> => {
    await axiosInstance.patch('/notification-system/archive-all');
  },

  createNotification: async (type: NotificationCreateType, content: string): Promise<void> => {
    await axiosInstance.post(`/notification-system/AddNotification/${type}`, { content });
  },

  deleteById: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/notification-system/deleteNotification/${id}`);
  },

  deleteAll: async (): Promise<void> => {
    await axiosInstance.delete('/notification-system/delete-all');
  },

  deleteAllArchived: async (): Promise<void> => {
    await axiosInstance.delete('/notification-system/delete-all-archived');
  },

  broadcastNotification: async (content: string, recipientIds: string[]): Promise<BroadcastResult> => {
    const { data } = await axiosInstance.post<BroadcastResult>(
      '/notification-system/broadcastSystemNotification',
      { content, recipientIds }
    );
    return data;
  },
};
