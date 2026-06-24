export type ApplicationStatus =
  | 'applied' | 'pending' | 'shortlisted' | 'accepted' | 'rejected'
  | 'withdrawn' | 'interview_scheduled' | 'interview_completed' | 'viewed' | 'visited';

export interface ApplicationJobDetails {
  title?: string;
  location?: string;
  salary?: { min?: number; max?: number; currency?: string };
  employmentType?: string;
  workMode?: string;
  description?: string;
  requirements?: string[];
}

export interface ApplicationCompany {
  _id?: string;
  companyName?: string;
  logo?: string;
}

export interface CandidateApplication {
  _id: string;
  status: ApplicationStatus;
  matchScore?: number | null;
  appliedAt?: string;
  createdAt?: string;
  post?: { _id?: string; jobDetails?: ApplicationJobDetails };
  company?: ApplicationCompany;
  interviewDate?: string;
  interviewTime?: string;
  interviewLink?: string;
}

export interface ApplicationsPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface CandidateStats {
  totalApplications: number;
  totalInterviews: number;
  statusCounts: Record<string, number>;
}

export interface ApplicationsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}
