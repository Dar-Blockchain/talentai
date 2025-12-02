// Shared types for the recruitment post components
export interface JobPost {
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    responsibilities: string[];
    location: string;
    employmentType: string;
    workMode?: string;
    experienceLevel: string;
    salary: {
      min: number;
      max: number;
      currency: string;
    };
  };
  skillAnalysis: {
    requiredSkills: Array<{
      name: string;
      level: string;
      importance: string;
      category: string;
      experienceLevel: string;
      percentage?: number;
    }>;
    softSkills?: Array<{
      name: string;
      importance: string;
      percentage: number;
    }>;
    suggestedSkills: {
      technical: Array<{
        name: string;
        reason: string;
        category: string;
        priority: string;
      }>;
      frameworks: Array<{
        name: string;
        relatedTo: string;
        priority: string;
      }>;
      tools: Array<{
        name: string;
        purpose: string;
        category: string;
      }>;
    };
    skillSummary: {
      mainTechnologies: string[];
      complementarySkills: string[];
      learningPath: string[];
      stackComplexity: string;
    };
  };
  linkedinPost: {
    formattedContent: {
      headline: string;
      introduction: string;
      companyPitch: string;
      roleOverview: string;
      keyPoints: string[];
      skillsRequired: string;
      benefitsSection: string;
      callToAction: string;
    };
    hashtags: string[];
    formatting: {
      emojis: {
        company: string;
        location: string;
        salary: string;
        requirements: string;
        skills: string;
        benefits: string;
        apply: string;
      };
    };
    finalPost: string;
  };
}

export interface PostDetailsRef {
  saveJob: () => Promise<{ success: boolean; jobId?: string }>;
  canProceed: () => boolean;
  getJobTitle: () => string | undefined;
  getJobSkills: () => string[];
}

export interface SalaryRange {
  currency: string;
  min: string;
  max: string;
}