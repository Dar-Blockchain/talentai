import Cookies from 'js-cookie';

// The JWT is now stored in an httpOnly cookie (set server-side) and is not
// readable by JavaScript. Auth state is tracked via a companion non-sensitive
// indicator cookie ("auth_present") whose value carries no credential data.

/** Returns a truthy string ("1") when the user has an active session, null otherwise. */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('auth_present') ?? null;
}

/**
 * Sets the JS-readable auth indicator cookie.
 * The actual JWT is managed server-side (httpOnly); this function only updates
 * the companion indicator so client code can detect authenticated state.
 * The token parameter is accepted for API compatibility but is not stored.
 */
export function saveToken(_token?: string): void {
  if (typeof window === 'undefined') return;
  Cookies.set('auth_present', '1', { path: '/', expires: 7, sameSite: 'strict' });
}

/** Removes the auth indicator cookie. The server clears the httpOnly JWT on logout. */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove('auth_present', { path: '/' });
}

