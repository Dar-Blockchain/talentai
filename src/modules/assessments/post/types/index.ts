// ─── Target (passed by the parent to identify which assessment to load) ───────
export interface AssessmentTarget {
  applicationId: string;
  postId: string;
  candidateUserId: string;
  candidateName: string;
  candidateEmail: string;
  avatarUrl?: string;
  bgColor: string;
}

// ─── Conversation transcript ───────────────────────────────────────────────────
export interface ConversationTurn {
  question?: string;
  response?: string;
  targetArea?: string;
  timestamp?: string;
  evaluation?: {
    qualityScore?: number;
    answeredQuestion?: boolean;
    completeness?: string;
    depthLevel?: string;
  };
}

// ─── Per-area coverage data ────────────────────────────────────────────────────
export interface AreaData {
  percentage: number;
  weight: number;
  questionsAsked: number;
  completed: boolean;
  /** Indicator records are populated by the AI engine during the session */
  indicators: Array<{
    name?: string;
    covered?: boolean;
    evidence?: string[];
  }>;
}

// ─── Full assessment response ─────────────────────────────────────────────────
export interface PostAssessmentData {
  _id: string;
  createdAt: string;
  jobId: string | null;
  jobTitle: string | null;
  interviewType: string | null;

  /** Executive hire/no-hire verdict */
  verdict: {
    recommendation: 'hire' | 'maybe' | 'no_hire' | null;
    overallScore: number | null;
    reasoning: string | null;
  };

  /**
   * Component scores (0–100) as saved by the AI engine.
   * overall       = weighted composite
   * quality       = average per-turn response quality
   * coverage      = topic coverage percentage
   * skills        = must-have skills match rate
   * depth         = answer depth (surface/moderate/deep mapped to 0–100)
   * communication = communication style (confidence + verbosity)
   */
  scores: {
    overall: number | null;
    quality: number | null;
    coverage: number | null;
    skills: number | null;
    depth: number | null;
    communication: number | null;
  };

  /** Session-level metrics */
  analytics: {
    duration?: number;
    messageCount?: number;
    silenceEvents?: number;
    coveragePercentage?: number;
    completedAreas?: number;
    totalAreas?: number;
    averageResponseLength?: number;
    interactionStyle?: string;
  };

  /** Coverage breakdown per evaluated area */
  coverage: {
    overall: number | null;
    completedAreas: string[];
    nextRecommendedArea: string | null;
    areas: Record<string, AreaData>;
  };

  /** Qualitative AI assessment (narrative, patterns, decision support) */
  aiAssessment: {
    summary: string | null;
    /** Deterministic strengths from running-score accumulation during the session */
    strengths: string[];
    /** Deterministic weaknesses from running-score accumulation during the session */
    weaknesses: string[];
    /** Top 2-3 evidence-based factors that drove the hiring recommendation (LLM) */
    keyDecisionFactors: string[];
    /** Concrete concerns a hiring manager should know, even for a hire decision (LLM) */
    hiringRisks: string[];
    /** Role-specific development areas if the candidate is hired (LLM) */
    developmentAreas: string[];
    /** Derived from coverage percentages ≥ 70% */
    strongestAreas: string[];
    /** Derived from coverage percentages < 50% */
    weakestAreas: string[];
    /** Derived from incomplete areas with coverage < 60% */
    recommendedFocus: string[];
  };

  /** Which JD must-have skills were demonstrated vs missed */
  requiredSkills: {
    all: string[];
    demonstrated: string[];
    missed: string[];
  } | null;

  /** Per-session metrics: response count and questions asked per competency area */
  sessionMetrics: {
    totalResponses: number;
    questionsPerArea: Record<string, number>;
  } | null;

  /** Behavioural & style profile inferred by the AI */
  candidateProfile: {
    communicationStyle?: { verbosity?: string; confidenceLevel?: string };
    revealedExpertise?: string[];
    revealedGaps?: string[];
    difficultyLevel?: string;
  } | null;

  /** Whether a recruiter has reviewed this assessment */
  recruiterReview: {
    reviewed: boolean;
    feedback: string | null;
    reviewedAt: string | null;
  };

  conversation: ConversationTurn[];
}
