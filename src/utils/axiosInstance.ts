import axios from 'axios';
import { getToken, clearTokens } from './tokenUtils';
import { emitToast } from './toastEmitter';
import { emitSessionExpired } from './storeEmitter';

// Set by the store during logout to suppress interceptor side-effects
let _isLoggingOut = false;
export const setAxiosLoggingOut = (v: boolean) => { _isLoggingOut = v; };

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

/* ─── Request interceptor ──────────────────────────────────────────────────
 * Attach the auth token to every outgoing request.
 * Cancel the request entirely during logout to stop spurious API calls.
 * ────────────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    if (_isLoggingOut) {
      const controller = new AbortController();
      controller.abort();
      config.signal = controller.signal;
      return config;
    }
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ─── Response interceptor ─────────────────────────────────────────────────
 * On 401 with TOKEN_INVALID: clear tokens, show a message, redirect to login.
 * ────────────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data = error.response?.data;

    const isTokenInvalid =
      status === 401 &&
      (data?.code === 'TOKEN_INVALID' ||
        data?.error === 'TOKEN_INVALID' ||
        data?.message === 'Invalid or expired token' || 'Token missing');
    if (isTokenInvalid && !_isLoggingOut) {
      clearTokens();
      emitSessionExpired();

      emitToast({
        message: 'Your session has expired. Please sign in again.',
        severity: 'warning',
      });

      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
