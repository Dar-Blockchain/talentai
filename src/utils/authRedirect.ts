/**
 * Global authentication redirect utility
 * Prevents infinite redirect loops by tracking redirect state
 */

let isRedirecting = false;
let redirectTimeout: NodeJS.Timeout | null = null;

/**
 * Safely redirect to login page
 * Prevents multiple simultaneous redirects and redirect loops
 */
export const redirectToLogin = (router: any, returnUrl?: string): void => {
  // Prevent multiple redirects
  if (isRedirecting) {
    return;
  }

  // Don't redirect if already on signin page
  if (typeof window !== 'undefined' && window.location.pathname === '/signin') {
    return;
  }

  // Set redirecting flag
  isRedirecting = true;

  // Clear any existing timeout
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
  }

  // Get current path for return URL
  const currentPath = typeof window !== 'undefined' 
    ? window.location.pathname + window.location.search 
    : '/';
  
  const redirectPath = returnUrl || (currentPath !== '/signin' ? currentPath : '/');
  const loginUrl = `/signin${redirectPath !== '/signin' && redirectPath !== '/' ? `?returnUrl=${encodeURIComponent(redirectPath)}` : ''}`;

  // Use window.location for a hard redirect to prevent loops
  if (typeof window !== 'undefined') {
    window.location.href = loginUrl;
  } else if (router) {
    router.push(loginUrl);
  }

  // Reset flag after delay (in case redirect fails)
  redirectTimeout = setTimeout(() => {
    isRedirecting = false;
  }, 2000);
};

/**
 * Check if currently redirecting
 */
export const isRedirectingToLogin = (): boolean => {
  return isRedirecting;
};

/**
 * Reset redirect state (use with caution)
 */
export const resetRedirectState = (): void => {
  isRedirecting = false;
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }
};

