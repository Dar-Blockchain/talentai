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

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  location?: UserLocation;
  signal?: AbortSignal;
}

// ─── API responses ────────────────────────────────────────────────────────────

export interface VerifyOtpResponse {
  // token is no longer sent in the response body — the JWT is delivered via
  // an httpOnly cookie set by the server. This field is kept optional to
  // avoid breaking callers during the transition.
  token?: string;
  user: AuthUser;
  profile: AuthProfile;
  planLimits?: unknown;
  companyMembership?: unknown;
}

// ─── /auth/me response ────────────────────────────────────────────────────────

export interface MeResponse {
  success: boolean;
  user:    AuthUser;
  profile: AuthProfile | null;
}

// ─── UI constants ─────────────────────────────────────────────────────────────

export const ACCENT          = "#0D9488";
export const ACCENT2         = "#059669";
export const OTP_CODE_LENGTH = 6;
export const OTP_TTL         = 300;

export type RegisterStep = 1 | 2;
