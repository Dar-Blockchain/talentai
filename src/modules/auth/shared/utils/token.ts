import Cookies from 'js-cookie';

/** Returns the JWT from the cookie set by the backend after OTP verification. */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return Cookies.get('jwt_token') ?? null;
}

/** Saves the JWT token in a client-side cookie (7-day expiry). */
export function saveToken(token: string): void {
  if (typeof window === 'undefined') return;
  Cookies.set('jwt_token', token, { path: '/', expires: 7, sameSite: 'strict' });
}

/** Removes the auth cookie from the browser (backend also clears it on logout). */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  Cookies.remove('jwt_token', { path: '/' });
}

/** Decodes the JWT exp claim and returns true if the token is expired or unreadable. */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const base64  = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    if (!payload.exp) return true;
    return Math.floor(Date.now() / 1000) >= payload.exp;
  } catch {
    return true;
  }
}
