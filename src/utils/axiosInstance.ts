import axios from 'axios';
import { getToken, clearTokens } from '@/modules/auth/shared/utils/token';
import { emitToast } from './toastEmitter';
import { emitSessionExpired } from './storeEmitter';


// Set by the store during logout to suppress interceptor side-effects
let _isLoggingOut = false;
export const setAxiosLoggingOut = (v: boolean) => { _isLoggingOut = v; };

const axiosInstance = axios.create({
  baseURL:      process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // send jwt_token cookie automatically on every request
});

/* ─── Request interceptor ──────────────────────────────────────────────────
 * Abort the request entirely during logout to stop spurious API calls.
 * Also attach Authorization header for compatibility with socket clients
 * and any manual fetch calls that rely on the token value.
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
 * On 401 TOKEN_INVALID: clear local token, show message, redirect to login.
 * ────────────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const data   = error.response?.data;

    const isTokenInvalid =
      status === 401 &&
      (data?.code === 'TOKEN_INVALID' ||
        data?.code === 'TOKEN_REVOKED' ||
        data?.code === 'TOKEN_MISSING' ||
        data?.message === 'Invalid or expired token' ||
        data?.message === 'Token has been revoked');

    // Only treat this as a surprise session expiry if:
    // 1. The 401 code signals an invalid/revoked/missing token
    // 2. We are NOT already in a deliberate logout flow
    // 3. The user actually HAS a token — if getToken() is null the client is
    //    already logged out and showing a "session expired" toast is misleading.
    if (isTokenInvalid && !_isLoggingOut && getToken()) {
      clearTokens();
      emitSessionExpired();
      emitToast({ message: 'Your session has expired. Please sign in again.', severity: 'warning' });
      if (typeof window !== 'undefined') window.location.href = '/signin';
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
