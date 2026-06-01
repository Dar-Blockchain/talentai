export type UserType = "candidate" | "company";
export type RegisterStep = 1 | 2;

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
