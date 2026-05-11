import { useState, useEffect } from 'react';
import { Campaign } from '@/types/campaign';
import { InterviewConfig } from '@/types/interview';

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_MODELS: NonNullable<InterviewConfig['models']> = {
  fastModel:     'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  thinkingModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  analysisModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
};

const DEFAULT_SESSION: NonNullable<InterviewConfig['sessionSettings']> = {
  duration:      30,
  language:      'en',
  difficulty:    'intermediate',
  silenceTimeout: 5,
  silenceIntelligence: {
    enabled:                 true,
    adaptiveThresholds:      true,
    maxSilencePrompts:       3,
    naturalPauseDetection:   true,
    contextAwareThresholds:  true,
  },
};

// ─── Builder ──────────────────────────────────────────────────────────────────

function buildConfigFromCampaign(campaign: Campaign): InterviewConfig {
  const moduleType = campaign.module?.type ?? 'AI_INTERVIEW';
  const moduleCfg  = (campaign.module as any)?.config ?? {};

  const interviewType: InterviewConfig['interviewType'] =
    moduleType === 'SKILL_TEST' ? 'TECHNICAL_INTERVIEW' : 'HR_INTERVIEW';

  return {
    interviewType,
    testReason: `Campaign assessment: ${campaign.title}`,
    context: {
      interviewGoal:   moduleCfg.agentPrompt  ?? `Assess candidate for ${campaign.title}`,
    },
    models: DEFAULT_MODELS,
    sessionSettings: {
      ...DEFAULT_SESSION,
      language:   moduleCfg.language   ?? DEFAULT_SESSION.language,
      difficulty: moduleCfg.difficulty ?? DEFAULT_SESSION.difficulty,
    },
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseCampaignInterviewConfigReturn {
  interviewConfig:    InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
}

export function useCampaignInterviewConfig(
  campaign: Campaign | null,
): UseCampaignInterviewConfigReturn {
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(() =>
    campaign ? buildConfigFromCampaign(campaign) : {
      interviewType: 'HR_INTERVIEW',
      testReason:    '',
      context: { targetCompany: '', targetRole: '', experienceLevel: '', interviewGoal: '' },
      models:          DEFAULT_MODELS,
      sessionSettings: DEFAULT_SESSION,
    },
  );

  // Re-derive whenever the campaign changes
  useEffect(() => {
    if (campaign) setInterviewConfig(buildConfigFromCampaign(campaign));
  }, [campaign?._id, campaign?.module?.type]);

  return { interviewConfig, setInterviewConfig };
}
