// pages/preferences.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { signOut } from 'next-auth/react';
import { clearProfile } from '@/store/slices/profileSlice';
import { logout } from '@/store/slices/authSlice';
import Cookies from 'js-cookie';

// Import the new modular components
import {
  PreferencesHeader,
  UserTypeSelection,
  PersonalDetails,
  CompanyDetails,
  SkillsSelection,
  ExperienceLevel,
  ProficiencyRating,
  HederaQCM,
  Review,
  PreferencesMain
} from '@/components/preferences';

// Import the custom hook
import { usePreferences } from '@/components/preferences/hooks/usePreferences';

function Preferences() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  // Local state for client-side rendering and other missing states
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string>('');

  // Use the custom hook for all preferences logic
  const {
    // State
    activeStep,
    userType,
    selectedCategory,
    isTestJobReturnUrl,
    companyDetails,
    requiredSkills,
    experienceLevel,
    firstName,
    lastName,
    skills,
    skillWarning,
    hederaExp,
    hedQcm,
    proficiency,
    steps,
    currentStep,
    
    // Actions
    setActiveStep,
    setUserType,
    setSelectedCategory,
    setIsTestJobReturnUrl,
    setCompanyDetails,
    setRequiredSkills,
    setExperienceLevel,
    setFirstName,
    setLastName,
    setSkills,
    setSkillWarning,
    setHederaExp,
    setHedQcm,
    setProficiency,
    handleNext,
    handleBack,
    handleUserTypeSelect,
    toggleSkill,
    isCurrentStepValid
  } = usePreferences();

  // Check if user is authenticated
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

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
        console.log('Coming from test page, setting test job return URL flag');
        setIsTestJobReturnUrl(true);
        return;
      }

      // Add a small delay to ensure token is stored
      await new Promise(resolve => setTimeout(resolve, 500));

      try {
        const token = localStorage.getItem('api_token');
        console.log('Current token:', token);
        
        if (!token) {
          console.log('No token found, redirecting to signin');
          router.push('/signin');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        // If profile exists and is valid, check returnUrl
        if (response.ok) {
          const data = await response.json();
          
          // Check if profile is complete
          const isProfileComplete = data && data.type &&
            ((data.type === 'Candidate' ) ||
              (data.type === 'Company' ));

          if (isProfileComplete) {
            if (returnUrl) {
              console.log('Found returnUrl, redirecting to:', returnUrl);
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
      // Clear the token from both localStorage and cookies
      localStorage.removeItem('api_token');
      Cookies.remove('api_token', { path: '/' });

      // Clear all other data
      localStorage.clear();

      // Clear all other cookies
      Object.keys(Cookies.get()).forEach(cookieName => {
        Cookies.remove(cookieName, { path: '/' });
      });

      // Clear Redux state
      dispatch(clearProfile());
      dispatch(logout());

      // Sign out from NextAuth
      await signOut({ redirect: false });

      // Redirect to signin page
      router.push('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Handle profile creation/update
  const handleCreateOrUpdateProfile = async () => {
    try {
      // Get token from cookies
      const token = Cookies.get('api_token');

      if (!token) {
        console.error('No token found');
        return false;
      }

      if (userType === 'company') {
        // Format company profile data
        const companyProfileData = {
          name: companyDetails.name,
          industry: companyDetails.industry,
          size: companyDetails.size,
          location: companyDetails.location,
          requiredSkills: requiredSkills,
          requiredExperienceLevel: experienceLevel,
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateCompanyProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(companyProfileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update company profile');
        }

        return true;
      } else {
        // Create candidate profile with all filled data
        const profileData = {
          type: "Candidate",
          FirstName: firstName,
          LastName: lastName,
          skills: skills.map(skill => ({ skill })), // array of objects for backend
          proficiencyLevels: Object.entries(proficiency)
            .filter(([skill]) => skills.includes(skill))
            .map(([skill, level]) => ({ skill, level })),
          hederaExperience: hederaExp === 'yes' ? hedQcm : undefined
        };

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateProfile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(profileData)
        });

        if (!response.ok) {
          throw new Error('Failed to create/update profile');
        }

        return true;
      }
    } catch (error) {
      console.error('Error creating/updating profile:', error);
      return false;
    }
  };

  // Handle start test
  const handleStartTest = async () => {
    try {
      // Create or update profile first
      const profileCreated = await handleCreateOrUpdateProfile();

      if (!profileCreated) {
        console.error('Failed to create/update profile');
        return;
      }

      // Get returnUrl from query parameters
      const returnUrl = router.query.returnUrl as string;
      if (userType === 'company') {
        router.push('/dashboard/company');
        return;
      }

      // If there's a returnUrl, go there
      if (returnUrl) {
        console.log('Redirecting to returnUrl:', returnUrl);
        const decodedUrl = decodeURIComponent(returnUrl);
        router.push(decodedUrl);
      } else {
        // For normal sign-in, go to test page with skills and levels
        router.push({
          pathname: '/interview',
          query: {
            type: 'on-boarding',
            skills: skills.join(','),
            experienceLevel: 'Entry Level', // Default experience level
            proficiencyLevels: Object.entries(proficiency)
              .filter(([skill]) => skills.includes(skill))
              .map(([skill, level]) => `${skill}:${level}`)
              .join(',')
          }
        });
      }
    } catch (error) {
      console.error('Error in handleStartTest:', error);
      setError('Failed to save preferences. Please try again.');
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
