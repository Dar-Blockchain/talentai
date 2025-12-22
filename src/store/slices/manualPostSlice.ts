import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/* ========= Types ========= */

interface Salary {
  min: number | null;
  max: number | null;
  currency: string;
}

interface Skill {
  name: string;
  level: string;
}

interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  employmentType: string;
  workMode: string;
  experienceLevel: string;
  salary: Salary;
}

interface SkillAnalysis {
  requiredSkills: Skill[];
  softSkills: Skill[];
  suggestedSkills: {
    technical: string[];
    frameworks: string[];
    tools: string[];
  };
  skillSummary: {
    mainTechnologies: string[];
    complementarySkills: string[];
    learningPath: string[];
    stackComplexity: string;
  };
}

interface LinkedinPost {
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
}

export interface ManualPostState {
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  linkedinPost: LinkedinPost;
  matchingConfig: any;
  creationType: "manual";
}

/* ========= Initial State ========= */

const initialState: ManualPostState = {
  jobDetails: {
    title: "",
    description: "",
    requirements: [
      "Strong communication skills",
      "Team player with problem-solving abilities",
      "Relevant experience in the field",
    ],
    responsibilities: [
      "Collaborate with team members on projects",
      "Contribute to company goals and objectives",
      "Maintain professional standards",
    ],
    location: "To be determined",
    employmentType: "",
    workMode: "",
    experienceLevel: "All levels",
    salary: {
      min: null,
      max: null,
      currency: "USD",
    },
  },

  skillAnalysis: {
    requiredSkills: [
      { name: "Technical Skills", level: "Intermediate" },
      { name: "Problem Solving", level: "Intermediate" },
      { name: "Analytical Thinking", level: "Intermediate" },
    ],
    softSkills: [
      { name: "Communication", level: "Intermediate" },
      { name: "Teamwork", level: "Intermediate" },
      { name: "Adaptability", level: "Intermediate" },
    ],
    suggestedSkills: {
      technical: [],
      frameworks: [],
      tools: [],
    },
    skillSummary: {
      mainTechnologies: [],
      complementarySkills: [],
      learningPath: [],
      stackComplexity: "Moderate",
    },
  },

  linkedinPost: {
    formattedContent: {
      headline: "",
      introduction: "",
      companyPitch: "Join our innovative team",
      roleOverview: "",
      keyPoints: [],
      skillsRequired: "To be defined in recruitment pipeline",
      benefitsSection: "Competitive salary and benefits package",
      callToAction: "Apply now to join our team!",
    },
    hashtags: ["#Hiring", "#JobOpening"],
    formatting: {
      emojis: {
        company: "🏢",
        location: "📍",
        salary: "💰",
        requirements: "📋",
        skills: "💻",
        benefits: "🎯",
        apply: "✨",
      },
    },
    finalPost: "",
  },
  matchingConfig: {
    weights: {
      hardSkill: 50,
      SoftSkill: 10,
      experience: 20,
      salary: 5,
      workMode: 5,
      contract: 10,
    },
    importanceWeight: {
      Junior: 1.5,
      Mid_Level: 1.2,
      Senior: 1,
      Expert: 0.8,
    },
    exchangeRates: {
      USD: 1,
      EUR: 1.09,
      TND: 0.33,
    },
  },

  creationType: "manual",
};

/* ========= Slice ========= */

const manualPostSlice = createSlice({
  name: "manualPost",
  initialState,
  reducers: {
    setManualPostData: (_, action: PayloadAction<ManualPostState>) => {
      return action.payload;
    },

    updateJobDetails: (state, action: PayloadAction<Partial<JobDetails>>) => {
      state.jobDetails = { ...state.jobDetails, ...action.payload };
    },

    updateSkillAnalysis: (
      state,
      action: PayloadAction<Partial<SkillAnalysis>>
    ) => {
      state.skillAnalysis = { ...state.skillAnalysis, ...action.payload };
    },

    updateLinkedinPost: (
      state,
      action: PayloadAction<Partial<LinkedinPost>>
    ) => {
      state.linkedinPost = { ...state.linkedinPost, ...action.payload };
    },
    updateMatchingConfig: (state, action: PayloadAction<any>) => {
      state.matchingConfig = { ...state.matchingConfig, ...action.payload };
    },
    resetManualPost: () => initialState,
  },
});

/* ========= Exports ========= */

export const {
  setManualPostData,
  updateJobDetails,
  updateSkillAnalysis,
  updateLinkedinPost,
  updateMatchingConfig,
  resetManualPost,
} = manualPostSlice.actions;

export default manualPostSlice.reducer;
