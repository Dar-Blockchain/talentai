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

// ─── Cost settings (manual vs TalentAI comparison) ────────────────────────────

export interface CostSettings {
  currency:                 string;
  manualCostPerCandidate:   number;
  aiCostPerInterview:       number;
  interviewDurationMinutes: number;
}

export type UpdateCostSettingsPayload = Partial<CostSettings>;

// ─── API request / response types ─────────────────────────────────────────────

export interface UpdateProfilePayload {
  language?: string;
  targetRole?: string;
  companyDetails?: {
    name?: string;
    industry?: string;
    size?: string;
    employmentType?: string;
    location?: string;
    linkedin?: string;
    website?: string;
    phone?: string;
    address?: string;
    personalWebsite?: string;
  };
}
