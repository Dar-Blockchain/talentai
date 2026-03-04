/**
 * Toast emitter — lets code outside React (e.g. Axios interceptors)
 * trigger the app-level toast notification.
 *
 * Usage:
 *   1. Call `setToastHandler(showToast)` once inside a React component (done in _app.tsx).
 *   2. Call `emitToast({ message, severity })` from anywhere (interceptors, utils, etc.).
 */

type ToastSeverity = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  message: string;
  severity?: ToastSeverity;
}

type ToastHandler = (options: ToastOptions) => void;

let _handler: ToastHandler | null = null;

export function setToastHandler(handler: ToastHandler): void {
  _handler = handler;
}

export function emitToast(options: ToastOptions): void {
  if (_handler) {
    _handler(options);
  } else {
    // Fallback if handler isn't registered yet
    console.warn('[Toast]', options.severity?.toUpperCase(), options.message);
  }
}
