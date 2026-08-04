export interface JobDetails {
  title?: string;
  location?: string;
  employmentType?: string;
  workMode?: string;
  description?: string;
  requirements?: string[];
  salary?: { min?: number; max?: number; currency?: string } | null;
}

export interface ApplicationDetail {
  _id: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
  interviewDate?: string | null;
  interviewTime?: string | null;
  interviewLink?: string | null;
  matchScore?: number;
  cvAnalysis?: { analysisScore?: number };
  post?: { jobDetails?: JobDetails };
}
