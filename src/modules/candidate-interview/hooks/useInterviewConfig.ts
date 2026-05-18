import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InterviewConfig } from '../types/interview';
import { buildInterviewConfigFromURL, URLParams } from '@/utils/interviewConfigBuilder';
import { getToken } from '@/utils/tokenUtils';
import { useJobPostQuery } from '../queries/useJobPostQuery';
import { useInterviewConfigQuery } from '../queries/useInterviewConfigQuery';
import type { UseInterviewConfigReturn, UseInterviewConfigOptions } from '../types/hooks';

export type { UseInterviewConfigReturn, UseInterviewConfigOptions };

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
  const router = useRouter();
  const jobId  = router.isReady && typeof router.query.jobId === 'string'
    ? router.query.jobId
    : null;

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_CONFIG);

  // ── 1. Fetch job post ────────────────────────────────────────────────────────
  const { data: jobData } = useJobPostQuery(jobId);

  // ── 2. Fetch interview config (requires auth token) ──────────────────────────
  const { data: configData, error: configError } = useInterviewConfigQuery(
    !!jobData && !!getToken() ? jobId : null,
  );

  useEffect(() => {
    if (configError) showNotification('Failed to load interview configuration', 'error');
  }, [configError]);

  // ── Apply fetched config ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!configData) return;
    setInterviewConfig(configData);
    localStorage.setItem('interview_jobId', jobId!);
    localStorage.setItem('interview_type',  'hr');
  }, [configData]);

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

  return {
    interviewConfig,
    setInterviewConfig,
    jobData: jobData ?? null,
  };
};
