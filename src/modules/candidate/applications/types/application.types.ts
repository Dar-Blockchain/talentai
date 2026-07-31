export type ApplicationStatus = 'visited' | 'interview_completed' | 'withdrawn';

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

export interface CandidateApplicationDetail extends CandidateApplication {
  cvAnalysis?: { analysisScore?: number };
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

export type SortBy = 'date_desc' | 'date_asc' | 'score_desc' | 'score_asc';

export interface ApplicationsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: SortBy;
  scoreMin?: number;
  scoreMax?: number;
  dateFrom?: string;
  dateTo?: string;
}
