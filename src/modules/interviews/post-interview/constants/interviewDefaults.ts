import { InterviewConfig } from '../types/interview';

export const DEFAULT_INTERVIEW_CONFIG: InterviewConfig = {
  interviewType: 'HR_INTERVIEW',
  testReason: '',
  context: {
    targetCompany: '',
    targetRole: '',
    experienceLevel: 'Mid-Level',
    interviewGoal: 'Assess behavioral competencies and cultural fit',
  },
  models: {
    fastModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    thinkingModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    analysisModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  },
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
