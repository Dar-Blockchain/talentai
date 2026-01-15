/**
 * Utility functions for fetching and managing user data
 */

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
  createdAt?: string;
  lastLogin?: string;
}

export interface ProfileData {
  _id: string;
  userId: any;
  type: 'Candidate' | 'Company';
  firstName?: string;
  lastName?: string;
  gender?: string;
  country?: string;
  language?: string;
  timezone?: string;
  avatar?: string;
  skills?: Array<{
    _id: string;
    name: string;
    proficiencyLevel: number;
    experienceLevel: string;
  }>;
  softSkills?: Array<{
    _id: string;
    name: string;
    category: string;
    experienceLevel: string;
    NumberTestPassed: number;
    ScoreTest: number;
  }>;
  requiredSkills?: string[];
  requiredExperienceLevel?: string;
  targetRole?: string;
  companyDetails?: {
    name: string;
    industry: string;
    size: string;
    location: string;
    logo?: string;
  };
  overallScore?: string;
  quota?: number;
  quotaUpdatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CombinedUserInfo {
  user: UserData;
  profile: ProfileData | null;
  displayName: string;
  displayEmail: string;
  displayAvatar: string;
  isCandidate: boolean;
  isCompany: boolean;
}

/**
 * Fetch user profile data from API
 */
export const fetchUserProfile = async (token: string): Promise<ProfileData | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    console.error('Failed to fetch profile:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Fetch user data from API
 */
export const fetchUserData = async (token: string): Promise<UserData | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    console.error('Failed to fetch user data:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};

/**
 * Get combined user information from Redux state and API
 */
export const getCombinedUserInfo = async (
  reduxUser: any,
  token: string
): Promise<CombinedUserInfo | null> => {
  try {
    // Fetch both profile and user data
    const [profile, userData] = await Promise.all([
      fetchUserProfile(token),
      fetchUserData(token)
    ]);

    if (!profile && !userData && !reduxUser) {
      return null;
    }

    // Extract user data from various sources
    const userId = profile?.userId || userData || reduxUser;
    const user: UserData = {
      id: userId?._id || userId?.id || reduxUser?.id || '',
      username: userId?.username || reduxUser?.username || '',
      email: userId?.email || reduxUser?.email || '',
      firstName: userId?.FirstName || userId?.firstName || profile?.firstName || '',
      lastName: userId?.LastName || userId?.lastName || profile?.lastName || '',
      avatar: userId?.avatar || profile?.avatar || '',
      role: userId?.role || reduxUser?.role || '',
      isVerified: userId?.isVerified || reduxUser?.isVerified || false,
      createdAt: userId?.createdAt || reduxUser?.createdAt || '',
      lastLogin: userId?.lastLogin || reduxUser?.lastLogin || '',
    };

    // Determine display values - check both property name variations
    // API returns FirstName/LastName (capitalized) but interface uses firstName/lastName
    const profileAny = profile as any;
    const displayName = (profile?.firstName || profileAny?.FirstName) && (profile?.lastName || profileAny?.LastName)
      ? `${profile.firstName || profileAny.FirstName} ${profile.lastName || profileAny.LastName}`
      : user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.username || 'User';

    const displayEmail = userId?.email || user.email || reduxUser?.email || '';

    const displayAvatar = profile?.avatar || user.avatar || '';

    const isCandidate = profile?.type === 'Candidate';
    const isCompany = profile?.type === 'Company';

    return {
      user,
      profile,
      displayName,
      displayEmail,
      displayAvatar,
      isCandidate,
      isCompany,
    };
  } catch (error) {
    console.error('Error getting combined user info:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  token: string,
  updates: Partial<ProfileData>
): Promise<{ success: boolean; data?: any; error?: string }> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateProfile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    }

    const errorData = await response.json().catch(() => ({ message: 'Failed to update profile' }));
    return { success: false, error: errorData.message };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message || 'An error occurred' };
  }
};

/**
 * Get user initials for avatar
 */
export const getUserInitials = (firstName?: string, lastName?: string, username?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (username) {
    const parts = username.split(' ');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  }
  return 'U';
};

/**
 * Format user stats for display
 */
export const formatUserStats = (profile: ProfileData | null) => {
  if (!profile) {
    return {
      skillsCount: 0,
      softSkillsCount: 0,
      overallScore: 'N/A',
      quota: 0,
      profileCompletion: 0,
    };
  }

  const skillsCount = profile.skills?.length || 0;
  const softSkillsCount = profile.softSkills?.length || 0;
  const overallScore = profile.overallScore || 'N/A';
  const quota = profile.quota || 0;

  // Calculate profile completion percentage
  let completedFields = 0;
  let totalFields = 10;

  if (profile.type) completedFields++;
  if (profile.firstName || profile.userId?.FirstName) completedFields++;
  if (profile.lastName || profile.userId?.LastName) completedFields++;
  if (profile.userId?.email) completedFields++;
  if (profile.gender) completedFields++;
  if (profile.country) completedFields++;
  if (profile.language) completedFields++;
  if (profile.timezone) completedFields++;
  if (skillsCount > 0) completedFields++;
  if (profile.targetRole || profile.companyDetails) completedFields++;

  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  return {
    skillsCount,
    softSkillsCount,
    overallScore,
    quota,
    profileCompletion,
  };
};
