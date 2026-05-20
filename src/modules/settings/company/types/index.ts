// ─── API Key ──────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  serviceName: string;
  key?: string;
  keyPreview?: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  ipWhitelist?: string[];
}

export type CreateApiKeyPayload = {
  name: string;
  serviceName: string;
  scopes: string[];
  rateLimit: number;
  expiresAt: string;
  ipWhitelist?: string[];
};

export type UpdateApiKeyPayload = Partial<
  Pick<ApiKey, 'name' | 'serviceName' | 'scopes' | 'rateLimit' | 'expiresAt' | 'ipWhitelist'>
>;

// ─── User entity returned from the API ────────────────────────────────────────

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

// ─── Profile shape returned from the API ──────────────────────────────────────

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

// ─── Redux state shape ────────────────────────────────────────────────────────

export interface SettingsState {
  user:              SettingsUserEntity | null;
  profile:           SettingsProfile    | null;
  companyMembership: any | null;
  planLimits:        any | null;
  loading:           boolean;
  error:             string | null;
}

// ─── API request / response types ─────────────────────────────────────────────

export interface UpdateProfilePayload {
  name?: string;
  industry?: string;
  size?: string;
  employmentType?: string;
  language?: string;
  requiredSkills?: string[];
  requiredExperienceLevel?: string;
  targetRole?: string;
  companyDetails?: {
    location?: string;
    linkedin?: string;
    website?: string;
    phone?: string;
    address?: string;
    personalWebsite?: string;
  };
}

export interface ProfileApiResponse {
  user?: any;
  profile?: any;
  planLimits?: any;
  companyMembership?: any;
}
