// ── Filter ─────────────────────────────────────────────────────────────────────

export interface KpiFilterParams {
  postId?:   string;
  dateFrom?: string;
}

export interface KpiPostOption {
  id:    string;
  title: string;
}

// ── Application history ───────────────────────────────────────────────────────

export interface ApplicationHistoryItem {
  id:                   string;
  firstName:            string;
  lastName:             string;
  postTitle:            string;
  status:               "applied" | "invited" | "completed" | "shortlisted" | "rejected" | "not_matched";
  matchScore:           number | null;
  matchThreshold:       number;
  interviewScore:       number | null;
  date:                 string;
  hasInterview:         boolean;
  candidateUserId:      string | null;
}

export type ApplicationHistoryData = ApplicationHistoryItem[];

export interface ApplicationHistoryParams extends KpiFilterParams {
  page?:  number;
  limit?: number;
}

export interface ApplicationHistoryResult {
  data:       ApplicationHistoryItem[];
  pagination: { currentPage: number; totalPages: number; totalCount: number; limit: number; hasNextPage: boolean; hasPrevPage: boolean };
}

// ── Posts status ───────────────────────────────────────────────────────────────

export interface PostStatusRow {
  id:                  string;
  title:               string;
  jobStatus:           "draft" | "published";
  matched:             number;
  shortlisted:         number;
  rejected:            number;
  completedInterviews: number;
  totalApplicants:     number;
  coverage:            number;
  deadline:            number | null;
}

export type PostsSortColumn = "jobStatus" | "matched" | "completed" | "decision" | "deadline";

export interface PostsStatusParams extends KpiFilterParams {
  page?:    number;
  limit?:   number;
  sortBy?:  PostsSortColumn;
  sortDir?: "asc" | "desc";
}

export interface PostsStatusResult {
  data:       PostStatusRow[];
  pagination: { currentPage: number; totalPages: number; totalCount: number };
}

// ── Funnel ─────────────────────────────────────────────────────────────────────

export interface FunnelTrendPoint {
  month:       string;
  applied:     number;
  completed:   number;
  shortlisted: number;
}

export interface KpiFunnelData {
  applied:     number;
  invited:     number;
  completed:   number;
  shortlisted: number;
  trend:       FunnelTrendPoint[];
}

// ── Jobs by department ────────────────────────────────────────────────────────

export interface KpiDepartmentRow {
  departmentId: string;
  name:         string;
  count:        number;
}

export type KpiDepartmentData = KpiDepartmentRow[];

// ── Sourcing / Candidate quality ───────────────────────────────────────────────

export interface SourcingCandidate {
  rank:          number;
  applicationId: string;
  firstName:     string;
  lastName:      string;
  postTitle:     string;
  score:         number | null;
  matchScore:    number | null;
  status:        "shortlisted" | "completed";
}

export interface SourcingByPost {
  label: string;
  score: number;
  color: string;
}

export interface KpiSourcingData {
  avgCurrent: number | null;
  avgDelta:   number | null;
  byPost:     SourcingByPost[];
  top10:      SourcingCandidate[];
}

// ── ROI ────────────────────────────────────────────────────────────────────────

export interface RoiTrendPoint {
  month: string;
  tth:   number | null;
}

export interface KpiRoiData {
  savedHours:          number | null;
  completedInterviews: number | null;
  subscriptionCost:    number | null;
  costPerHire:         number | null;
  costPerShortlisted:  number | null;
  shortlisted:         number | null;
  trend:               RoiTrendPoint[];
}

// ── Manual vs TalentAI hours ────────────────────────────────────────────────────

export interface HoursTrendPoint {
  month:               string;
  cvsAnalyzed:         number;
  interviewsCompleted: number;
  manualHours:         number;
  aiHours:             number;
}

export interface KpiHoursComparisonData {
  trend:                    HoursTrendPoint[];
  interviewDurationMinutes: number;
}

export type TrendRangeUnit = "day" | "month";

export interface HoursComparisonParams {
  postId?: string;
  unit?:   TrendRangeUnit;
  value?:  number;
}

// ── Manual vs TalentAI cost ──────────────────────────────────────────────────────

export interface CostTrendPoint {
  month:               string;
  cvsAnalyzed:         number;
  interviewsCompleted: number;
  manualCost:          number;
  aiCost:              number;
  costSaved:           number;
  gapPercent:          number | null;
}

export interface KpiCostComparisonData {
  trend:                    CostTrendPoint[];
  currency:                 string;
  manualCostPerCandidate:   number;
  aiCostPerInterview:       number;
  blendedHourlyRate:        number;
  interviewDurationMinutes: number;
}

export interface CostComparisonParams {
  postId?: string;
  unit?:   TrendRangeUnit;
  value?:  number;
}
