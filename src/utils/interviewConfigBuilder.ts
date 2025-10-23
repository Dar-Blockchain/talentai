/**
 * Interview Configuration Builder
 * Dynamically builds interview configuration from URL parameters
 */

export interface URLParams {
  type?: 'hr' | 'technical' | 'soft' | 'salary' | 'psycho';
  skill?: string;           // e.g., "React", "Communication"
  skills?: string;          // Multiple skills: "React,Node.js,JavaScript"
  proficiency?: string;     // 1-5 or "Entry Level", "Senior"
  category?: string;        // For soft skills: "English", "Leadership"
  company?: string;         // e.g., "Google", "Meta"
  role?: string;           // e.g., "Software Engineer"
  language?: string;        // e.g., "en", "fr"
  difficulty?: string;      // "beginner", "intermediate", "expert"
  duration?: string;        // Interview duration in minutes
}

export interface InterviewConfig {
  interviewType: 'HR_INTERVIEW' | 'SALARY_INTERVIEW' | 'TECHNICAL_SKILL' | 'SOFT_SKILL' | 'PSYCHOTECHNIC';
  testReason: string;
  context: {
    targetCompany: string;
    targetRole: string;
    experienceLevel: string;
    interviewGoal: string;
  };
  models?: {
    fastModel?: string;
    thinkingModel?: string;
    analysisModel?: string;
  };
  sessionSettings?: {
    duration?: number;
    language?: string;
    difficulty?: string;
    silenceTimeout?: number;
    silenceIntelligence?: {
      enabled: boolean;
      adaptiveThresholds: boolean;
      maxSilencePrompts: number;
      naturalPauseDetection: boolean;
      contextAwareThresholds: boolean;
    };
  };
}

/**
 * Proficiency level mapping
 */
const PROFICIENCY_MAP: { [key: string]: string } = {
  '1': 'Entry Level',
  '2': 'Junior',
  '3': 'Mid Level',
  '4': 'Senior',
  '5': 'Expert'
};

/**
 * Get interview goal based on interview type and parameters
 */
function getInterviewGoal(interviewType: string, params: URLParams): string {
  // Handle multiple skills for technical interviews
  const getSkillsText = () => {
    if (params.skills) {
      const skillsList = params.skills.split(',').map(s => s.trim());
      return skillsList.length > 1 ? skillsList.join(', ') : skillsList[0];
    }
    return params.skill || 'technical';
  };

  const goals: { [key: string]: string } = {
    'HR_INTERVIEW': 'Assess behavioral competencies and cultural fit',
    'TECHNICAL_SKILL': `Validate ${getSkillsText()} proficiency and problem-solving ability`,
    'SOFT_SKILL': `Evaluate ${params.skill || 'soft skill'} effectiveness and application`,
    'SALARY_INTERVIEW': 'Discuss compensation expectations and market alignment',
    'PSYCHOTECHNIC': 'Assess cognitive abilities and personality traits'
  };
  return goals[interviewType] || 'Comprehensive candidate assessment';
}

/**
 * Build interview configuration from URL parameters
 */
export function buildInterviewConfigFromURL(params: URLParams): InterviewConfig {
  console.log('🔧 Building interview config from URL params:', params);

  // Map URL type to interviewType enum
  const interviewTypeMap: { [key: string]: InterviewConfig['interviewType'] } = {
    'hr': 'HR_INTERVIEW',
    'technical': 'TECHNICAL_SKILL',
    'soft': 'SOFT_SKILL',
    'salary': 'SALARY_INTERVIEW',
    'psycho': 'PSYCHOTECHNIC'
  };

  const interviewType = interviewTypeMap[params.type || 'hr'] || 'HR_INTERVIEW';

  // Build context based on interview type
  let testReason = '';
  let targetRole = '';
  let experienceLevel = '';

  if (params.type === 'technical') {
    // Technical skill validation
    experienceLevel = PROFICIENCY_MAP[params.proficiency || '3'] || params.proficiency || 'Mid Level';
    targetRole = params.role || `${params.skill || 'Software'} Developer`;
    
    // Handle multiple skills in test reason
    const skillsText = params.skills ? 
      params.skills.split(',').map(s => s.trim()).join(', ') : 
      (params.skill || 'technical');
    testReason = `Validate ${skillsText} expertise at ${experienceLevel} level`;

  } else if (params.type === 'soft') {
    // Soft skill assessment
    experienceLevel = PROFICIENCY_MAP[params.proficiency || '3'] || params.proficiency || 'Mid Level';
    targetRole = params.role || 'Professional';
    testReason = `Assess ${params.skill || 'soft skill'} in ${params.category || 'general'} context at ${experienceLevel} level`;

  } else if (params.type === 'salary') {
    // Salary negotiation interview
    experienceLevel = params.proficiency || 'Mid-Level';
    targetRole = params.role || 'Professional';
    testReason = 'Conduct salary negotiation and compensation discussion';

  } else if (params.type === 'psycho') {
    // Psychotechnic assessment
    experienceLevel = params.proficiency || 'Mid-Level';
    targetRole = params.role || 'Professional';
    testReason = 'Conduct psychotechnic cognitive and personality assessment';

  } else {
    // HR interview (default)
    experienceLevel = params.proficiency || 'Mid-Level';
    targetRole = params.role || 'Software Engineer';
    testReason = 'Conduct behavioral and cultural fit assessment';
  }

  const config: InterviewConfig = {
    interviewType,
    testReason,
    context: {
      targetCompany: params.company || 'Target Company',
      targetRole,
      experienceLevel,
      interviewGoal: getInterviewGoal(interviewType, params)
    },
    models: {
      fastModel: 'meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo',
      thinkingModel: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      analysisModel: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo'
    },
    sessionSettings: {
      duration: parseInt(params.duration || '30'),
      language: params.language || 'en',
      difficulty: params.difficulty || 'intermediate',
      silenceTimeout: 5,
      silenceIntelligence: {
        enabled: true,
        adaptiveThresholds: true,
        maxSilencePrompts: 3,
        naturalPauseDetection: true,
        contextAwareThresholds: true
      }
    }
  };

  console.log('✅ Generated interview config:', config);

  return config;
}

/**
 * Validate interview configuration
 */
export function validateInterviewConfig(config: InterviewConfig): boolean {
  if (!config.interviewType) {
    console.error('❌ Invalid config: missing interviewType');
    return false;
  }

  if (!config.testReason || !config.context.targetRole) {
    console.error('❌ Invalid config: missing required fields');
    return false;
  }

  return true;
}

/**
 * Get default configuration for a specific interview type
 */
export function getDefaultConfig(interviewType: InterviewConfig['interviewType']): InterviewConfig {
  const defaults: { [key: string]: Partial<URLParams> } = {
    'HR_INTERVIEW': {
      type: 'hr',
      role: 'Software Engineer',
      proficiency: 'Mid-Level',
      company: 'Google'
    },
    'TECHNICAL_SKILL': {
      type: 'technical',
      skill: 'JavaScript',
      proficiency: '3',
      role: 'Software Developer'
    },
    'SOFT_SKILL': {
      type: 'soft',
      skill: 'Communication',
      proficiency: '3',
      category: 'English'
    },
    'SALARY_INTERVIEW': {
      type: 'salary',
      role: 'Software Engineer',
      proficiency: 'Mid-Level'
    },
    'PSYCHOTECHNIC': {
      type: 'psycho',
      role: 'Professional',
      proficiency: 'Mid-Level'
    }
  };

  return buildInterviewConfigFromURL(defaults[interviewType] || {});
}
