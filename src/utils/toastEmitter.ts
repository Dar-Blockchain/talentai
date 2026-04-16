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
let _ready = false;
const _queue: ToastOptions[] = [];

export function setToastHandler(handler: ToastHandler): void {
  _handler = handler;
  _ready = true;
  // Flush any queued toasts that arrived before handler was registered
  _queue.splice(0).forEach((opts) => handler(opts));
}

export function emitToast(options: ToastOptions): void {
  if (_ready && _handler) {
    _handler(options);
  } else {
    // Queue the toast until the handler is registered
    _queue.push(options);
  }
}
