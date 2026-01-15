import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie";
import { createNotification } from "./notificationSlice";
import { clearConnectedUser, setConnectedUser } from "./userSlice";

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  isLoading: false,
  error: null,
};

// Global flag to skip interceptor checks during logout
let isLoggingOut = false;

// Export function to set logout flag
export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
};

// Export function to check if logging out
export const isLoggingOutCheck = (): boolean => {
  return isLoggingOut;
};

// Register user thunk
export const registerUser = createAsyncThunk(
  "auth/register",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/register`,
        { email }
      );
      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);

      if (error.response) {
        // Server responded with error status
        const message =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        return rejectWithValue(message);
      } else if (error.request) {
        // Request was made but no response received
        return rejectWithValue("Network error: Unable to connect to server");
      } else {
        // Something else happened
        return rejectWithValue(
          error.message || "Registration failed. Please try again."
        );
      }
    }
  }
);

export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async (
    { email, otp, location }: { email: string; otp: string; location?: any },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/verify-otp`,
        {
          email,
          otp,
          location,
        },
        {
          validateStatus: (status) => {
            // Accept all status codes to prevent axios from throwing
            return status >= 200 && status < 500;
          },
        }
      );

      // Check if response was successful
      if (response.status >= 200 && response.status < 300) {
        // Store token in localStorage
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("api_token", response.data.token);
        }

        if (response?.data?.user) {
          dispatch(setConnectedUser(response.data));
        }

        dispatch(
          createNotification({
            type: "success",
            content:
              "Welcome to TalentAI! 🎉 We're excited to have you on board. Start exploring amazing opportunities and connect with top talent.",
          }) as any
        );
        return response.data;
      } else {
        // Handle 4xx errors (like 400 Bad Request)
        const message =
          response.data?.message ||
          `Verification failed: ${response.statusText}`;
        return rejectWithValue(message);
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);

      if (error.response) {
        // Server responded with error status
        const message =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        return rejectWithValue(message);
      } else if (error.request) {
        // Request was made but no response received
        return rejectWithValue("Network error: Unable to connect to server");
      } else {
        // Something else happened
        return rejectWithValue(
          error.message || "Verification failed. Please try again."
        );
      }
    }
  }
);

// Async thunk for logout - handles all cleanup centrally
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Prevent interceptors from running
      setLoggingOut(true);

      dispatch(clearConnectedUser());

      // Clear storage
      localStorage.removeItem("api_token");
      localStorage.removeItem("token");
      const userType = localStorage.getItem("userType");

      localStorage.clear();

      if (userType) {
        localStorage.setItem("userType", userType);
      }

      // Clear cookies
      Object.keys(Cookies.get()).forEach((cookieName) => {
        Cookies.remove(cookieName, { path: "/" });
      });

      return true;
    } catch (error: any) {
      console.error("❌ Logout error:", error);
      // Still redirect to signin even on error
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
      return rejectWithValue(error.message || "Logout failed");
    } finally {
      setLoggingOut(false);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearAuth: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.error = null;
      state.token = null;
    },
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
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = null;
        state.token = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
        state.token = null;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
