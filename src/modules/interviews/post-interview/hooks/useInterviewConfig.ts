import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { safeSet, safeRemove } from '@/utils/safeStorage';
import { useRouter } from 'next/router';
import { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_INTERVIEW_CONFIG } from '../constants/interviewDefaults';
import { buildInterviewConfigFromURL, URLParams } from '@/utils/interviewConfigBuilder';
import { getToken } from '@/modules/auth/shared/utils/token';
import { useJobPostQuery } from '../queries/useJobPostQuery';
import { useInterviewConfigQuery } from '../queries/useInterviewConfigQuery';
import type { UseInterviewConfigReturn, UseInterviewConfigOptions } from '../types/hooks';

export type { UseInterviewConfigReturn, UseInterviewConfigOptions };

export const useInterviewConfig = ({ jobId: propJobId }: Omit<UseInterviewConfigOptions, 'showNotification'>): UseInterviewConfigReturn => {
  const router = useRouter();
  const jobId  = propJobId !== undefined
    ? propJobId
    : (router.isReady && typeof router.query.jobId === 'string' ? router.query.jobId : null);

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_INTERVIEW_CONFIG);

  // ── 1. Fetch job post ────────────────────────────────────────────────────────
  const { data: jobData, isLoading: isJobLoading } = useJobPostQuery(jobId);

  // ── 2. Fetch interview config (requires auth token) ──────────────────────────
  const { data: configData, error: configError, isLoading: isConfigLoading } = useInterviewConfigQuery(
    !!jobData && !!getToken() ? jobId : null,
  );

  useEffect(() => {
    if (configError) toast.error('Failed to load interview configuration');
  }, [configError]);

  // ── Apply fetched config ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!configData) return;
    setInterviewConfig(configData);
    safeSet('interview_jobId', jobId!);
    safeSet('interview_type',  'hr');
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

    safeRemove('interview_type');
    safeRemove('interview_skill');
    safeRemove('interview_category');
    safeRemove('interview_proficiency');
    safeRemove('interview_role');
    safeRemove('interview_jobId');

    if (urlParams.type)        safeSet('interview_type',        urlParams.type);
    if (urlParams.skill)       safeSet('interview_skill',       urlParams.skill);
    if (urlParams.category)    safeSet('interview_category',    urlParams.category);
    if (urlParams.proficiency) safeSet('interview_proficiency', urlParams.proficiency);
    if (urlParams.role)        safeSet('interview_role',        urlParams.role);
  }, [router.isReady, router.query, jobId]);

  return {
    interviewConfig,
    setInterviewConfig,
    jobData: jobData ?? null,
    isJobLoading: !!jobId && isJobLoading,
    isConfigLoading: !!jobId && !!getToken() && isConfigLoading,
  };
};
