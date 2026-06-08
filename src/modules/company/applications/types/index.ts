// ─── CV / Profile shapes ──────────────────────────────────────────────────────

export interface Experience {
  title?: string;
  role?: string;
  position?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  description?: string;
}

export interface Education {
  degree?: string;
  institution?: string;
  field?: string;
  year?: string;
}

export interface Project {
  name: string;
  description?: string;
  technologies?: string[];
}

export interface SoftSkill {
  name: string;
}

export interface CvAnalysis {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  title?: string;
  summary?: string;
  analysisScore?: number;
  sourceUrl?: string;
  skills?: string[];
  softSkills?: SoftSkill[];
  experience?: Experience[];
  education?: Education[];
  certifications?: string[];
  projects?: Project[];
}

export interface CandidateProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  resume?: string;
  skills?: { name: string }[];
  softSkills?: SoftSkill[];
  contactInformation?: { email?: string; location?: string };
  userId?: { email?: string };
}

// ─── Interview shapes ─────────────────────────────────────────────────────────

export interface CoverageIndicator {
  name: string;
  covered?: boolean;
  evidence?: string[];
}

export interface CoverageArea {
  percentage?: number;
  indicators?: CoverageIndicator[];
}

export interface FinalReport {
  summary?: string;
  recommendations?: string[];
  scores?: { overall?: number };
  coverage?: { areas?: Record<string, CoverageArea> };
}

export interface InterviewAnalytics {
  duration?: number;
  messageCount?: number;
  coveragePercentage?: number;
}

export interface InterviewData {
  finalReport?: FinalReport;
  analytics?: InterviewAnalytics;
}

export interface InterviewAssessment {
  interviewData?: InterviewData;
}

// ─── Match breakdown ──────────────────────────────────────────────────────────

export interface MatchBreakdownItem {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  note: string;
}

// ─── Job post ─────────────────────────────────────────────────────────────────

export interface JobPost {
  _id?: string;
  user?: string;
  jobDetails?: { title?: string };
  skillAnalysis?: { requiredSkills?: { name: string }[] };
}

// ─── Full application detail ──────────────────────────────────────────────────

export interface ApplicationDetail {
  _id: string;
  status?: string;
  appliedAt?: string;
  createdAt?: string;
  invitedAt?: string;
  recruiterDecision?: "shortlisted" | "rejected" | null;
  matchScore?: number;
  matchReasoning?: string;
  matchRecommendation?: string;
  matchBreakdown?: MatchBreakdownItem[];
  profile?: CandidateProfile;
  cvAnalysis?: CvAnalysis;
  interviewAssessment?: InterviewAssessment;
  post?: JobPost;
  company?: { _id?: string };
}

// ─── Derived candidate data (pre-computed in hook) ────────────────────────────

export interface CandidateDerived {
  name: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
  skills: string[];
  softSkills: SoftSkill[];
  experience: Experience[];
  education: Education[];
  certifications: string[];
  projects: Project[];
  cvScore: number | null;
  matchReasoning: string;
  matchLabel: string;
  breakdown: MatchBreakdownItem[];
  postTitle: string;
  status: string;
  cvUrl: string | null;
  interviewScore: number | null;
  interviewAnalytics: InterviewAnalytics;
  finalReport: FinalReport;
  coverageAreas: Record<string, CoverageArea>;
  hasCoverage: boolean;
  hasReport: boolean;
}
