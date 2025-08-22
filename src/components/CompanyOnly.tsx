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

interface CompanyOnlyProps {
  children: React.ReactNode;
}

export default function CompanyOnly({ children }: CompanyOnlyProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, profile , isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);
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
    if (!profile && !isLoading) {
      dispatch(getMyProfile());
    }
  }, [dispatch, profile, isLoading, router]);

  useEffect(() => {
    if (!isLoading) {
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

      // Check user role and redirect accordingly
      if (user?.role === 'Candidat' || user?.role === 'Candidate') {
        // Candidate user trying to access company page, redirect to candidate dashboard
        console.log("Candidate user detected, redirecting to candidate dashboard");
        router.push('/dashboard/candidate');
        return;
      } else if (user?.role === 'Admin') {
        // Admin user trying to access company page, redirect to admin dashboard
        console.log("Admin user detected, redirecting to admin dashboard");
        router.push('/dashboard/admin');
        return;
      } else if (user?.role !== 'Company') {
        // Unknown role, redirect to signin
        console.log("Unknown role, redirecting to signin");
        router.push('/signin');
        return;
      }

      // User is a company, allow access
      console.log("User is company, allowing access");
      setIsChecking(false);
    }
  }, [profile, isLoading, router, retryCount, dispatch]);

  // Show loading while checking permissions
  if (isLoading || isChecking) {
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
          {retryCount > 0 ? `Verifying company permissions... (Retry ${retryCount}/3)` : "Verifying company permissions..."}
        </Alert>
      </Box>
    );
  }

  // Show error if user is not a company
  if (!isLoading && user?.role !== 'Company') {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          Access Denied. This page is only for companies.
        </Alert>
      </Box>
    );
  }

  // User is a company, render the children
  return <>{children}</>;
} 