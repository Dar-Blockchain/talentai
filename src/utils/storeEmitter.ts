/**
 * Store emitter — lets code outside React (e.g. Axios interceptors)
 * trigger Redux state clearing when the session expires.
 *
 * Usage:
 *   1. Call `setSessionExpiredHandler(handler)` once inside a component (done in _app.tsx).
 *   2. Call `emitSessionExpired()` from anywhere (interceptors, utils, etc.).
 */

type SessionExpiredHandler = () => void;

let _handler: SessionExpiredHandler | null = null;

export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  _handler = handler;
}

export function emitSessionExpired(): void {
  if (_handler) {
    _handler();
  } else {
    console.warn('[Session] Session expired but no handler registered');
  }
}
