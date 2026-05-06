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
  creationType: "manual";
  expirationDate: string;
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

  creationType: "manual",
  expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
};

/* ========= Slice ========= */

const manualPostSlice = createSlice({
  name: "manualPost",
  initialState,
  reducers: {
    updateJobDetails: (state, action: PayloadAction<Partial<JobDetails>>) => {
      state.jobDetails = { ...state.jobDetails, ...action.payload };
    },

    updateLinkedinPost: (
      state,
      action: PayloadAction<Partial<LinkedinPost>>
    ) => {
      state.linkedinPost = { ...state.linkedinPost, ...action.payload };
    },
    setManualExpirationDate: (state, action: PayloadAction<string>) => {
      state.expirationDate = action.payload;
    },
    resetManualPost: () => initialState,
  },
});

/* ========= Exports ========= */

export const {
  updateJobDetails,
  updateLinkedinPost,
  setManualExpirationDate,
  resetManualPost,
} = manualPostSlice.actions;

export default manualPostSlice.reducer;
