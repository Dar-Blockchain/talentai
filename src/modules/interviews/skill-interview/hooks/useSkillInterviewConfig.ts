import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { InterviewConfig } from '../../shared/types/interview';
import { DEFAULT_INTERVIEW_CONFIG } from '../../shared/constants/interviewDefaults';

export interface UseSkillInterviewConfigReturn {
  interviewConfig: InterviewConfig;
  setInterviewConfig: (config: InterviewConfig) => void;
  skill: string | null;
  proficiency: string | null;
  category: string | null;
  duration: number;
  language: string;
  isReady: boolean;
}

function proficiencyToLevel(proficiency: string | null): number {
  switch (proficiency?.toLowerCase()) {
    case 'beginner':     return 1;
    case 'intermediate': return 3;
    case 'advanced':     return 4;
    case 'expert':       return 5;
    default:             return 3;
  }
}

export const useSkillInterviewConfig = (): UseSkillInterviewConfigReturn => {
  const router = useRouter();
  const [interviewConfig, setInterviewConfig] = useState<InterviewConfig>(DEFAULT_INTERVIEW_CONFIG);

  const skill       = router.isReady ? (router.query.skill       as string) || null : null;
  const proficiency = router.isReady ? (router.query.proficiency as string) || null : null;
  const category    = router.isReady ? (router.query.category    as string) || null : null;
  const duration    = router.isReady ? Number(router.query.duration)  || 20   : 20;
  const language    = router.isReady ? (router.query.language    as string) || 'en' : 'en';

  useEffect(() => {
    if (!router.isReady || !skill) return;

    const config: InterviewConfig = {
      interviewType: 'TECHNICAL_SKILL',
      testReason: `Skill assessment: ${skill}${proficiency ? ` — ${proficiency}` : ''}`,
      context: {
        targetRole:      skill,
        experienceLevel: proficiency || 'Mid-Level',
        interviewGoal:   `Assess ${skill} knowledge and practical skills`,
      },
      models: DEFAULT_INTERVIEW_CONFIG.models,
      sessionSettings: {
        duration,
        language,
        difficulty:    proficiency || 'intermediate',
        silenceTimeout: 5,
        silenceIntelligence: {
          adaptiveMode: true,
          contextualAdjustments: true,
        },
      },
      pipelineConfig: {
        skills: [{ name: skill, requiredLevel: proficiencyToLevel(proficiency) }],
        ...(category ? { categories: [category] } : {}),
      },
    };

    setInterviewConfig(config);
  }, [router.isReady, skill, proficiency, duration, language, category]);

  return {
    interviewConfig,
    setInterviewConfig,
    skill,
    proficiency,
    category,
    duration,
    language,
    isReady: router.isReady,
  };
};
