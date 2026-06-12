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

export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('api_token');
  Cookies.remove('api_token');
}

