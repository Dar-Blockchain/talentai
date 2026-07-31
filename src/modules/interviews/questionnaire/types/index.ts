export interface InterviewMessage {
  type: 'greeting' | 'question' | 'follow_up' | 'silence_prompt' | 'system';
  content: string;
  timestamp: string;
  sessionId?: string;
  reasoning?: string;
  nextFocus?: string;
}

export interface CoverageArea {
  area: string;
  percentage: number;
  indicators: Array<{
    name: string;
    covered: boolean;
    evidence: string[];
    quality: number;
  }>;
  weight: number;
  completed: boolean;
}

export interface Coverage {
  overall: number;
  areas: { [key: string]: CoverageArea };
  completedAreas: string[];
  nextRecommendedArea: string | null;
  lastUpdated: string;
}

export interface RealTimeReport {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  scores: { [key: string]: number };
  overallProgress: number;
  lastUpdated: string;
  aiInsights?: string[];
  trends?: string[];
}

export interface Question {
  id: string;
  text: string;
  skill: string;
  level: string;
}

export interface JobQuestionsResponse {
  jobId: string;
  requiredSkills: Array<{
    name: string;
    level: string;
  }>;
  questions: string[];
  totalQuestions: number;
  testedSkills: unknown[];
}

// Status types
export type InterviewStatus = 'idle' | 'connecting' | 'active' | 'paused' | 'ended';
export type ConnectionStatus = 'connecting' | 'connected' | 'error' | 'disconnected';
export type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
export type AgentState = 'idle' | 'thinking' | 'waiting' | 'processing' | 'ready';
export type SpeechPhase = 'reading' | 'thinking' | 'speaking' | 'paused' | 'complete';
export type AlertSeverity = 'success' | 'error' | 'warning' | 'info';
