// ─── Application summary (list row) ──────────────────────────────────────────

export interface MatchBreakdownItem {
  key: string;
  label: string;
  score: number;
  maxScore: number;
  note: string;
}

export interface ApplicationSummaryItem {
  id: string;
  candidateUserId: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  userImage: string | null;
  matchScore: number | null;
  matchReasoning?: string | null;
  matchBreakdown?: MatchBreakdownItem[];
  interviewScore: number | null;
  appliedAt: string | null;
  completedAt: string | null;
  status: string;
  postId?: string | null;
  postTitle?: string | null;
  resumeFile?: string | null;
  recruiterDecision?: 'shortlisted' | 'rejected' | 'not_matched' | null;
  invitedAt?: string | null;
  belowThreshold?: boolean;
  /** Where the candidate said they saw the job post link. `detail` holds the free-text value when `type` is 'other'. */
  source?: { type: string; detail?: string | null } | null;
}

// ─── Everything below this line is currently unused (verified via grep — no
// imports outside this file) and appears to be leftover from an earlier
// version of the assessment page. Not cleaned up as part of this change;
// flagged so it doesn't look like it's wired to something it isn't. ─────────

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
  _id?: string;
  interviewData?: InterviewData;
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
  recruiterDecision?: "shortlisted" | "rejected" | "not_matched" | null;
  matchScore?: number;
  matchReasoning?: string;
  matchRecommendation?: string;
  matchBreakdown?: MatchBreakdownItem[];
  profile?: CandidateProfile;
  cvAnalysis?: CvAnalysis;
  interviewAssessment?: InterviewAssessment;
  post?: JobPost;
  company?: { _id?: string };
  /** Where the candidate said they saw the job post link. `detail` holds the free-text value when `type` is 'other'. */
  source?: { type: string; detail?: string | null } | null;
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
