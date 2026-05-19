import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface HardSkill {
  name: string;
  level: number;
  category: string;
  percentage: number;
}

export interface SoftSkill {
  name: string;
  level: number;
  percentage: number;
}

export interface Salary {
  min: number | null;
  max: number | null;
  currency: string;
}

export interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  workMode: string;
  employmentType: string;
  experienceLevel: string;
  salary: Salary;
}

export interface SkillAnalysis {
  requiredSkills: HardSkill[];
  softSkills: SoftSkill[];
}

export interface PostGenerationResponse {
  creationType: "ai" | "manual" | null;
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  expirationDate: string | null;
}

export interface PostGenerationState {
  generatedPost: PostGenerationResponse | null;
  generatedLanguage: string;
  creationType: "ai" | "manual" | null;
  promptDescription: string;
  workMode: string;
  employmentType: string;
  salary: Salary;
  expirationDate: string;
  interviewLanguages: string[];
  generatedAt: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDefaultExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 15);
  return date.toISOString();
};

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: PostGenerationState = {
  generatedPost: null,
  generatedLanguage: "en",
  creationType: null,
  promptDescription: "",
  workMode: "",
  employmentType: "",
  salary: { min: null, max: null, currency: "USD" },
  expirationDate: getDefaultExpirationDate(),
  interviewLanguages: ["en"],
  generatedAt: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const createPostSlice = createSlice({
  name: "postGeneration",
  initialState,
  reducers: {
    clearPost(state) {
      state.generatedPost = null;
      state.generatedLanguage = "en";
      state.generatedAt = null;
      state.creationType = null;
      state.promptDescription = "";
      state.workMode = "";
      state.employmentType = "";
      state.salary = { min: null, max: null, currency: "USD" };
      state.expirationDate = getDefaultExpirationDate();
      state.interviewLanguages = ["en"];
    },

    setGeneratedPost(
      state,
      action: PayloadAction<{ post: PostGenerationResponse; language: string }>,
    ) {
      state.generatedPost = { ...action.payload.post, expirationDate: state.expirationDate };
      state.generatedLanguage = action.payload.language;
      state.generatedAt = Date.now();
    },

    setInterviewLanguages(state, action: PayloadAction<string[]>) {
      state.interviewLanguages = action.payload;
    },

    setCreationType(state, action: PayloadAction<"ai" | "manual" | null>) {
      state.creationType = action.payload;
      if (state.generatedPost) state.generatedPost.creationType = action.payload;
    },

    setPromptDescription(state, action: PayloadAction<string>) {
      state.promptDescription = action.payload;
    },

    setWorkMode(state, action: PayloadAction<string>) {
      state.workMode = action.payload;
    },

    setEmploymentType(state, action: PayloadAction<string>) {
      state.employmentType = action.payload;
    },

    setExpirationDate(state, action: PayloadAction<string>) {
      state.expirationDate = action.payload;
      if (state.generatedPost) state.generatedPost.expirationDate = action.payload;
    },

    updateSalaryField(
      state,
      action: PayloadAction<{ field: keyof Salary; value: number | string }>,
    ) {
      state.salary[action.payload.field] = action.payload.value as never;
    },

    updateJobField(
      state,
      action: PayloadAction<{ field: keyof JobDetails; value: any }>,
    ) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails[action.payload.field] = action.payload.value;
      }
    },

    updateJobSalaryField(
      state,
      action: PayloadAction<{ field: keyof Salary; value: number | string }>,
    ) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.salary[action.payload.field] = action.payload.value as never;
      }
    },

    updateRequirements(state, action: PayloadAction<string>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.requirements = action.payload
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r);
      }
    },

    updateResponsibilities(state, action: PayloadAction<string>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.responsibilities = action.payload
          .split("\n")
          .map((r) => r.trim())
          .filter((r) => r);
      }
    },

    editHardSkill(
      state,
      action: PayloadAction<{ index: number; updated: Partial<HardSkill> }>,
    ) {
      if (state.generatedPost) {
        const list = state.generatedPost.skillAnalysis.requiredSkills;
        if (list[action.payload.index]) {
          list[action.payload.index] = { ...list[action.payload.index], ...action.payload.updated };
        }
      }
    },

    deleteHardSkill(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.requiredSkills =
          state.generatedPost.skillAnalysis.requiredSkills.filter((_, i) => i !== action.payload);
      }
    },

    addHardSkill(state, action: PayloadAction<HardSkill>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.requiredSkills.push(action.payload);
      }
    },

    editSoftSkill(
      state,
      action: PayloadAction<{ index: number; updated: Partial<SoftSkill> }>,
    ) {
      if (state.generatedPost) {
        const list = state.generatedPost.skillAnalysis.softSkills;
        if (list[action.payload.index]) {
          list[action.payload.index] = { ...list[action.payload.index], ...action.payload.updated };
        }
      }
    },

    deleteSoftSkill(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.softSkills =
          state.generatedPost.skillAnalysis.softSkills.filter((_, i) => i !== action.payload);
      }
    },

    addSoftSkill(state, action: PayloadAction<SoftSkill>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.softSkills.push(action.payload);
      }
    },
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────────

export const {
  clearPost,
  setGeneratedPost,
  setCreationType,
  setPromptDescription,
  setWorkMode,
  setEmploymentType,
  setExpirationDate,
  updateSalaryField,
  updateJobField,
  updateJobSalaryField,
  updateRequirements,
  updateResponsibilities,
  editHardSkill,
  deleteHardSkill,
  addHardSkill,
  editSoftSkill,
  deleteSoftSkill,
  addSoftSkill,
  setInterviewLanguages,
} = createPostSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectGeneratedPost = (state: any) => state.postGeneration.generatedPost;
export const selectJobDetails = (state: any) => state.postGeneration.generatedPost?.jobDetails;
export const selectHardSkills = (state: any) =>
  state.postGeneration.generatedPost?.skillAnalysis.requiredSkills ?? [];
export const selectSoftSkills = (state: any) =>
  state.postGeneration.generatedPost?.skillAnalysis.softSkills ?? [];
export const selectCreationType = (state: any) => state.postGeneration?.creationType;

export default createPostSlice.reducer;
