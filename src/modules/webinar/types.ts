export type Lang = "fr" | "en";

export interface WebinarContact {
  nom:        string;
  email:      string;
  entreprise: string;
}

export interface WebinarScoring {
  maturite_ia:         number;
  intensite_pain:      number;
  readiness_score?:    number;
  icp_fit:             "ok" | "faible" | "hors";
  these:               "v1" | "v2" | "v3" | "indetermine";
  tier:                "A" | "B" | "C" | "D";
  key_insight?:        string | null;
  main_pain?:          string | null;
  recommended_action?: string | null;
  strengths?:          string[];
  blockers?:           string[];
}

export interface WebinarSubmission {
  _id:         string;
  webinar_id:  string;
  contact:     WebinarContact;
  answers:     Record<string, unknown>;
  scoring?:    WebinarScoring;
  completed:   boolean;
}
