import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_MODELS } from '../../shared/constants/interviewDefaults';

export interface SkillInterviewOverrides {
  skill?: string | null;
  category?: string | null;
  language?: string;
}

export interface UseSkillInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  skill: string | null;
  category: string | null;
  language: string;
  isReady: boolean;
}

export const useSkillInterviewConfig = (overrides?: SkillInterviewOverrides): UseSkillInterviewConfigReturn => {
  const router = useRouter();
  const hasOverrides = overrides !== undefined;

  const skill    = hasOverrides ? (overrides.skill    ?? null) : (router.isReady ? (router.query.skill    as string) || null : null);
  const category = hasOverrides ? (overrides.category ?? null) : (router.isReady ? (router.query.category as string) || null : null);
  const language = hasOverrides ? (overrides.language ?? 'en') : (router.isReady ? (router.query.language as string) || 'en' : 'en');
  const isReady  = hasOverrides ? true : router.isReady;

  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>({
    interviewType: 'TECHNICAL_SKILL',
    testReason: '',
    context: { interviewGoal: '' },
    models: DEFAULT_MODELS,
  });

  useEffect(() => {
    if (!isReady || !skill) return;

    const config: InterviewConfig = {
      interviewType: 'TECHNICAL_SKILL',
      testReason: `Skill assessment: ${skill}`,
      context: {
        targetRole:    skill,
        interviewGoal: `Assess ${skill} knowledge and practical skills`,
      },
      models: DEFAULT_MODELS,
      sessionSettings: {
        duration: 20,
        language,
        silenceTimeout: 5,
        silenceIntelligence: {
          adaptiveMode: true,
          contextualAdjustments: true,
        },
      },
      pipelineConfig: {
        skills: [{ name: skill }],
        ...(category ? { categories: [category] } : {}),
      },
    };

    setInterviewConfig(config);
  }, [isReady, skill, language, category]);

  return {
    interviewConfig,
    setInterviewConfig,
    skill,
    category,
    language,
    isReady,
  };
};
