'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout, setLoggingOut } from '@/store/slices/authSlice';
import { resetRedirectState } from '@/utils/authRedirect';
import Cookies from 'js-cookie';
import { PreferencesHeader,PreferencesMain } from '@/components/preferences';
import { usePreferences } from '@/components/preferences/hooks/usePreferences';

function Preferences() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isClient, setIsClient] = useState(false);

  const {userType,setUserType,setIsTestJobReturnUrl} = usePreferences();

  // Add effect to check traffic counter
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    const checkProfile = async () => {
      // Check if returnUrl points to a test job
      const returnUrl = router.query.returnUrl as string;
      if (returnUrl && returnUrl.includes('/testjob/')) {
        setIsTestJobReturnUrl(true);
        return;
      }

      // Add a small delay to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const token = localStorage.getItem('api_token');
        
        if (!token) {
          // Don't redirect if already on signin page
          if (router.pathname !== '/signin') {
            router.push('/signin');
          }
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // Handle 401 - token expired
        if (response.status === 401) {
          // Clear tokens and redirect
          localStorage.removeItem('api_token');
          Cookies.remove('api_token');
          if (router.pathname !== '/signin') {
            router.push('/signin');
          }
          return;
        }

        // If profile exists and is valid, check returnUrl
        if (response.ok) {
          const data = await response.json();
          
          // Check if profile is complete
          const isProfileComplete = data && data.type &&
            ((data.type === 'Candidate' ) ||
              (data.type === 'Company' ));

          if (isProfileComplete) {
            if (returnUrl) {
              router.push(decodeURIComponent(returnUrl));
              return;
            }

            // If no returnUrl, redirect to appropriate dashboard
            if (data.type === 'Company') {
              router.push('/dashboard/company');
            } else {
              router.push('/dashboard/candidate');
            }
          }
          // If profile is not complete, stay on preferences page
        }
        // If profile doesn't exist or is invalid, stay on preferences page
      } catch (error) {
        console.error('Error checking profile:', error);
        // Stay on preferences page to create profile
      }
    };

    checkProfile();
  }, [router, isClient, setIsTestJobReturnUrl]);

  // Add effect to check for returnUrl on component mount
  useEffect(() => {
    if (!isClient) return;
    
    const returnUrl = router.query.returnUrl as string;
    if (returnUrl && returnUrl.includes('/testjob/')) {
      setIsTestJobReturnUrl(true);
      setUserType('candidate');
    }
  }, [router.query.returnUrl, isClient, setIsTestJobReturnUrl, setUserType]);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Set logout flag to prevent axios interceptors from triggering redirects
      setLoggingOut(true);
      resetRedirectState();
      
      // Clear Redux state FIRST to prevent components from trying to fetch
      dispatch(clearProfile());
      dispatch(logout());
      
      // Then clear the token and storage
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });
      localStorage.clear();
      
      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Sign out from NextAuth (don't await to make redirect faster)
      signOut({ redirect: false }).catch(console.error);
      
      // Redirect immediately (don't wait for async operations)
      window.location.href = '/signin';
    } catch (error) {
      console.error('Logout failed:', error);
      // Even on error, redirect to signin
      setLoggingOut(true);
      resetRedirectState();
      window.location.href = '/signin';
    }
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient || !user) {
    return null;
  }

  // Show loading state while preventing hydration
  if (!isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <h6 style={{ color: '#666' }}>
          Loading...
        </h6>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <PreferencesHeader
        userType={userType}
        username={user.username || 'User'}
        email={user.email || ''}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <PreferencesMain />
    </div>
  );
}

// Export with dynamic import to prevent SSR hydration issues
export default dynamic(() => Promise.resolve(Preferences), {
  ssr: false,
  loading: () => (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f5f5f5'
    }}>
      <h6 style={{ color: '#666' }}>
        Loading...
      </h6>
    </div>
  )
});
