const API = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const getHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('api_token')}`,
  'Content-Type': 'application/json',
});

export const notificationService = {
  fetchNotifications: async () => {
    const res = await fetch(`${API}/notification-system/GetMyNotification`, { headers: getHeaders() });
    if (!res.ok) return { notifications: [], nonArchivedCount: 0, archivedCount: 0, unreadCount: 0 };
    const data = await res.json();
    let raw: any[] = [], nonArchivedCount = 0, archivedCount = 0, unreadCount = 0;
    if (data.nonArchived?.notifications) {
      raw              = data.nonArchived.notifications;
      nonArchivedCount = data.nonArchived.count || raw.length;
      archivedCount    = data.archived?.count || 0;
      unreadCount      = data.unreadCount || 0;
    } else {
      raw = data.notifications || (Array.isArray(data) ? data : []);
    }
    return { raw, nonArchivedCount, archivedCount, unreadCount };
  },

  fetchArchivedNotifications: async () => {
    const res = await fetch(`${API}/notification-system/GetMyNotification`, { headers: getHeaders() });
    if (!res.ok) throw new Error(`Failed: ${res.status}`);
    const data = await res.json();
    let raw: any[] = [], archivedCount = 0, nonArchivedCount = 0;
    if (data.archived?.notifications) {
      raw           = data.archived.notifications;
      archivedCount = data.archived.count || raw.length;
      nonArchivedCount = data.nonArchived?.count || 0;
    } else {
      raw = data.notifications || (Array.isArray(data) ? data : []);
    }
    return { raw, archivedCount, nonArchivedCount };
  },

  markAsRead: async (id: string) => {
    const res = await fetch(`${API}/notification-system/markAsRead/${id}/read`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to mark as read');
    return id;
  },

  markAllAsRead: async () => {
    const res = await fetch(`${API}/notification-system/mark-all-read`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to mark all as read');
    return true;
  },

  createNotification: async (type: string, content: string) => {
    const res = await fetch(`${API}/notification-system/AddNotification/${type}`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error(`Failed to create ${type} notification`);
    return res.json();
  },

  broadcastSystemNotification: async (content: string, recipientIds: string[]) => {
    const token = localStorage.getItem('api_token');
    if (!token) throw new Error('No authentication token found');
    const res = await fetch(`${API}/notification-system/broadcastSystemNotification`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, recipientIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Broadcast failed: ${res.status}`);
    }
    return res.json();
  },

  archiveNotification: async (id: string) => {
    const res = await fetch(`${API}/notification-system/archiveNotification/${id}`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to archive notification');
    return id;
  },

  archiveAll: async () => {
    const res = await fetch(`${API}/notification-system/archive-all`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to archive all notifications');
    return res.json();
  },
};
