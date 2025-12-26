import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
  archived?: boolean;
}

interface NotificationState {
  notifications: Notification[];
  archivedNotifications: Notification[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
  archivedLoading: boolean;
  archivedError: string | null;
  nonArchivedCount: number;
  archivedCount: number;
  unreadCount: number;
}

const initialState: NotificationState = {
  notifications: [],
  archivedNotifications: [],
  isConnected: false,
  loading: false,
  error: null,
  archivedLoading: false,
  archivedError: null,
  nonArchivedCount: 0,
  archivedCount: 0,
  unreadCount: 0,
};

// Helper to format timestamps
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

// Helper to get API headers
const getApiHeaders = () => {
  const token = localStorage.getItem('api_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('api_token');

      console.log('🔍 Fetching notifications from:', `${apiUrl}/notification-system/GetMyNotification`);
      console.log('🔑 Token exists:', !!token);

      const response = await fetch(`${apiUrl}/notification-system/GetMyNotification`, {
        headers: getApiHeaders(),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch failed:', response.status, errorText);
        throw new Error(`Failed to fetch notifications: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Raw API response:', data);

      // New API format: { nonArchived: { count, notifications: [...] }, archived: { count, notifications: [...] }, unreadCount: number }
      // Handle both old and new formats for backwards compatibility
      let notificationsArray = [];
      let nonArchivedCount = 0;
      let archivedCount = 0;
      let unreadCount = 0;

      if (data.nonArchived && Array.isArray(data.nonArchived.notifications)) {
        // New format with nonArchived/archived structure
        notificationsArray = data.nonArchived.notifications;
        nonArchivedCount = data.nonArchived.count || notificationsArray.length;
        archivedCount = data.archived?.count || 0;
        unreadCount = data.unreadCount || 0;
        console.log('📋 Using new API format - nonArchived:', nonArchivedCount, 'archived:', archivedCount, 'unread:', unreadCount);
      } else if (data.notifications) {
        // Old format with notifications array
        notificationsArray = data.notifications;
        console.log('📋 Using old API format - notifications:', notificationsArray.length);
      } else if (Array.isArray(data)) {
        // Fallback: direct array
        notificationsArray = data;
        console.log('📋 Using array format:', notificationsArray.length);
      }

      const mapped = notificationsArray.map((notif: any) => ({
        id: notif._id || notif.id,
        type: notif.type === 'system' ? 'info' : (notif.type || 'info'),
        title: notif.title || 'System Notification',
        message: notif.content || notif.message || '',
        timestamp: formatTimestamp(new Date(notif.createdAt)),
        isRead: notif.read !== undefined ? notif.read : (notif.isRead || false),
        icon: notif.type === 'system' ? 'info' : (notif.type || 'info'),
      }));

      console.log('✅ Mapped notifications:', mapped);
      return {
        notifications: mapped,
        nonArchivedCount,
        archivedCount,
        unreadCount,
      };
    } catch (error: any) {
      console.error('❌ Error fetching notifications:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/notification-system/markAsRead/${id}/read`, {
        method: 'PATCH',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/notification-system/mark-all-read`, {
        method: 'PATCH',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to mark all notifications as read');
      }

      return true;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create notification by type
export const createNotification = createAsyncThunk(
  'notifications/create',
  async ({ type, content }: { type: 'info' | 'success' | 'warning' | 'error' | 'custom'; content: string }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/notification-system/AddNotification/${type}`, {
        method: 'POST',
        headers: getApiHeaders(),
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create ${type} notification`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Broadcast system notification to multiple recipients
export const broadcastSystemNotification = createAsyncThunk(
  'notifications/broadcast',
  async ({ content, recipientIds }: { content: string; recipientIds: string[] }, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('api_token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📢 [BroadcastThunk] Sending broadcast to:', recipientIds.length, 'recipients');

      const response = await fetch(`${apiUrl}/notification-system/broadcastSystemNotification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          recipientIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to broadcast notification: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ [BroadcastThunk] Notification sent successfully:', result);
      return result;
    } catch (error: any) {
      console.error('❌ [BroadcastThunk] Error broadcasting notification:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Archive notification
export const archiveNotification = createAsyncThunk(
  'notifications/archive',
  async (id: string, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/notification-system/archiveNotification/${id}`, {
        method: 'PATCH',
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to archive notification');
      }

      return id;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch archived notifications
export const fetchArchivedNotifications = createAsyncThunk(
  'notifications/fetchArchived',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

      console.log('🗄️ Fetching archived notifications from:', `${apiUrl}/notification-system/GetMyNotification`);

      const response = await fetch(`${apiUrl}/notification-system/GetMyNotification`, {
        headers: getApiHeaders(),
      });

      console.log('📡 Archived response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Fetch archived failed:', response.status, errorText);
        throw new Error(`Failed to fetch archived notifications: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Raw archived API response:', data);

      // New API format: { archived: { count, notifications: [...] }, nonArchived: { count, notifications: [...] } }
      let notificationsArray = [];
      let archivedCount = 0;
      let nonArchivedCount = 0;

      if (data.archived && Array.isArray(data.archived.notifications)) {
        // New format with archived structure
        notificationsArray = data.archived.notifications;
        archivedCount = data.archived.count || notificationsArray.length;
        nonArchivedCount = data.nonArchived?.count || 0;
        console.log('📋 Using new API format - archived:', archivedCount, 'nonArchived:', nonArchivedCount);
      } else if (data.notifications) {
        // Old format fallback
        notificationsArray = data.notifications;
        console.log('📋 Using old API format - notifications:', notificationsArray.length);
      } else if (Array.isArray(data)) {
        // Fallback: direct array
        notificationsArray = data;
        console.log('📋 Using array format:', notificationsArray.length);
      }

      const mapped = notificationsArray.map((notif: any) => ({
        id: notif._id || notif.id,
        type: notif.type === 'system' ? 'info' : (notif.type || 'info'),
        title: notif.title || 'System Notification',
        message: notif.content || notif.message || '',
        timestamp: formatTimestamp(new Date(notif.createdAt)),
        isRead: true, // Archived notifications are always read
        icon: notif.type === 'system' ? 'info' : (notif.type || 'info'),
        archived: true,
      }));

      console.log('✅ Mapped archived notifications:', mapped);
      return {
        notifications: mapped,
        archivedCount,
        nonArchivedCount,
      };
    } catch (error: any) {
      console.error('❌ Error fetching archived notifications:', error);
      return rejectWithValue(error.message);
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    addNotification: (state, action: PayloadAction<any>) => {
      const notification: Notification = {
        id: action.payload._id || action.payload.id || Date.now().toString(),
        type: action.payload.type === 'system' ? 'info' : (action.payload.type || 'info'),
        title: action.payload.title || 'System Notification',
        message: action.payload.content || action.payload.message || '',
        timestamp: formatTimestamp(action.payload.createdAt ? new Date(action.payload.createdAt) : new Date()),
        isRead: action.payload.read || action.payload.isRead || false,
        icon: action.payload.type === 'system' ? 'info' : (action.payload.type || 'info'),
      };
      state.notifications.unshift(notification);
    },
    markAsReadLocal: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.isRead = true;
      }
    },
    markAllAsReadLocal: (state) => {
      state.notifications.forEach(n => n.isRead = true);
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload.notifications;
        state.nonArchivedCount = action.payload.nonArchivedCount;
        state.archivedCount = action.payload.archivedCount;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification) {
          notification.isRead = true;
        }
      })
      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(n => n.isRead = true);
      })
      // Broadcast notification
      .addCase(broadcastSystemNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(broadcastSystemNotification.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(broadcastSystemNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Archive notification
      .addCase(archiveNotification.fulfilled, (state, action) => {
        // Remove the archived notification from the list
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        // Update counts
        if (state.nonArchivedCount > 0) {
          state.nonArchivedCount -= 1;
        }
        state.archivedCount += 1;
      })
      // Fetch archived notifications
      .addCase(fetchArchivedNotifications.pending, (state) => {
        state.archivedLoading = true;
        state.archivedError = null;
      })
      .addCase(fetchArchivedNotifications.fulfilled, (state, action) => {
        state.archivedLoading = false;
        state.archivedNotifications = action.payload.notifications;
        state.archivedCount = action.payload.archivedCount;
        state.nonArchivedCount = action.payload.nonArchivedCount;
      })
      .addCase(fetchArchivedNotifications.rejected, (state, action) => {
        state.archivedLoading = false;
        state.archivedError = action.payload as string;
      });
  },
});

export const {
  setSocketConnected,
  addNotification,
  markAsReadLocal,
  markAllAsReadLocal,
  clearNotifications,
  removeNotification,
} = notificationSlice.actions;

export default notificationSlice.reducer;

// Selectors
export const selectNotifications = (state: { notifications: NotificationState }) => state.notifications.notifications;
export const selectUnreadCount = (state: { notifications: NotificationState }) =>
  state.notifications.unreadCount || state.notifications.notifications.filter(n => !n.isRead).length;
export const selectNonArchivedCount = (state: { notifications: NotificationState }) => state.notifications.nonArchivedCount;
export const selectArchivedCount = (state: { notifications: NotificationState }) => state.notifications.archivedCount;
export const selectIsConnected = (state: { notifications: NotificationState }) => state.notifications.isConnected;
export const selectNotificationsLoading = (state: { notifications: NotificationState }) => state.notifications.loading;
export const selectArchivedNotifications = (state: { notifications: NotificationState }) => state.notifications.archivedNotifications;
export const selectArchivedLoading = (state: { notifications: NotificationState }) => state.notifications.archivedLoading;
export const selectArchivedError = (state: { notifications: NotificationState }) => state.notifications.archivedError;
