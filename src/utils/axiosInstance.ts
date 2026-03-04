import axios from 'axios';
import { getToken, clearTokens } from './tokenUtils';
import { emitToast } from './toastEmitter';
import { emitSessionExpired } from './storeEmitter';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

/* ─── Request interceptor ──────────────────────────────────────────────────
 * Attach the auth token to every outgoing request.
 * ────────────────────────────────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
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
    console.log('❌ Axios error:', {
      status,
      data,
      isTokenInvalid,
    });
    if (isTokenInvalid) {
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
