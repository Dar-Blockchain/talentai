import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { SelectChangeEvent } from '@mui/material';
import { RootState, AppDispatch } from '@/store/store';
import { UserProfile } from '@/types/profile';
import {
  getMyProfile,
  updateProfile as updateProfileAction,
  updateCompanyProfile,
  uploadProfilePicture,
  setSaveSuccess,
  clearError
} from '@/store/slices/profileSlice';

const initialProfile: UserProfile = {
  username: '',
  email: '',
  requiredExperienceLevel: 'Mid Level',
  targetRole: '',
  firstName: '',
  lastName: '',
  gender: 'Male',
  country: 'Tunisia',
  language: 'English',
  timezone: 'UTC+01:00',
  phone: '',
  address: '',
  linkedinUrl: '',
  githubUrl: '',
  personalWebsite: '',
  location: '',
  avatar: '',
  profileType: 'Candidate',
  companyName: '',
  name: '',
  industry: '',
  companySize: '',
  size: '',
  employmentType: 'Remote',
  requiredSkills: [],
};

export const useProfileManagement = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile: reduxProfile, loading, error, uploadingImage, saveSuccess } = useSelector(
    (state: RootState) => state.profile
  );

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Handle tab parameter from URL query
  useEffect(() => {
    if (router.isReady && router.query.tab) {
      const tabParam = router.query.tab as string;
      if (['personal', 'contact', 'preferences', 'notifications'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [router.isReady, router.query.tab]);

  // Load user profile data
  useEffect(() => {
    console.log(user, 'user')
    if (!user) {
      router.push('/signin');
      return;
    }
    dispatch(getMyProfile());
  }, [user, router, dispatch]);

  // Update local profile state when Redux profile changes
  useEffect(() => {
    if (reduxProfile) {
      const userData = reduxProfile.userId;

      // Construct avatar URL
      let avatarUrl = '';
      if (reduxProfile.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${reduxProfile.user_image}`;
      } else if (userData?.user_image) {
        avatarUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}images/Users/${userData.user_image}`;
      }

      setProfile({
        username: userData?.username || user.username || '',
        email: userData?.email || user.email || reduxProfile.companyDetails?.email || '',
        requiredExperienceLevel: reduxProfile.requiredExperienceLevel || reduxProfile.companyDetails?.requiredExperienceLevel || 'Mid Level',
        targetRole: reduxProfile.targetRole || '',
        firstName: reduxProfile.firstName || user.username?.split(' ')[0] || '',
        lastName: reduxProfile.lastName || user.username?.split(' ')[1] || '',
        gender: reduxProfile.gender || 'Male',
        country: reduxProfile.country || reduxProfile.companyDetails?.location || 'Tunisia',
        language: reduxProfile.language || 'English',
        timezone: reduxProfile.timezone || 'UTC+01:00',
        phone: reduxProfile.contactInformation?.phone || '',
        address: reduxProfile.contactInformation?.address || '',
        linkedinUrl: reduxProfile.contactInformation?.linkedinUrl || '',
        githubUrl: reduxProfile.contactInformation?.githubUrl || '',
        personalWebsite: reduxProfile.contactInformation?.personalWebsite || '',
        location: reduxProfile.contactInformation?.location || reduxProfile.companyDetails?.location || '',
        avatar: avatarUrl,
        profileType: (reduxProfile.type === 'Company' ? 'Company' : 'Candidate') as 'Candidate' | 'Company',
        companyName: reduxProfile.companyDetails?.name || '',
        name: reduxProfile.companyDetails?.name || '',
        industry: reduxProfile.companyDetails?.industry || '',
        companySize: reduxProfile.companyDetails?.size || '',
        size: reduxProfile.companyDetails?.size || '',
        employmentType: reduxProfile.companyDetails?.employmentType || 'Remote',
        requiredSkills: reduxProfile.companyDetails?.requiredSkills || reduxProfile.requiredSkills || [],
      });
    }
  }, [reduxProfile, user]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        dispatch(setSaveSuccess(false));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [saveSuccess, dispatch]);

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>, field: keyof UserProfile) => {
    setProfile(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      await dispatch(uploadProfilePicture(file)).unwrap();
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('Error uploading profile picture:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const updatePayload: any = {};

      // Fields for all users
      if (profile.username?.trim()) {
        updatePayload.username = profile.username.trim();
      }

      // Only include these fields for Candidates
      if (profile.profileType === 'Candidate') {
        if (profile.email?.trim()) {
          updatePayload.email = profile.email.trim();
        }
        if (profile.requiredExperienceLevel) {
          updatePayload.requiredExperienceLevel = profile.requiredExperienceLevel;
        }
        if (profile.targetRole?.trim()) {
          updatePayload.targetRole = profile.targetRole.trim();
        }
        if (profile.firstName?.trim()) {
          updatePayload.firstName = profile.firstName.trim();
        }
        if (profile.lastName?.trim()) {
          updatePayload.lastName = profile.lastName.trim();
        }
        if (profile.gender) {
          updatePayload.gender = profile.gender;
        }
        if (profile.country) {
          updatePayload.country = profile.country;
        }
        if (profile.language) {
          updatePayload.language = profile.language;
        }
        if (profile.timezone) {
          updatePayload.timezone = profile.timezone;
        }

        // Contact Information for Candidates
        if (activeTab === 'contact' || profile.phone || profile.address || profile.linkedinUrl || profile.githubUrl || profile.personalWebsite || profile.location) {
          updatePayload.contactInformation = {
            email: profile.email?.trim() || '',
            phone: profile.phone?.trim() || '',
            address: profile.address?.trim() || '',
            linkedinUrl: profile.linkedinUrl?.trim() || '',
            githubUrl: profile.githubUrl?.trim() || '',
            personalWebsite: profile.personalWebsite?.trim() || '',
            location: profile.location?.trim() || '',
          };
        }
      }

      // For Companies
      if (profile.profileType === 'Company') {
        if (activeTab === 'personal') {
          const companyPayload = {
            name: profile.name?.trim() || profile.companyName?.trim() || '',
            industry: profile.industry || '',
            size: profile.size || profile.companySize || '',
            location: profile.location?.trim() || '',
            email: profile.email?.trim() || '',
            employmentType: profile.employmentType || 'Remote',
            requiredExperienceLevel: profile.requiredExperienceLevel || 'Mid Level',
          };

          await dispatch(updateCompanyProfile(companyPayload)).unwrap();
          setIsEditing(false);
          await dispatch(getMyProfile());
          return;
        } else if (activeTab === 'contact') {
          updatePayload.contactInformation = {
            email: profile.email?.trim() || '',
            phone: profile.phone?.trim() || '',
            address: profile.address?.trim() || '',
            linkedinUrl: profile.linkedinUrl?.trim() || '',
            personalWebsite: profile.personalWebsite?.trim() || '',
            location: profile.location?.trim() || '',
          };
        }
      }

      // Check if we have at least one field to update
      if (Object.keys(updatePayload).length === 0) {
        alert('Please fill in at least one field to update');
        return;
      }

      await dispatch(updateProfileAction(updatePayload)).unwrap();
      setIsEditing(false);
      await dispatch(getMyProfile());
    } catch (err: any) {
      console.error('Error saving profile:', err);
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleDismissSuccess = () => {
    dispatch(setSaveSuccess(false));
  };

  return {
    // State
    activeTab,
    isEditing,
    profile,
    loading,
    error,
    uploadingImage,
    saveSuccess,
    userId: reduxProfile?.userId?._id,

    // Actions
    setActiveTab,
    setIsEditing,
    handleInputChange,
    handleSelectChange,
    handleImageUpload,
    handleSaveProfile,
    handleDismissError,
    handleDismissSuccess,
  };
};
