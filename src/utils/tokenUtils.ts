import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

interface DecodedToken {
  exp?: number;
  iat?: number;
  id?: string;
  [key: string]: any;
}

/**
 * Check if a JWT token is expired
 * @param token - The JWT token to check
 * @returns true if token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    
    // Check if token has expiration claim
    if (!decoded.exp) {
      // If no expiration claim, consider it invalid
      return true;
    }

    // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < currentTime;
    
    if (isExpired) {
      console.warn('🔒 Token is expired:', {
        expiredAt: new Date(decoded.exp * 1000).toISOString(),
        currentTime: new Date().toISOString(),
      });
    }
    
    return isExpired;
  } catch (error) {
    // If token cannot be decoded, consider it invalid/expired
    console.error('🔒 Error decoding token:', error);
    return true;
  }
}

/**
 * Get the current token from localStorage or cookies
 * @returns The token string or null if not found
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try cookie first (more reliable for expiration)
  const cookieToken = Cookies.get('api_token');
  if (cookieToken) return cookieToken;
  
  // Fallback to localStorage
  const localToken = localStorage.getItem('api_token');
  return localToken || null;
}

/**
 * Check if cookie is expired or missing
 * @returns true if cookie is missing, false if it exists
 */
export function isCookieExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  const cookieToken = Cookies.get('api_token');
  return !cookieToken;
}

/**
 * Check if the current token is expired
 * Only checks JWT expiration, not cookie expiration
 * @returns true if token is expired or missing, false otherwise
 */
export function isCurrentTokenExpired(): boolean {
  if (typeof window === 'undefined') return true;
  
  // Get token from localStorage or cookie (prefer cookie, but allow localStorage)
  const cookieToken = Cookies.get('api_token');
  const localToken = localStorage.getItem('api_token');
  const token = cookieToken || localToken;
  
  // If no token at all, it's expired
  if (!token) {
    return true;
  }
  
  // Check JWT expiration only (don't clear localStorage if cookie is missing)
  return isTokenExpired(token);
}

/**
 * Check if cookie was deleted and clear localStorage if so
 * This keeps cookie and localStorage in sync
 * @returns true if cookie was deleted (and localStorage was cleared), false otherwise
 */
export function checkAndClearIfCookieDeleted(): boolean {
  if (typeof window === 'undefined') return false;
  
  const cookieToken = Cookies.get('api_token');
  const localToken = localStorage.getItem('api_token');
  
  // If cookie is missing but localStorage has token, cookie was deleted - clear localStorage
  if (!cookieToken && localToken) {
    console.warn('🔒 Cookie deleted - clearing localStorage token to keep them in sync');
    localStorage.removeItem('api_token');
    return true;
  }
  
  return false;
}

/**
 * Validate token and sync cookie with localStorage
 * If cookie is deleted, clears localStorage to keep them in sync
 * @returns true if token is valid and synced, false otherwise
 */
export function validateAndSyncToken(): boolean {
  if (typeof window === 'undefined') return false;
  
  const cookieToken = Cookies.get('api_token');
  const localToken = localStorage.getItem('api_token');
  
  // If cookie is missing but localStorage has token, cookie was deleted - clear localStorage
  if (!cookieToken && localToken) {
    console.warn('🔒 Cookie deleted - clearing localStorage token to keep them in sync');
    localStorage.removeItem('api_token');
    return false;
  }
  
  // If cookie exists but localStorage doesn't, sync localStorage
  if (cookieToken && !localToken) {
    localStorage.setItem('api_token', cookieToken);
  }
  
  // If both exist but are different, prefer cookie (more reliable)
  if (cookieToken && localToken && cookieToken !== localToken) {
    console.warn('🔒 Token mismatch - syncing localStorage with cookie');
    localStorage.setItem('api_token', cookieToken);
  }
  
  // Get token (prefer cookie)
  const token = cookieToken || localToken;
  
  // If no token at all, it's invalid
  if (!token) {
    return false;
  }
  
  // Check JWT expiration
  return !isTokenExpired(token);
}

/**
 * Clear all authentication tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('api_token');
  Cookies.remove('api_token');
  console.log('🔒 Tokens cleared');
}

/**
 * Get token info (for debugging)
 */
export function getTokenInfo(token?: string | null): {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  decoded?: DecodedToken;
} {
  const tokenToCheck = token || getToken();
  
  if (!tokenToCheck) {
    return { isValid: false, isExpired: true };
  }
  
  try {
    const decoded = jwtDecode<DecodedToken>(tokenToCheck);
    const isExpired = decoded.exp ? decoded.exp < Math.floor(Date.now() / 1000) : true;
    
    return {
      isValid: true,
      isExpired,
      expiresAt: decoded.exp ? new Date(decoded.exp * 1000) : undefined,
      decoded,
    };
  } catch (error) {
    return { isValid: false, isExpired: true };
  }
}

