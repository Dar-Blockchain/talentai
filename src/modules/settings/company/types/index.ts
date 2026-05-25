export type { SettingsUserEntity, SettingsProfile, ProfileApiResponse } from '../../shared/types';

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
