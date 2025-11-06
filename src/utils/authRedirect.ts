/**
 * Global authentication redirect utility
 * Prevents infinite redirect loops by tracking redirect state
 */

let isRedirecting = false;
let redirectTimeout: NodeJS.Timeout | null = null;
let lastRedirectTime = 0;
const REDIRECT_COOLDOWN = 1000; // 1 second cooldown between redirects

/**
 * Safely redirect to login page
 * Prevents multiple simultaneous redirects and redirect loops
 */
export const redirectToLogin = (router: any, returnUrl?: string): void => {
  // Prevent multiple redirects
  if (isRedirecting) {
    console.log('🔒 Already redirecting, skipping...');
    return;
  }

  // Cooldown check - prevent rapid successive redirects
  const now = Date.now();
  if (now - lastRedirectTime < REDIRECT_COOLDOWN) {
    console.log('🔒 Redirect cooldown active, skipping...');
    return;
  }

  // Don't redirect if already on signin page (check pathname only, ignore query params)
  if (typeof window !== 'undefined') {
    const currentPathname = window.location.pathname;
    if (currentPathname === '/signin' || currentPathname.startsWith('/signin/')) {
      console.log('🔒 Already on signin page, skipping redirect');
      return;
    }
  }

  // Set redirecting flag and update last redirect time BEFORE any async operations
  isRedirecting = true;
  lastRedirectTime = now;

  // Clear any existing timeout
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }

  // Get current path for return URL
  const currentPath = typeof window !== 'undefined' 
    ? window.location.pathname + window.location.search 
    : '/';
  
  // Don't use signin as returnUrl, and check for nested signin in query params
  let redirectPath = returnUrl || (currentPath !== '/signin' && !currentPath.startsWith('/signin') ? currentPath : '/');
  
  // Check if returnUrl in query params is already signin (prevent nested loops)
  if (typeof window !== 'undefined' && window.location.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const existingReturnUrl = urlParams.get('returnUrl');
      if (existingReturnUrl && (existingReturnUrl === '/signin' || existingReturnUrl.startsWith('/signin'))) {
        // Don't add returnUrl if it's already pointing to signin
        redirectPath = '/';
      }
    } catch {
      // If parsing fails, use root as returnUrl
      redirectPath = '/';
    }
  }
  
  // Don't add returnUrl if it's signin or root
  const loginUrl = redirectPath !== '/signin' && redirectPath !== '/' && !redirectPath.startsWith('/signin')
    ? `/signin?returnUrl=${encodeURIComponent(redirectPath)}`
    : '/signin';

  console.log('🔒 Redirecting to login:', loginUrl);

  // Use window.location for a hard redirect to prevent loops
  // This is a synchronous operation that immediately stops execution
  if (typeof window !== 'undefined') {
    // Immediate redirect - this stops all further execution
    window.location.href = loginUrl;
    // Code after this line won't execute due to page navigation
  } else if (router) {
    router.push(loginUrl);
  }

  // Reset flag after delay (in case redirect fails - but this shouldn't execute)
  redirectTimeout = setTimeout(() => {
    isRedirecting = false;
  }, 5000); // Increased timeout to 5 seconds
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
  lastRedirectTime = 0;
  if (redirectTimeout) {
    clearTimeout(redirectTimeout);
    redirectTimeout = null;
  }
};

/**
 * Check if we're on signin page and reset redirect state if so
 * This should be called when component mounts on signin page
 */
export const resetRedirectStateIfOnSignin = (): void => {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    if (pathname === '/signin' || pathname.startsWith('/signin/')) {
      resetRedirectState();
    }
  }
};


