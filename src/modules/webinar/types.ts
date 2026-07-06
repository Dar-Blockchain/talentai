export type Lang = "fr" | "en";

export type Role     = "rh" | "dirigeant" | "manager" | "cabinet" | "autre";
export type Secteur  = "industrie" | "services" | "tech" | "banque" | "telecom" | "retail" | "cabinet" | "bpo" | "public" | "autre";
export type Volume   = "lt10" | "10_50" | "50_200" | "gt200";
export type UsageIA  = "jamais" | "curieux" | "ponctuel" | "integre";
export type Frein    = "biais" | "conformite" | "experience" | "qualite" | "cout" | "aucun";
export type Etape    = "sourcing" | "tri" | "entretiens" | "decision" | "delais" | "casting" | "fraude";
export type TTH      = "lt2s" | "2_4s" | "1_2m" | "gt2m";
export type Intention= "non" | "peut_etre" | "oui";
export type Attente  = "enjeux" | "cas" | "evaluer" | "autre";

export interface WebinarAnswers {
  role?:                    Role;
  secteur?:                 Secteur;
  volume?:                  Volume;
  pays?:                    string;
  usage_ia?:                UsageIA;
  frein?:                   Frein;
  legitimite_entretien_ia?: number;
  etape_douloureuse?:       Etape;
  time_to_hire?:            TTH;
  verbatim?:                string;
  intention?:               Intention;
  attente?:                 Attente;
}

export interface WebinarContact {
  nom:        string;
  email:      string;
  entreprise: string;
}

export interface WebinarScoring {
  maturite_ia:        number;
  intensite_pain:     number;
  readiness_score?:   number;
  icp_fit:            "ok" | "faible" | "hors";
  these:              "v1" | "v2" | "v3" | "indetermine";
  tier:               "A" | "B" | "C" | "D";
  key_insight?:       string | null;
  main_pain?:         string | null;
  recommended_action?: string | null;
  strengths?:         string[];
  blockers?:          string[];
}

export interface WebinarSubmission {
  _id:         string;
  webinar_id:  string;
  contact:     WebinarContact;
  answers:     WebinarAnswers;
  scoring?:    WebinarScoring;
  completed:   boolean;
}

// Step IDs in order
export type StepId =
  | "consent"
  | "q1_role"
  | "q2_secteur"
  | "q3_volume"
  | "q4_pays"
  | "q5_usage_ia"
  | "q6_frein"
  | "q7_legitimite"
  | "q8_etape"
  | "q9_tth"
  | "q10_verbatim"
  | "q11_intention"
  | "q12_attente"
  | "snapshot";
