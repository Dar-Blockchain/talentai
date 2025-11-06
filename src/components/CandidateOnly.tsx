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

interface CandidateOnlyProps {
  children: React.ReactNode;
}

export default function CandidateOnly({ children }: CandidateOnlyProps) {
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
      if (profile.userId.role === 'Company') {
        router.push('/dashboard/company');
        return;
      } else if (profile.userId.role === 'Admin') {
        router.push('/dashboard/admin');
        return;
      } else if (profile.userId.role !== 'Candidat' && profile.userId.role !== 'Candidate') {
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          redirectToLogin(router);
        }
        return;
      }

      // User is a candidate, allow access
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
          {retryCount > 0 ? `Verifying candidate permissions... (Retry ${retryCount}/3)` : "Verifying candidate permissions..."}
        </Alert>
      </Box>
    );
  }

  // Show error if user is not a candidate
  if (!profileLoading && profile && profile.userId.role !== 'Candidat' && profile.userId.role !== 'Candidate') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Access Denied. This page is only for candidates.
        </Alert>
      </Box>
    );
  }

  // User is a candidate, render the children
  return <>{children}</>;
} 