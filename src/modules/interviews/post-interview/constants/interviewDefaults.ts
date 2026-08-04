import { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_MODELS } from '../../shared/constants/interviewDefaults';

export const DEFAULT_INTERVIEW_CONFIG: InterviewConfig = {
  interviewType: 'HR_INTERVIEW',
  testReason: '',
  context: {
    targetCompany: '',
    targetRole: '',
    experienceLevel: 'Mid-Level',
    interviewGoal: 'Assess behavioral competencies and cultural fit',
  },
  models: DEFAULT_MODELS,
  sessionSettings: {
    duration: 30,
    language: 'en',
    difficulty: 'intermediate',
    silenceTimeout: 5,
    silenceIntelligence: {
      adaptiveMode: true,
      contextualAdjustments: true,
    },
  },
};
