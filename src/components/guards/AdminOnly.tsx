import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { redirectToLogin, isRedirectingToLogin } from '@/utils/authRedirect';
import { isTokenExpired, handleTokenExpiration } from '@/utils/tokenUtils';
import Cookies from 'js-cookie';
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getMyProfile, selectProfile } from '@/store/slices/profileSlice';
import { isLoggingOutCheck } from '@/store/slices/authSlice';
import { AppDispatch } from '@/store/store';

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading: profileLoading, error: profileError } = useSelector(selectProfile);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const hasRedirectedRef = useRef(false);
  const hasCheckedTokenRef = useRef(false);

  // Single useEffect to handle all authentication checks
  useEffect(() => {
    // CRITICAL: Prevent multiple redirects - check early and exit immediately
    // This must be the first check to prevent any loops
    if (hasRedirectedRef.current) {
      setIsChecking(false);
      return;
    }

    if (isRedirectingToLogin()) {
      setIsChecking(false);
      hasRedirectedRef.current = true; // Mark as redirected to prevent future checks
      return;
    }

    // Don't check if already on signin page
    const pathname = router.pathname;
    if (pathname === '/signin' || pathname.startsWith('/signin/')) {
      setIsChecking(false);
      return;
    }

    // Check token first - if we have a token, try to use it
    // Only check once per component mount to prevent loops
    if (!hasCheckedTokenRef.current) {
      hasCheckedTokenRef.current = true;
      
      const cookieToken = Cookies.get('api_token');
      const localToken = localStorage.getItem('api_token');
      
      // If cookie is missing but localStorage has token, cookie expired/deleted - clear localStorage and redirect
      if (!cookieToken && localToken) {
        console.warn("🔒 Cookie expired/deleted - clearing localStorage token and redirecting to signin");
        // Set redirect flag BEFORE clearing to prevent re-checking
        hasRedirectedRef.current = true;
        localStorage.removeItem('api_token');
        setIsChecking(false);
        redirectToLogin(router);
        return;
      }
      
      const token = cookieToken || localToken;
      
      // If no token at all, redirect
      if (!token) {
        hasRedirectedRef.current = true;
        setIsChecking(false);
        console.log("🔒 No token found, redirecting to signin");
        redirectToLogin(router);
        return;
      }

      // If we have a token, check if it's expired (JWT expiration)
      if (isTokenExpired(token)) {
        hasRedirectedRef.current = true;
        setIsChecking(false);
        console.log("🔒 Token expired (JWT), clearing and redirecting to signin");
        handleTokenExpiration();
        return;
      }

      // Sync localStorage with cookie if cookie exists
      if (cookieToken && !localToken) {
        localStorage.setItem('api_token', cookieToken);
      }
      
      // If both exist but are different, prefer cookie
      if (cookieToken && localToken && cookieToken !== localToken) {
        localStorage.setItem('api_token', cookieToken);
      }
    }

    // Early exit if already redirected
    if (hasRedirectedRef.current || isRedirectingToLogin()) {
      setIsChecking(false);
      return;
    }

    // Check if profile fetch failed due to 401
    if (profileError && (profileError.includes('Token expired') || profileError.includes('401')) && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      setIsChecking(false);
      console.log("🔒 Profile fetch failed (401/expired), redirecting to signin");
      redirectToLogin(router);
      return;
    }

    // Fetch profile if not already loaded and not loading
    // Only fetch if we haven't redirected and token check passed and not logging out
    if (!profile && !profileLoading && hasCheckedTokenRef.current && !hasRedirectedRef.current && !isRedirectingToLogin() && !isLoggingOutCheck()) {
      dispatch(getMyProfile());
      return;
    }

    // Handle profile loading states
    if (!profileLoading) {
      if (!profile) {
        // No profile found after fetch
        if (retryCount < 2) {
          // Retry once more
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            // Check if we've already redirected or are in the process of redirecting or logging out
            if (hasRedirectedRef.current || isRedirectingToLogin() || isLoggingOutCheck()) {
              setIsChecking(false);
              return;
            }
            
            const tokenStillExists = localStorage.getItem('api_token');
            if (tokenStillExists && !hasRedirectedRef.current && !isLoggingOutCheck()) {
              // Verify token is not expired before retrying
              if (!isTokenExpired(tokenStillExists)) {
                dispatch(getMyProfile());
              } else {
                // Token expired during retry, redirect
                hasRedirectedRef.current = true;
                setIsChecking(false);
                handleTokenExpiration();
              }
            } else if (!tokenStillExists && !hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              setIsChecking(false);
              redirectToLogin(router);
            }
          }, 1000);
          return;
        } else {
          // After retries, redirect if no profile
          if (!hasRedirectedRef.current && !isRedirectingToLogin()) {
            hasRedirectedRef.current = true;
            setIsChecking(false);
            console.log("🔒 Profile not found after retries, redirecting to signin");
            redirectToLogin(router);
          }
          return;
        }
      }

      // Profile exists - check role
      if (profile.userId.role !== 'Admin') {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.push('/unauthorized');
        }
        return;
      }

      // User is admin, allow access
      setIsChecking(false);
    }
  }, [profile, profileLoading, profileError, router, retryCount, dispatch]);

  // Show loading while checking permissions
  if (profileLoading || isChecking) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={60} />
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          {retryCount > 0 ? `Verifying admin permissions... (Retry ${retryCount}/3)` : "Verifying admin permissions..."}
        </Alert>
      </Box>
    );
  }

  // Show error if user is not admin
  if (!profileLoading && profile && profile.userId.role !== 'Admin') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Access Denied. You do not have permission to view this page.
        </Alert>
      </Box>
    );
  }

  // User is admin, render the children
  return <>{children}</>;
} 