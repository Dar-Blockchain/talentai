// Generic hook types (socket, timer, camera, audio, security)
export * from '../../shared/types/hooks';

// Post-interview specific hook types
import type { InterviewConfig } from '../../shared/types/interview';
import type { JobPost } from './api';

export interface UseInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  jobData: JobPost | null;
  isJobLoading: boolean;
  isConfigLoading: boolean;
}

export interface UseInterviewConfigOptions {
  showNotification: (message: string, severity: 'error' | 'warning' | 'info') => void;
}
