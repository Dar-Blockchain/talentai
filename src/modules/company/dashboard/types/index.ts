// ── Filter ─────────────────────────────────────────────────────────────────────

export interface KpiFilterParams {
  postId?:   string;
  dateFrom?: string;
}

export interface KpiPostOption {
  id:    string;
  title: string;
}

// ── Actions ────────────────────────────────────────────────────────────────────

export interface KpiActionsData {
  pendingShortlists: number;
  unreviewed:        number;
  unreviewedUrgent:  number;
  noshows:           number;
  postsInAlert:      number;
}

// ── Posts status ───────────────────────────────────────────────────────────────

export interface PostStatusRow {
  id:          string;
  title:       string;
  shortlisted: number;
  velocity:    number | null;
  coverage:    number;
  deadline:    number | null;
}

export interface PostsStatusParams extends KpiFilterParams {
  page?:  number;
  limit?: number;
}

export interface PostsStatusResult {
  data:       PostStatusRow[];
  pagination: { currentPage: number; totalPages: number; totalCount: number };
}

// ── Funnel ─────────────────────────────────────────────────────────────────────

export interface KpiFunnelData {
  applied:     number;
  invited:     number;
  completed:   number;
  shortlisted: number;
}

// ── Velocity ───────────────────────────────────────────────────────────────────

export interface VelocityTrendPoint {
  period: string;
  tts:    number | null;
  tth:    number | null;
}

export interface KpiVelocityData {
  tts:      number | null;
  ttsDelta: number | null;
  tth:      number | null;
  tthDelta: number | null;
  trend:    VelocityTrendPoint[];
}

// ── Sourcing / Candidate quality ───────────────────────────────────────────────

export interface SourcingCandidate {
  rank:      number;
  firstName: string;
  lastName:  string;
  postTitle: string;
  score:     number | null;
  status:    "shortlisted" | "completed";
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
