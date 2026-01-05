import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { isCurrentTokenExpired, handleTokenExpiration, isTokenExpired, getToken, validateAndSyncToken, isCookieExpired } from '@/utils/tokenUtils';

interface AuthState {
  profile: any | null;
  user: any | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  token: string | null;
}

const initialState: AuthState = {
  profile: null,
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  token: null
};

// Global flag to skip interceptor checks during logout
let isLoggingOut = false;
// AbortController to cancel all pending requests during logout
let globalAbortController: AbortController | null = null;

// Export function to set logout flag
export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  if (value) {
    // Cancel all pending requests when logout starts
    if (globalAbortController) {
      globalAbortController.abort();
    }
    globalAbortController = new AbortController();
  } else {
    // Reset abort controller when logout is complete
    globalAbortController = null;
  }
};

// Export function to get abort signal for API calls
export const getAbortSignal = (): AbortSignal | null => {
  if (isLoggingOut && globalAbortController) {
    return globalAbortController.signal;
  }
  return null;
};

// Export function to check if logging out
export const isLoggingOutCheck = (): boolean => {
  return isLoggingOut;
};

// Setup axios interceptors for token expiration checking and 401 responses
if (typeof window !== 'undefined') {
  let isHandling401 = false;

  // Request interceptor: Check token expiration before making requests
  axios.interceptors.request.use(
    (config) => {
      // Skip all checks if we're logging out
      if (isLoggingOut) {
        return config;
      }

      // Check token expiration before making API calls
      const pathname = window.location.pathname;
      if (pathname !== '/signin' && !pathname.startsWith('/signin/')) {
        const token = getToken();
        
        // Only check JWT expiration, not cookie expiration (cookie might be missing but token valid)
        // If token exists but is expired (JWT), clear it and redirect
        if (token && isTokenExpired(token)) {
          if (!isHandling401) {
            isHandling401 = true;
            console.warn('🔒 Axios: Token expired (JWT) before API call', config.url);
            handleTokenExpiration();
          }
          // Cancel the request
          return Promise.reject(new Error('Token expired'));
        }
        
        // Don't check cookie expiration in axios interceptor - let components handle it
        // Just sync tokens if cookie exists
        const cookieToken = Cookies.get('api_token');
        const localToken = localStorage.getItem('api_token');
        
        // Sync localStorage with cookie if cookie exists
        if (cookieToken && !localToken) {
          localStorage.setItem('api_token', cookieToken);
        }
        
        // If both exist but are different, prefer cookie
        if (cookieToken && localToken && cookieToken !== localToken) {
          localStorage.setItem('api_token', cookieToken);
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle 401 responses
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Skip 401 handling if we're logging out
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !isHandling401) {
        // Don't redirect if already on signin page
        const pathname = window.location.pathname;
        if (pathname !== '/signin' && !pathname.startsWith('/signin/')) {
          isHandling401 = true;
          console.warn('🔒 Axios: Received 401 Unauthorized - Token expired or invalid');
          handleTokenExpiration();
        }
      }
      return Promise.reject(error);
    }
  );
}

// Register user thunk
export const registerUser = createAsyncThunk(
  'auth/register',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/register`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || `Server error: ${error.response.status}`;
        return rejectWithValue(message);
      } else if (error.request) {
        // Request was made but no response received
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        // Something else happened
        return rejectWithValue(error.message || 'Registration failed. Please try again.');
      }
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ email, otp, location }: { email: string; otp: string; location?: any }, { rejectWithValue, dispatch }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/verify-otp`,
        {
          email,
          otp,
          location
        },
        {
          validateStatus: (status) => {
            // Accept all status codes to prevent axios from throwing
            return status >= 200 && status < 500;
          }
        }
      );

      // Check if response was successful
      if (response.status >= 200 && response.status < 300) {
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('api_token', response.data.token);
        }

        // Send welcome notification after successful account creation
        // Wait a bit for the backend notification to be created and Socket.IO to connect
        console.log('✅ Account created, scheduling welcome notification...');
        setTimeout(() => {
          console.log('⏰ Sending welcome notification now...');
          import('../slices/notificationSlice').then(({ createNotification }) => {
            dispatch(createNotification({
              type: 'success',
              content: 'Welcome to TalentAI! 🎉 We\'re excited to have you on board. Start exploring amazing opportunities and connect with top talent.'
            }) as any)
            .then(() => {
              console.log('✅ Welcome notification sent successfully!');
            })
            .catch((err: any) => {
              console.error('❌ Welcome notification failed:', err);
            });
          });
        }, 2000);

        return response.data;
      } else {
        // Handle 4xx errors (like 400 Bad Request)
        const message = response.data?.message || `Verification failed: ${response.statusText}`;
        return rejectWithValue(message);
      }
    } catch (error: any) {
      console.error('OTP verification error:', error);

      if (error.response) {
        // Server responded with error status
        const message = error.response.data?.message || `Server error: ${error.response.status}`;
        return rejectWithValue(message);
      } else if (error.request) {
        // Request was made but no response received
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        // Something else happened
        return rejectWithValue(error.message || 'Verification failed. Please try again.');
      }
    }
  }
);

// Async thunk for logout - handles all cleanup centrally
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      console.log('🚪 Starting logout process...');

      // Set logout flag to prevent axios interceptors from triggering
      setLoggingOut(true);

      // Import at runtime to avoid circular dependency
      const { resetRedirectState } = await import('@/utils/authRedirect');
      const { clearProfile, clearProfileCache } = await import('./profileSlice');
      const Cookies = await import('js-cookie').then(m => m.default);

      resetRedirectState();

      // Clear Redux state - dispatch all slice clear actions
      (dispatch as any)(clearProfile());
      (dispatch as any)(clearProfileCache());

      // Clear all storage
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });
      localStorage.clear();

      // Clear all cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Sign out from NextAuth if available
      if (typeof window !== 'undefined') {
        try {
          const { signOut } = await import('next-auth/react');
          await signOut({ redirect: false });
        } catch (error) {
          console.warn('NextAuth signOut failed:', error);
        }
      }

      console.log('✅ Logout successful');
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      return rejectWithValue(error.message || 'Logout failed');
    } finally {
      // Reset logout flag
      setLoggingOut(false);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.profile = null;
      state.user = null;
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = null;
      state.token = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.token = action.payload.token;
        if (action.payload.user) {
          state.profile = action.payload.profile;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        }
        if (action.payload.token) {
          localStorage.removeItem("api_token");
          Cookies.remove("api_token");
          localStorage.setItem("api_token", action.payload.token);
          Cookies.set("api_token", action.payload.token, {
            expires: 30,
            path: "/",
            sameSite: "lax",
          });
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        // Reset to initial state
        state.profile = null;
        state.user = null;
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        // Even on error, clear auth state
        state.profile = null;
        state.user = null;
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.token = null;
      });
  }
});

export const { clearError, clearAuth, setUser } = authSlice.actions;
export default authSlice.reducer; 