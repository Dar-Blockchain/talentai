export interface WebinarQuestion {
  key: string;
  label_fr: string;
  label_en: string;
  type: "choice" | "scale" | "text" | "select";
  options: { key: string; label_fr: string; label_en: string }[];
  required: boolean;
  order: number;
}

export interface WebinarStats {
  total_registrations: number;
  total_completions: number;
  avg_maturite_ia: number | null;
  tier_breakdown: Record<string, number>;
}

export interface Webinar {
  _id: string;
  title: string;
  description: string;
  date: string | null;
  status: "draft" | "active" | "archived";
  lang: "fr" | "en" | "both";
  highlights: string[];
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

export interface WebinarSubmission {
  _id: string;
  webinar_id: string;
  lang: string;
  consent: boolean;
  completed: boolean;
  contact: { nom: string | null; email: string | null; entreprise: string | null };
  answers: Record<string, any>;
  scoring?: {
    maturite_ia: number;
    intensite_pain: number;
    tier: "A" | "B" | "C" | "D";
    icp_fit: string;
  };
  source?: { utm_source: string | null; utm_campaign: string | null };
  createdAt: string;
}

export interface WebinarSubmissionsResponse {
  data: WebinarSubmission[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WebinarQuestionDraft {
  key: string;
  label_fr: string;
  label_en: string;
  type: "choice" | "scale" | "text" | "select";
  options: { key: string; label_fr: string; label_en: string }[];
  required: boolean;
  order: number;
}

export interface WebinarFormValues {
  title: string;
  description: string;
  date: string;
  status: "draft" | "active" | "archived";
  lang: "fr" | "en" | "both";
  highlights: string[];
  questions: WebinarQuestionDraft[];
}
