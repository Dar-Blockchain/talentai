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
    requiredSkills?: string[];
    language?: string;
  };
  requiredSkills?: string[];
  quota?: number;
  skills?: any[] | null;
  softSkills?: any[] | null;
  planUsage?: any;
  isPublicProfile?: boolean;
  _id?: string;
}

export interface ProfileApiResponse {
  user?: any;
  profile?: any;
  planLimits?: any;
  companyMembership?: any;
}
