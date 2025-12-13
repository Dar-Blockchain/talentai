/**
 * Profile Settings Type Definitions
 */

export interface UserProfile {
  // Editable fields
  username: string;
  email: string;
  requiredExperienceLevel: string;
  targetRole: string;
  firstName: string;
  lastName: string;
  gender: string;
  country: string;
  language: string;
  timezone: string;
  // Contact Information fields
  phone?: string;
  address?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  location?: string;
  // Display-only fields
  avatar?: string;
  profileType?: 'Candidate' | 'Company';
  // Company-specific fields (all editable)
  companyName?: string;
  name?: string;
  industry?: string;
  companySize?: string;
  size?: string;
  employmentType?: string;
  requiredSkills?: string[];
}

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

export interface ProfileFormProps {
  profile: UserProfile;
  isEditing: boolean;
  loading: boolean;
  onInputChange: (field: keyof UserProfile, value: string) => void;
  onSelectChange: (event: any, field: keyof UserProfile) => void;
  onSave: () => void;
  onCancel: () => void;
}
