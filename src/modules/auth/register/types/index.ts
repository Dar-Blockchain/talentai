export type UserType = "candidate" | "company";
// RegisterStep is defined in shared/types — re-exported here for backwards compat
export type { RegisterStep } from "@/modules/auth/shared/types";

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
  onStepChange?: (step: RegisterStep) => void;
  onEmailChange?: (email: string) => void;
}
