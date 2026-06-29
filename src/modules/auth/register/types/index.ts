export type UserType = "candidate" | "company";
import type { RegisterStep } from "@/modules/auth/shared/types";
export type { RegisterStep }; // re-exported for backwards compat

export interface CandidateFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface CompanyFormValues {
  name: string;
  email: string;
  industry: string;
  size: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface RegisterFormProps {
  onEmailChange?: (email: string) => void;
  onOtpReady?:   (email: string) => void;
}
