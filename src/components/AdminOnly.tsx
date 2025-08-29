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

interface AdminOnlyProps {
  children: React.ReactNode;
}

export default function AdminOnly({ children }: AdminOnlyProps) {
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
    if (!profileLoading) {
      if (!profile) {
        // No profile found, but let's retry a few times before redirecting
        if (retryCount < 3) {
          console.log(`Profile not found, retrying... (${retryCount + 1}/3)`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            dispatch(getMyProfile());
          }, 1000);
          return;
        } else {
          // After 3 retries, redirect to signin
          console.log("Profile not found after retries, redirecting to signin");
          router.push('/signin');
          return;
        }
      }

      if (profile.userId.role !== 'Admin') {
        // Not an admin, redirect to unauthorized page
        console.log("User is not admin, redirecting to unauthorized");
        router.push('/unauthorized');
        return;
      }

      // User is admin, allow access
      console.log("User is admin, allowing access");
      setIsChecking(false);
    }
  }, [profile, profileLoading, router, retryCount, dispatch]);

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