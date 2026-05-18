import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { InterviewConfig } from '../types/interview';
import { type JobPost, type PipelineProgress } from '../types/api';
import { buildInterviewConfigFromURL, URLParams } from '@/utils/interviewConfigBuilder';
import { getToken } from '@/utils/tokenUtils';
import { useJobPostQuery } from '../queries/useJobPostQuery';
import { usePipelineProgressQuery } from '../queries/usePipelineProgressQuery';
import { useInterviewConfigQuery } from '../queries/useInterviewConfigQuery';

export interface UseInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  isPipelineJob: boolean;
  candidateProgress: PipelineProgress | null;
  currentPipelineStep: number | null;
  pipelineLoading: boolean;
  showBlockedModal: boolean;
  showFailedModal: boolean;
  blockMessage: string;
  jobData: JobPost | null;
}

export interface UseInterviewConfigOptions {
  showNotification: (message: string, severity: 'error' | 'warning' | 'info') => void;
}

const DEFAULT_CONFIG: InterviewConfig = {
  interviewType: 'HR_INTERVIEW',
  testReason: 'Preparing for software engineer behavioral interview',
  context: {
    targetCompany: 'Google',
    targetRole: 'Software Engineer',
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
      enabled: true,
      adaptiveThresholds: true,
      maxSilencePrompts: 3,
      naturalPauseDetection: true,
      contextAwareThresholds: true,
    },
  },
};

export const useInterviewConfig = ({ showNotification }: UseInterviewConfigOptions): UseInterviewConfigReturn => {
  const router   = useRouter();
  const authUser = useSelector((state: RootState) => state.user.connectedUser.user);
  const profile  = useSelector((state: RootState) => state.user.connectedUser.profile);
  const jobId = router.isReady && typeof router.query.jobId === 'string'
    ? router.query.jobId
    : null;

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);
  const [blockMessage]                         = useState('');

  // ── 1. Fetch job post ────────────────────────────────────────────────────────
  const {
    data: jobData,
    isLoading: postLoading,
  } = useJobPostQuery(jobId);

  const isPipelineJob = jobData?.creationType === 'pipeline';
  const candidateId   = profile?.userId?._id || profile?.userId || authUser?._id;

  // ── 2a. Pipeline: progress (with auto-initialize on 404) ────────────────────
  const {
    data: progressData,
    isLoading: progressLoading,
  } = usePipelineProgressQuery(
    isPipelineJob && candidateId ? String(candidateId) : null,
    isPipelineJob ? jobId : null,
  );

  // ── 2b. Regular: interview config (requires auth) ───────────────────────────
  const {
    data: configData,
    error: configError,
    isLoading: configLoading,
  } = useInterviewConfigQuery(
    !isPipelineJob && !!jobData && !!getToken() ? jobId : null,
  );

  // ── Notify on config fetch error ─────────────────────────────────────────────
  useEffect(() => {
    if (configError) showNotification('Failed to load interview configuration', 'error');
  }, [configError]);

  // ── Apply pipeline config → interviewConfig ──────────────────────────────────
  useEffect(() => {
    if (!isPipelineJob || !progressData) return;
    const currentStep   = progressData.currentStep;
    const dynamicConfig = buildInterviewConfigFromURL({
      type: currentStep.stepType,
      ...currentStep.interviewParams,
      passThreshold: currentStep.interviewParams.passThreshold || currentStep.passThreshold,
    } as any);
    setInterviewConfig(dynamicConfig);

    localStorage.setItem('interview_jobId',       jobId!);
    localStorage.setItem('interview_stepId',      currentStep.stepId);
    localStorage.setItem('interview_stepNumber',  currentStep.stepNumber.toString());
    localStorage.setItem('interview_passThreshold', (currentStep.passThreshold || 70).toString());
    localStorage.setItem('interview_source',      'pipeline');
  }, [isPipelineJob, progressData]);

  // ── Apply regular config → interviewConfig ───────────────────────────────────
  useEffect(() => {
    if (isPipelineJob || !configData) return;
    setInterviewConfig(configData);
    localStorage.setItem('interview_jobId',  jobId!);
    localStorage.setItem('interview_type',   'hr');
  }, [isPipelineJob, configData]);

  // ── URL-param mode (no jobId) ─────────────────────────────────────────────────
  useEffect(() => {
    if (!router.isReady || jobId) return;

    const urlParams: URLParams = {
      type:        router.query.type        as any,
      skill:       router.query.skill       as string,
      proficiency: router.query.proficiency as string,
      category:    router.query.category    as string,
      company:     router.query.company     as string,
      role:        router.query.role        as string,
      language:    router.query.language    as string,
      difficulty:  router.query.difficulty  as string,
      duration:    router.query.duration    as string,
      deep:        router.query.deep        as string,
    };

    if (!urlParams.type && !urlParams.skill) return;
    setInterviewConfig(buildInterviewConfigFromURL(urlParams));

    localStorage.removeItem('interview_type');
    localStorage.removeItem('interview_skill');
    localStorage.removeItem('interview_category');
    localStorage.removeItem('interview_proficiency');
    localStorage.removeItem('interview_role');
    localStorage.removeItem('interview_jobId');

    if (urlParams.type)        localStorage.setItem('interview_type',        urlParams.type);
    if (urlParams.skill)       localStorage.setItem('interview_skill',       urlParams.skill);
    if (urlParams.category)    localStorage.setItem('interview_category',    urlParams.category);
    if (urlParams.proficiency) localStorage.setItem('interview_proficiency', urlParams.proficiency);
    if (urlParams.role)        localStorage.setItem('interview_role',        urlParams.role);
  }, [router.isReady, router.query, jobId]);

  const pipelineLoading = postLoading || progressLoading || configLoading;

  return {
    interviewConfig,
    setInterviewConfig,
    isPipelineJob,
    candidateProgress:    progressData?.progress ?? null,
    currentPipelineStep:  progressData?.currentStep?.stepNumber ?? null,
    pipelineLoading,
    showBlockedModal: false,
    showFailedModal:  false,
    blockMessage,
    jobData: jobData ?? null,
  };
};
