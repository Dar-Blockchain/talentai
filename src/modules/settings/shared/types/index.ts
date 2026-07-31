export interface SettingsUserEntity {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  user_image?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export interface SettingsProfile {
  userId?: SettingsUserEntity;
  user_image?: string;
  type?: string;
  name?: string;
  email?: string;
  requiredExperienceLevel?: string;
  targetRole?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  timezone?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  location?: string;
  website?: string;
  industry?: string;
  size?: string;
  employmentType?: string;
  contactInformation?: {
    phone?: string;
    location?: string;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    personalWebsite?: string;
  };
  companyDetails?: {
    name?: string;
    email?: string;
    industry?: string;
    size?: string;
    employmentType?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    phone?: string;
    address?: string;
    personalWebsite?: string;
    requiredExperienceLevel?: string;
    language?: string;
  };

  quota?: number;
  skills?: unknown[] | null;
  softSkills?: unknown[] | null;
  planUsage?: unknown;
  isPublicProfile?: boolean;
  _id?: string;
}

export interface SettingsCompanyMembershipCompany {
  _id?: string;
  username?: string;
  email?: string;
  user_image?: string;
  profile?: SettingsProfile;
}

export interface SettingsCompanyMembership {
  _id?: string;
  role?: string;
  company?: SettingsCompanyMembershipCompany;
}

export interface ProfileApiResponse {
  user?: SettingsUserEntity;
  profile?: SettingsProfile;
  planLimits?: unknown;
  companyMembership?: SettingsCompanyMembership;
}

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
  linkedin?: string;
  website?: string;
  githubUrl?: string;
  personalWebsite?: string;
  location?: string;
  // Display-only fields
  avatar?: string;
  resume?: string;
  profileType?: 'Candidate' | 'Company';
  // Company-specific fields (all editable)
  companyName?: string;
  name?: string;
  industry?: string;
  companySize?: string;
  size?: string;
  employmentType?: string;
}
