import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

interface Notification {
  id:        string;
  type:      'success' | 'info' | 'warning' | 'error';
  title:     string;
  message:   string;
  timestamp: string;
  isRead:    boolean;
  icon:      string;
  archived?: boolean;
}

interface NotificationState {
  notifications:         Notification[];
  archivedNotifications: Notification[];
  isConnected:     boolean;
  loading:         boolean;
  error:           string | null;
  archivedLoading: boolean;
  archivedError:   string | null;
  nonArchivedCount: number;
  archivedCount:    number;
  unreadCount:      number;
}

const initialState: NotificationState = {
  notifications: [], archivedNotifications: [],
  isConnected: false, loading: false, error: null,
  archivedLoading: false, archivedError: null,
  nonArchivedCount: 0, archivedCount: 0, unreadCount: 0,
};

const deriveTitle = (type: string, content: string): string => {
  const c = content.toLowerCase();
  if (c.includes('interview'))                                     return 'Interview Update';
  if (c.includes('application'))                                   return 'Application Update';
  if (c.includes('unlocked') || c.includes('interested in your')) return 'Profile Unlocked';
  if (c.includes('match') || c.includes('matches your'))          return 'New Job Match';
  if (c.includes('job') || c.includes('position') || c.includes('offer')) return 'New Job Offer';
  if (c.includes('score') || c.includes('test') || c.includes('passed') || c.includes('level up')) return 'Test Result';
  if (c.includes('profile'))  return 'Profile Update';
  if (c.includes('plan') || c.includes('limit') || c.includes('subscription')) return 'Plan Update';
  if (c.includes('company'))  return 'Company Update';
  if (c.includes('welcome') || c.includes('registered')) return 'Welcome!';
  if (c.includes('password') || c.includes('login') || c.includes('sign')) return 'Account Security';
  return type === 'success' ? 'Success' : type === 'warning' ? 'Warning' : type === 'error' ? 'Error' : 'Notification';
};

const formatTimestamp = (date: Date): string => {
  const diff    = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(diff / 3600000);
  const days    = Math.floor(diff / 86400000);
  const weeks   = Math.floor(days / 7);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours   < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days    < 7)  return `${days} day${days > 1 ? 's' : ''} ago`;
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
};

const getHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('api_token')}`,
  'Content-Type':  'application/json',
});

const mapNotif = (notif: any, archived = false): Notification => {
  const type = notif.type === 'system' ? 'info' : (notif.type || 'info');
  return {
    id:        notif._id || notif.id,
    type,
    title:     notif.title || deriveTitle(type, notif.content || notif.message || ''),
    message:   notif.content || notif.message || '',
    timestamp: formatTimestamp(new Date(notif.createdAt)),
    isRead:    archived ? true : (notif.read ?? notif.isRead ?? false),
    icon:      type,
    ...(archived ? { archived: true } : {}),
  };
};

const EMPTY_RESULT = { notifications: [], nonArchivedCount: 0, archivedCount: 0, unreadCount: 0 };

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/notification-system/GetMyNotification`, { headers: getHeaders() });
    if (!res.ok) return EMPTY_RESULT;
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

    return { notifications: raw.map(n => mapNotif(n)), nonArchivedCount, archivedCount, unreadCount };
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const fetchArchivedNotifications = createAsyncThunk('notifications/fetchArchived', async (_, { rejectWithValue }) => {
  try {
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

    return { notifications: raw.map(n => mapNotif(n, true)), archivedCount, nonArchivedCount };
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const markNotificationAsRead = createAsyncThunk('notifications/markAsRead', async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/notification-system/markAsRead/${id}/read`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to mark as read');
    return id;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const markAllNotificationsAsRead = createAsyncThunk('notifications/markAllAsRead', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/notification-system/mark-all-read`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to mark all as read');
    return true;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const createNotification = createAsyncThunk(
  'notifications/create',
  async ({ type, content }: { type: 'info' | 'success' | 'warning' | 'error' | 'custom'; content: string }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API}/notification-system/AddNotification/${type}`, {
        method: 'POST', headers: getHeaders(), body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Failed to create ${type} notification`);
      return await res.json();
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const broadcastSystemNotification = createAsyncThunk(
  'notifications/broadcast',
  async ({ content, recipientIds }: { content: string; recipientIds: string[] }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) throw new Error('No authentication token found');
      const res = await fetch(`${API}/notification-system/broadcastSystemNotification`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, recipientIds }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Broadcast failed: ${res.status}`);
      }
      return await res.json();
    } catch (e: any) { return rejectWithValue(e.message); }
  }
);

export const archiveNotification = createAsyncThunk('notifications/archive', async (id: string, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/notification-system/archiveNotification/${id}`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to archive notification');
    return id;
  } catch (e: any) { return rejectWithValue(e.message); }
});

export const archiveAllNotifications = createAsyncThunk('notifications/archiveAll', async (_, { rejectWithValue }) => {
  try {
    const res = await fetch(`${API}/notification-system/archive-all`, { method: 'PATCH', headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to archive all notifications');
    return await res.json();
  } catch (e: any) { return rejectWithValue(e.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => { state.isConnected = action.payload; },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.unshift(mapNotif({ ...action.payload, createdAt: action.payload.createdAt || new Date().toISOString() }));
    },
    markAsReadLocal:    (state, { payload }: PayloadAction<string>) => { const n = state.notifications.find(n => n.id === payload); if (n) n.isRead = true; },
    markAllAsReadLocal: (state) => { state.notifications.forEach(n => n.isRead = true); },
    clearNotifications: (state) => { state.notifications = []; },
    removeNotification: (state, { payload }: PayloadAction<string>) => { state.notifications = state.notifications.filter(n => n.id !== payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.notifications      = payload.notifications;
        state.nonArchivedCount   = payload.nonArchivedCount;
        state.archivedCount      = payload.archivedCount;
        state.unreadCount        = payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected,  (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(markNotificationAsRead.fulfilled, (state, { payload }) => {
        const n = state.notifications.find(n => n.id === payload);
        if (n && !n.isRead) { n.isRead = true; if (state.unreadCount > 0) state.unreadCount -= 1; }
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      })

      .addCase(broadcastSystemNotification.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(broadcastSystemNotification.fulfilled, (state) => { state.loading = false; })
      .addCase(broadcastSystemNotification.rejected,  (state, { payload }) => { state.loading = false; state.error = payload as string; })

      .addCase(archiveNotification.fulfilled, (state, { payload }) => {
        const n = state.notifications.find(n => n.id === payload);
        const wasUnread = n && !n.isRead;
        state.notifications = state.notifications.filter(n => n.id !== payload);
        if (state.nonArchivedCount > 0) state.nonArchivedCount -= 1;
        state.archivedCount += 1;
        if (wasUnread && state.unreadCount > 0) state.unreadCount -= 1;
      })
      .addCase(archiveAllNotifications.fulfilled, (state) => {
        const unread = state.notifications.filter(n => !n.isRead).length;
        state.archivedCount    += state.notifications.length;
        state.nonArchivedCount  = 0;
        state.unreadCount       = Math.max(0, state.unreadCount - unread);
        state.notifications     = [];
      })

      .addCase(fetchArchivedNotifications.pending,   (state) => { state.archivedLoading = true; state.archivedError = null; })
      .addCase(fetchArchivedNotifications.fulfilled, (state, { payload }) => {
        state.archivedLoading      = false;
        state.archivedNotifications = payload.notifications;
        state.archivedCount        = payload.archivedCount;
        state.nonArchivedCount     = payload.nonArchivedCount;
      })
      .addCase(fetchArchivedNotifications.rejected,  (state, { payload }) => { state.archivedLoading = false; state.archivedError = payload as string; });
  },
});

export const {
  setSocketConnected, addNotification, markAsReadLocal,
  markAllAsReadLocal, clearNotifications, removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

type NS = { notifications: NotificationState };
export const selectNotifications       = (s: NS) => s.notifications.notifications;
export const selectUnreadCount         = (s: NS) => s.notifications.notifications.filter(n => !n.isRead).length;
export const selectNonArchivedCount    = (s: NS) => s.notifications.nonArchivedCount;
export const selectArchivedCount       = (s: NS) => s.notifications.archivedCount;
export const selectIsConnected         = (s: NS) => s.notifications.isConnected;
export const selectNotificationsLoading = (s: NS) => s.notifications.loading;
export const selectArchivedNotifications = (s: NS) => s.notifications.archivedNotifications;
export const selectArchivedLoading     = (s: NS) => s.notifications.archivedLoading;
export const selectArchivedError       = (s: NS) => s.notifications.archivedError;
