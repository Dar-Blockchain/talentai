import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { selectProfile, getMyProfile } from '../store/slices/profileSlice';
import { redirectToLogin, isRedirectingToLogin } from '@/utils/authRedirect';
import {
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';

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
    // Prevent multiple redirects
    if (hasRedirectedRef.current || isRedirectingToLogin()) {
      return;
    }

    // Don't check if already on signin page
    if (router.pathname === '/signin') {
      setIsChecking(false);
      return;
    }

    // Check token first
    const token = localStorage.getItem('api_token');
    if (!token) {
      if (!hasCheckedTokenRef.current) {
        hasCheckedTokenRef.current = true;
        hasRedirectedRef.current = true;
        console.log("No token found, redirecting to signin");
        redirectToLogin(router);
      }
      return;
    }

    // Check if profile fetch failed due to 401
    if (profileError && profileError.includes('Token expired') && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      console.log("Token expired, redirecting to signin");
      redirectToLogin(router);
      return;
    }

    // Fetch profile if not already loaded and not loading
    if (!profile && !profileLoading && !hasCheckedTokenRef.current) {
      hasCheckedTokenRef.current = true;
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
            const tokenStillExists = localStorage.getItem('api_token');
            if (tokenStillExists && !hasRedirectedRef.current) {
              dispatch(getMyProfile());
            } else if (!tokenStillExists && !hasRedirectedRef.current) {
              hasRedirectedRef.current = true;
              redirectToLogin(router);
            }
          }, 1000);
          return;
        } else {
          // After retries, redirect if no profile
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            console.log("Profile not found after retries, redirecting to signin");
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