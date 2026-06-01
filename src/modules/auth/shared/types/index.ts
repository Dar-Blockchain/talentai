// ─── Primitives ───────────────────────────────────────────────────────────────

export type UserRole = "Candidate" | "Company" | "Employee" | "Admin";

export interface AuthUser {
  _id: string;
  id?: string;
  email: string;
  role: UserRole;
  username?: string;
  user_image?: string;
}

export interface AuthProfile {
  _id: string;
  companyDetails?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface UserLocation {
  country?: string;
  city?: string;
  ip?: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface RegisterPayload {
  roleType: "Candidate" | "Company";
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  name?: string;
  companyDetails?: {
    industry: string;
    size: string;
    location: string;
    website?: string;
    linkedin?: string;
  };
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  location?: UserLocation;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface VerifyOtpResponse {
  token: string;
  user: AuthUser;
  profile: AuthProfile;
  planLimits?: unknown;
  companyMembership?: unknown;
}

// ─── UI constants ─────────────────────────────────────────────────────────────

export const ACCENT          = "#0D9488";
export const ACCENT2         = "#059669";
export const OTP_CODE_LENGTH = 6;
export const OTP_TTL         = 300;

export type OtpStep      = 1 | 2;
export type RegisterStep = 1 | 2;
