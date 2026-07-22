export type Lang = "fr" | "en";

export type WebinarProfileType = "staffing_bpo" | "enterprise_chro" | "referrer";

export interface WebinarContact {
  nom: string;
  email: string;
  entreprise: string;
  profile_type?: WebinarProfileType | "";
}

export type WebinarMaturityLevel = "beginner" | "explorer" | "practitioner" | "pioneer";
export type WebinarScoreCategory = "adoption" | "governance" | "quality" | "antifraud";

export interface WebinarScoringPoint {
  questionLabel: string;
  optionLabel: string;
  category: WebinarScoreCategory;
}

/** Participant-facing subset only — "a few numbers, not an audit". The fuller
 * organizer shape (qualification/routing/AI notes) lives in the admin module. */
export interface WebinarScoring {
  subScores: Record<WebinarScoreCategory, number>;
  total48: number;
  total100: number;
  maturityLevel: WebinarMaturityLevel;
  strength: WebinarScoringPoint | null;
  vigilance: WebinarScoringPoint | null;
}

export interface WebinarSubmission {
  _id: string;
  webinar_id: string;
  contact: WebinarContact;
  answers: Record<string, unknown>;
  scoring?: WebinarScoring;
  completed: boolean;
}

export interface WebinarQuestionOption {
  key: string;
  label_fr: string;
  label_en: string;
}

export interface WebinarQuestion {
  key: string;
  order: number;
  type: "choice" | "scale" | "text" | "select" | "multiselect";
  label_fr: string;
  label_en: string;
  options: WebinarQuestionOption[];
  required: boolean;
}

export interface WebinarStats {
  total_registrations?: number;
}

export interface WebinarData {
  _id: string;
  title: string;
  title_fr?: string;
  title_en?: string;
  description?: string;
  description_fr?: string;
  description_en?: string;
  about_fr?: string;
  about_en?: string;
  date?: string;
  end_date?: string;
  questions: WebinarQuestion[];
  lang: string;
  stats?: WebinarStats;
  highlights?: string[];
  highlights_enabled?: boolean;
  webinar_link?: string;
  booking_link?: string;
  status?: "draft" | "active";
}
