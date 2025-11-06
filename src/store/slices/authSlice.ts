import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

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

// Setup axios interceptor for 401 responses (token expiration)
if (typeof window !== 'undefined') {
  let isHandling401 = false;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401 && !isHandling401) {
        // Don't redirect if already on signin page
        if (window.location.pathname !== '/signin') {
          isHandling401 = true;
          console.warn('🔒 Axios: Received 401 Unauthorized - Token expired or invalid');
          
          // Clear tokens
          localStorage.removeItem('api_token');
          Cookies.remove('api_token');
          
          // Redirect to login
          const currentPath = window.location.pathname + window.location.search;
          const loginUrl = `/signin${currentPath !== '/signin' ? `?returnUrl=${encodeURIComponent(currentPath)}` : ''}`;
          
          setTimeout(() => {
            window.location.href = loginUrl;
          }, 100);
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
  async ({ email, otp, location }: { email: string; otp: string; location?: any }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/verify-otp`, {
        email,
        otp,
        location
      });
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
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

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
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
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, logout, setUser } = authSlice.actions;
export default authSlice.reducer; 