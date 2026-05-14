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
}

export interface ManualPostState {
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
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

    setManualExpirationDate: (state, action: PayloadAction<string>) => {
      state.expirationDate = action.payload;
    },
    resetManualPost: () => initialState,
  },
});

/* ========= Exports ========= */

export const {
  updateJobDetails,
  setManualExpirationDate,
  resetManualPost,
} = manualPostSlice.actions;

export default manualPostSlice.reducer;
