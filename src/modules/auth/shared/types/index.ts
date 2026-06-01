export interface AuthUser {
  _id: string;
  id?: string;
  email: string;
  role: "Candidate" | "Company" | "Employee" | "Admin";
  username?: string;
  user_image?: string;
}

export interface AuthProfile {
  _id: string;
  [key: string]: any;
}

export interface VerifyOtpResponse {
  token: string;
  user: AuthUser;
  profile: AuthProfile;
  planLimits?: any;
  companyMembership?: any;
}

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

// Shared across register + signin
export type OtpStep = 1 | 2;

export const ACCENT = "#0D9488";
export const ACCENT2 = "#059669";
export const OTP_CODE_LENGTH = 6;
export const OTP_TTL = 300;
