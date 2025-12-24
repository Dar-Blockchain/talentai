import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';

interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

interface NotificationState {
  notifications: Notification[];
  isConnected: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationState = {
  notifications: [],
  isConnected: false,
  loading: false,
  error: null,
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
      const response = await fetch(`${apiUrl}/notification-system/GetMyNotification`, {
        headers: getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      return data.map((notif: any) => ({
        id: notif._id || notif.id,
        type: notif.type === 'system' ? 'info' : (notif.type || 'info'),
        title: notif.title || 'System Notification',
        message: notif.content || notif.message || '',
        timestamp: formatTimestamp(new Date(notif.createdAt)),
        isRead: notif.read || notif.isRead || false,
        icon: notif.type === 'system' ? 'info' : (notif.type || 'info'),
      }));
    } catch (error: any) {
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
        state.notifications = action.payload;
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
  state.notifications.notifications.filter(n => !n.isRead).length;
export const selectIsConnected = (state: { notifications: NotificationState }) => state.notifications.isConnected;
export const selectNotificationsLoading = (state: { notifications: NotificationState }) => state.notifications.loading;
