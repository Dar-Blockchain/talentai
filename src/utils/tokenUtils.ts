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
  
  // Try localStorage first
  const localToken = localStorage.getItem('api_token');
  if (localToken) return localToken;
  
  // Fallback to cookies
  const cookieToken = Cookies.get('api_token');
  return cookieToken || null;
}

/**
 * Check if the current token is expired
 * @returns true if token is expired or missing, false otherwise
 */
export function isCurrentTokenExpired(): boolean {
  const token = getToken();
  return isTokenExpired(token);
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
 * Handle token expiration - clear tokens and redirect to login
 * @param currentPath - Optional current path to use as returnUrl
 */
export function handleTokenExpiration(currentPath?: string): void {
  if (typeof window === 'undefined') return;
  
  // Don't redirect if already on signin page
  if (window.location.pathname === '/signin') {
    return;
  }
  
  clearTokens();
  
  const path = currentPath || window.location.pathname + window.location.search;
  const loginUrl = `/signin${path !== '/signin' ? `?returnUrl=${encodeURIComponent(path)}` : ''}`;
  
  console.warn('🔒 Token expired - Redirecting to login');
  window.location.href = loginUrl;
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

