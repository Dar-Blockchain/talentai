export interface WebinarQuestion {
  key: string;
  label_fr: string;
  label_en: string;
  type: "choice" | "scale" | "text" | "select" | "multiselect";
  options: { key: string; label_fr: string; label_en: string; score?: number }[];
  required: boolean;
  order: number;
}

/** Draft is structurally identical to a saved question; alias avoids duplication. */
export type WebinarQuestionDraft = WebinarQuestion;

export type WebinarProfileType = "staffing_bpo" | "enterprise_chro" | "referrer";
export type WebinarMaturityLevel = "beginner" | "explorer" | "practitioner" | "pioneer";
export type WebinarScoreCategory = "adoption" | "governance" | "quality" | "antifraud";
export type WebinarQualification = "hot" | "warm" | "cold";

export interface WebinarStats {
  total_registrations: number;
  total_completions: number;
  live_attendees: number;
  avg_score: number | null;
  maturity_breakdown: Record<string, number>;
  qualification_breakdown: Record<string, number>;
  segment_breakdown: Record<string, number>;
  utm_breakdown: Record<string, number>;
}

export interface Webinar {
  _id: string;
  title: string;
  title_fr: string;
  title_en: string;
  description: string;
  description_fr: string;
  description_en: string;
  date: string | null;
  end_date: string | null;
  status: "draft" | "active";
  lang: "fr" | "en" | "both";
  about_fr: string;
  about_en: string;
  webinar_link: string;
  booking_link: string;
  target_min: number;
  target_max: number;
  highlights: string[];
  highlights_fr: string[];
  highlights_en: string[];
  questions: WebinarQuestion[];
  stats: WebinarStats;
  created_by: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WebinarListResponse {
  data: Webinar[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WebinarScoringPoint {
  questionLabel: string | null;
  optionLabel: string | null;
  category: WebinarScoreCategory | null;
}

export interface WebinarScoringResult {
  subScores: Record<WebinarScoreCategory, number>;
  total48: number;
  total100: number;
  maturityLevel: WebinarMaturityLevel;
  strength: WebinarScoringPoint | null;
  vigilance: WebinarScoringPoint | null;
  qualification: { status: WebinarQualification; painSignal: boolean };
  routing: { script: "v1" | "v2" | null; recommend1on1: boolean; followUpTimeframe: string | null };
  key_insight?: string | null;
  main_pain?: string | null;
  recommended_action?: string | null;
}

export interface WebinarSubmission {
  _id: string;
  webinar_id: string;
  lang: string;
  consent: boolean;
  completed: boolean;
  contact: { nom: string | null; email: string | null; entreprise: string | null; profile_type: WebinarProfileType | null };
  answers: Record<string, unknown>;
  scoring?: WebinarScoringResult;
  source?: { utm_source: string | null; utm_campaign: string | null };
  createdAt: string;
}

export interface WebinarSubmissionsResponse {
  data: WebinarSubmission[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WebinarFormValues {
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  about_fr: string;
  about_en: string;
  webinar_link: string;
  /** Optional Calendly-style booking link for the participant's "book a 1:1" CTA. */
  booking_link: string;
  /** Working registrant-count target range, shown as a pacing bar on the
   * organizer overview. Defaults to 50–70. */
  target_min: number;
  target_max: number;
  /** Just the calendar day, "YYYY-MM-DD" — the actual start/end clock times
   * live in `start_time`/`end_time` below. */
  date: string;
  /** "HH:mm" — combined with `date` into the full start datetime on save. */
  start_time: string;
  /** "HH:mm" — combined with `date` into the full end datetime on save. */
  end_time: string;
  status: "draft" | "active";
  /** "" means not chosen yet — the New Webinar form has no preselected
   * language until the admin picks one on the Basics step. */
  lang: "" | "fr" | "en" | "both";
  highlights_fr: string[];
  highlights_en: string[];
  questions: WebinarQuestionDraft[];
}
