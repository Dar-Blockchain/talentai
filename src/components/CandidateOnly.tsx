import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import { selectProfile, getMyProfile } from '../store/slices/profileSlice';
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
  const { profile, loading: profileLoading } = useSelector(selectProfile);
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Check if we have a token first
    const token = localStorage.getItem('api_token');
    if (!token) {
      console.log("No token found, redirecting to signin");
      router.push('/signin');
      return;
    }

    // Fetch profile if not already loaded
    if (!profile && !profileLoading) {
      dispatch(getMyProfile());
    }
  }, [dispatch, profile, profileLoading, router]);

  useEffect(() => {
    // Check for token first - if no token, redirect immediately without retries
    const token = localStorage.getItem('api_token');
    if (!token) {
      console.log("No token found, redirecting to signin");
      router.push('/signin');
      return;
    }

    if (!profileLoading) {
      if (!profile) {
        // Check token again before retrying
        const hasToken = localStorage.getItem('api_token');
        if (!hasToken) {
          console.log("Token removed, redirecting to signin");
          router.push('/signin');
          return;
        }
        
        // No profile found, but let's retry a few times before redirecting
        if (retryCount < 3) {
          console.log(`Profile not found, retrying... (${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            // Double-check token before making request
            if (localStorage.getItem('api_token')) {
              dispatch(getMyProfile());
            } else {
              router.push('/signin');
            }
          }, 1000);
          return;
        } else {
          // After 3 retries, redirect to signin
          console.log("Profile not found after retries, redirecting to signin");
          router.push('/signin');
          return;
        }
      }

      // Check user role and redirect accordingly
      if (profile.userId.role === 'Company') {
        // Company user trying to access candidate page, redirect to company dashboard
        console.log("Company user detected, redirecting to company dashboard");
        router.push('/dashboard/company');
        return;
      } else if (profile.userId.role === 'Admin') {
        // Admin user trying to access candidate page, redirect to admin dashboard
        console.log("Admin user detected, redirecting to admin dashboard");
        router.push('/dashboard/admin');
        return;
      } else if (profile.userId.role !== 'Candidat' && profile.userId.role !== 'Candidate') {
        // Unknown role, redirect to signin
        console.log("Unknown role, redirecting to signin");
        router.push('/signin');
        return;
      }

      // User is a candidate, allow access
      console.log("User is candidate, allowing access");
      setIsChecking(false);
    }
  }, [profile, profileLoading, router, retryCount, dispatch]);

  // Early exit if no token (prevents any fetch attempts)
  useEffect(() => {
    const token = localStorage.getItem('api_token');
    if (!token && !profileLoading) {
      router.push('/signin');
    }
  }, [router, profileLoading]);

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