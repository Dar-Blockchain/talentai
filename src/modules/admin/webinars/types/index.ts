export interface WebinarQuestion {
  key: string;
  label_fr: string;
  label_en: string;
  type: "choice" | "scale" | "text" | "select";
  options: { key: string; label_fr: string; label_en: string }[];
  required: boolean;
  order: number;
}

/** Draft is structurally identical to a saved question; alias avoids duplication. */
export type WebinarQuestionDraft = WebinarQuestion;

export interface WebinarStats {
  total_registrations: number;
  total_completions: number;
  avg_maturite_ia: number | null;
  tier_breakdown: Record<string, number>;
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

export interface WebinarScoringResult {
  maturite_ia: number;
  intensite_pain: number;
  readiness_score?: number;
  tier: "A" | "B" | "C" | "D";
  icp_fit: "ok" | "faible" | "hors";
  these?: "v1" | "v2" | "v3" | "indetermine";
  key_insight?: string | null;
  main_pain?: string | null;
  recommended_action?: string | null;
  strengths?: string[];
  blockers?: string[];
}

export interface WebinarSubmission {
  _id: string;
  webinar_id: string;
  lang: string;
  consent: boolean;
  completed: boolean;
  contact: { nom: string | null; email: string | null; entreprise: string | null };
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
  /** Just the calendar day, "YYYY-MM-DD" — the actual start/end clock times
   * live in `start_time`/`end_time` below. */
  date: string;
  /** "HH:mm" — combined with `date` into the full start datetime on save. */
  start_time: string;
  /** "HH:mm" — combined with `date` into the full end datetime on save. */
  end_time: string;
  status: "draft" | "active";
  lang: "fr" | "en" | "both";
  highlights_fr: string[];
  highlights_en: string[];
  questions: WebinarQuestionDraft[];
}
