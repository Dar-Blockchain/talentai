export interface SkillScore {
  skill: string;
  score: number;
  level: string;
  strengths: string[];
  improvements: string[];
}

export interface InterviewAnalysis {
  overallScore: number;
  overallLevel: string;
  interviewType: string;
  duration: number;
  completedAt: string;
  skillScores: SkillScore[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  feedback: string;
  conversationQuality: {
    clarity: number;
    relevance: number;
    depth: number;
    engagement: number;
  };
  coverage: {
    [key: string]: any;
  };
}

export interface RewardInfo {
  success: boolean;
  amount?: number;
  transactionId?: string;
  canRetry?: boolean;
  error?: string;
  interviewId?: string;
}
