import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_INTERVIEW_CONFIG } from '../../shared/constants/interviewDefaults';

export interface UseSkillInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  skill: string | null;
  category: string | null;
  language: string;
  isReady: boolean;
}

export const useSkillInterviewConfig = (): UseSkillInterviewConfigReturn => {
  const router = useRouter();
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_INTERVIEW_CONFIG);

  const skill     = router.isReady ? (router.query.skill     as string) || null : null;
  const category  = router.isReady ? (router.query.category  as string) || null : null;
  const language  = router.isReady ? (router.query.language  as string) || 'en' : 'en';

  useEffect(() => {
    if (!router.isReady || !skill) return;

    const config: InterviewConfig = {
      interviewType: 'TECHNICAL_SKILL',
      testReason: `Skill assessment: ${skill}`,
      context: {
        targetRole:    skill,
        interviewGoal: `Assess ${skill} knowledge and practical skills`,
      },
      models: DEFAULT_INTERVIEW_CONFIG.models,
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
  }, [router.isReady, skill, language, category]);

  return {
    interviewConfig,
    setInterviewConfig,
    skill,
    category,
    language,
    isReady: router.isReady,
  };
};
