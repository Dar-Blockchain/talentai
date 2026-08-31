export type { CandidateApplication } from '@/modules/candidate/applications/types/application.types';

export interface SkillInterviewAssessment {
  _id: string;
  id?: string;
  skill: string;
  skillType?: 'technical' | 'soft';
  proficiency: string;
  candidateId?: any;
  interviewerId?: any;
  interviewData?: {
    finalReport?: {
      summary?: string;
      coverage?: {
        overall: number;
        areas?: Record<string, {
          percentage: number;
          indicators: Array<{ name: string; covered: boolean; evidence: string[]; quality: number }>;
          weight: number;
          depth?: string;
          completed: boolean;
        }>;
        completedAreas?: string[];
        nextRecommendedArea?: string | null;
        lastUpdated?: string;
      };
      recommendations?: string[];
      scores?: Record<string, number>;
      timestamp?: string;
    };
    analytics?: {
      duration?: number;
      messageCount?: number;
      silenceEvents?: number;
      coveragePercentage?: number;
      completedAreas?: number;
      totalAreas?: number;
      averageResponseLength?: number;
      interactionStyle?: string;
    };
    sessionId?: string;
    interviewType?: string;
    timestamp?: string;
  };
  exportedAt?: string;
  type?: string;
  role?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}
