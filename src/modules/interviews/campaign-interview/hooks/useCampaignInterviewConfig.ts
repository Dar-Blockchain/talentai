import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import type { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_MODELS } from '../../shared/constants/interviewDefaults';

export type CampaignModuleType = 'SKILL_TEST' | 'AI_INTERVIEW';

export interface CampaignInterviewConfig extends InterviewConfig {
  campaignId: string;
  moduleType: CampaignModuleType;
}

interface UseCampaignInterviewConfigReturn {
  interviewConfig: CampaignInterviewConfig;
  setInterviewConfig: (config: CampaignInterviewConfig) => void;
  campaignId: string | null;
  moduleType: CampaignModuleType | null;
  isReady: boolean;
}

export function useCampaignInterviewConfig(overrides?: {
  campaignId?: string;
  moduleType?: CampaignModuleType;
}): UseCampaignInterviewConfigReturn {
  const router = useRouter();
  const hasOverrides = overrides !== undefined;

  const campaignId: string | null = hasOverrides
    ? (overrides.campaignId ?? null)
    : router.isReady ? (router.query.campaignId as string) || null : null;

  const moduleType: CampaignModuleType | null = hasOverrides
    ? (overrides.moduleType ?? null)
    : router.isReady ? (router.query.moduleType as CampaignModuleType) || null : null;

  const isReady = hasOverrides ? true : router.isReady;

  const [interviewConfig, setInterviewConfig] = useState<CampaignInterviewConfig>({
    interviewType: 'HR_INTERVIEW',
    testReason: '',
    context: { interviewGoal: '' },
    models: DEFAULT_MODELS,
    campaignId: campaignId || '',
    moduleType: moduleType || 'AI_INTERVIEW',
  });

  useEffect(() => {
    if (!isReady || !campaignId || !moduleType) return;

    setInterviewConfig({
      interviewType: moduleType === 'SKILL_TEST' ? 'TECHNICAL_SKILL' : 'HR_INTERVIEW',
      testReason: `Campaign interview: ${moduleType}`,
      context: {
        interviewGoal: moduleType === 'SKILL_TEST'
          ? 'Assess technical skills for campaign'
          : 'Behavioral assessment for campaign',
      },
      models: DEFAULT_MODELS,
      sessionSettings: { duration: 20 },
      campaignId,
      moduleType,
    });
  }, [isReady, campaignId, moduleType]);

  return {
    interviewConfig,
    setInterviewConfig,
    campaignId,
    moduleType,
    isReady,
  };
}
