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
 * Sets the JS-readable auth indicator cookie, storing the user's role so the
 * Next.js middleware can do role-based routing without reading the httpOnly
 * jwt_token (which lives on the API domain and is invisible to middleware).
 */
export function saveToken(role: string): void {
  if (typeof window === 'undefined') return;
  Cookies.set('auth_present', role, { path: '/', expires: 7, sameSite: 'lax' });
}

/** Removes the auth indicator cookie. The server clears the httpOnly JWT on logout. */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove('auth_present', { path: '/' });
}

