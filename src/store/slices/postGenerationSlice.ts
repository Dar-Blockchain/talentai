// postGenerationSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ------------------------------------------------------
// Types
// ------------------------------------------------------

export interface HardSkill {
  name: string;
  level: number;
  importance: string;
  category: string;
  percentage: number;
}

export interface SoftSkill {
  name: string;
  importance: string;
  percentage: number;
}

export interface Salary {
  min: string;
  max: string;
  currency: string;
}

export interface JobDetails {
  title: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  location: string;
  employmentType: string;
  experienceLevel: string;
  salary: Salary;
}

export interface SuggestedSkills {
  technical: string[];
  frameworks: string[];
  tools: string[];
}

export interface SkillSummary {
  mainTechnologies: string[];
  complementarySkills: string[];
  learningPath: string[];
  stackComplexity: string;
}

export interface SkillAnalysis {
  requiredSkills: HardSkill[];
  softSkills: SoftSkill[];
  suggestedSkills: SuggestedSkills;
  skillSummary: SkillSummary;
}

export interface LinkedinPost {
  finalPost: string;
}

export interface PostGenerationResponse {
  jobDetails: JobDetails;
  skillAnalysis: SkillAnalysis;
  linkedinPost: LinkedinPost;
}

// ------------------------------------------------------
// State
// ------------------------------------------------------

export interface PostGenerationState {
  generatedPost: PostGenerationResponse | null;

  promptDescription: string;
  generationType: "quick" | "detailed";
  workMode: string;
  employmentType: string;
  salary: Salary;

  loading: boolean;
  error: string | null;

  generatedAt: number | null;
}

// ------------------------------------------------------
// Initial State
// ------------------------------------------------------

const initialState: PostGenerationState = {
  generatedPost: null,

  promptDescription: "",
  generationType: "quick",
  workMode: "",
  employmentType: "",
  salary: { min: "", max: "", currency: "USD" },

  loading: false,
  error: null,
  generatedAt: null,
};

// ------------------------------------------------------
// Async Thunk
// ------------------------------------------------------

export const generatePost = createAsyncThunk<
  PostGenerationResponse,
  {
    jobDescription: string;
    type: "quick" | "detailed";
    salary: Salary;
    contractType?: string;
    workMode?: string;
  },
  { rejectValue: string }
>("postGeneration/generatePost", async (payload, { rejectWithValue }) => {
  try {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("api_token="))
      ?.split("=")[1];

    const { jobDescription, salary, contractType, workMode, type } = payload;

    const salaryText = `\n\nSalary Range: ${
      salary.currency
    }${salary.min.toLocaleString()} - ${
      salary.currency
    }${salary.max.toLocaleString()}`;
    const contractTypeText = contractType
      ? `\nContract Type: ${contractType}`
      : "";
    const workModeText = workMode ? `\nWork Mode: ${workMode}` : "";

    const descriptionWithDetails =
      jobDescription + salaryText + contractTypeText + workModeText;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}linkedinPost/generate-job-post`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: descriptionWithDetails,
          type,
          contractType,
          workMode,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to generate job");
    }

    return data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// ------------------------------------------------------
// Slice
// ------------------------------------------------------

const postGenerationSlice = createSlice({
  name: "postGeneration",
  initialState,

  reducers: {
    clearPost(state) {
      state.generatedPost = null;
      state.error = null;
      state.generatedAt = null;
    },

    setPromptDescription(state, action: PayloadAction<string>) {
      state.promptDescription = action.payload;
    },

    setGenerationType(state, action: PayloadAction<"quick" | "detailed">) {
      state.generationType = action.payload;
    },

    setWorkMode(state, action: PayloadAction<string>) {
      state.workMode = action.payload;
    },

    setEmploymentType(state, action: PayloadAction<string>) {
      state.employmentType = action.payload;
    },

    setSalary(state, action: PayloadAction<Salary>) {
      state.salary = action.payload;
    },

    updateSalaryField(
      state,
      action: PayloadAction<{ field: keyof Salary; value: number | string }>
    ) {
      state.salary[action.payload.field] = action.payload.value as never;
    },

    // ----------------------------------------------------------
    // JOB DETAILS EDITING
    // ----------------------------------------------------------

    updateJobField(
      state,
      action: PayloadAction<{ field: keyof JobDetails; value: any }>
    ) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails[action.payload.field] =
          action.payload.value;
      }
    },

    // ---------- Requirements (Array) ----------
    editRequirement(
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) {
      if (state.generatedPost) {
        const reqs = state.generatedPost.jobDetails.requirements;
        if (reqs[action.payload.index] !== undefined) {
          reqs[action.payload.index] = action.payload.value;
        }
      }
    },

    addRequirement(state, action: PayloadAction<string>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.requirements.push(action.payload);
      }
    },

    deleteRequirement(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.requirements =
          state.generatedPost.jobDetails.requirements.filter(
            (_, i) => i !== action.payload
          );
      }
    },

    // ---------- Responsibilities (Array) ----------
    editResponsibility(
      state,
      action: PayloadAction<{ index: number; value: string }>
    ) {
      if (state.generatedPost) {
        const resps = state.generatedPost.jobDetails.responsibilities;
        if (resps[action.payload.index] !== undefined) {
          resps[action.payload.index] = action.payload.value;
        }
      }
    },

    addResponsibility(state, action: PayloadAction<string>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.responsibilities.push(action.payload);
      }
    },

    deleteResponsibility(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.jobDetails.responsibilities =
          state.generatedPost.jobDetails.responsibilities.filter(
            (_, i) => i !== action.payload
          );
      }
    },

    // ------------------------------------------
    // HARD SKILLS EDIT / DELETE
    // ------------------------------------------
    editHardSkill(
      state,
      action: PayloadAction<{ index: number; updated: Partial<HardSkill> }>
    ) {
      if (state.generatedPost) {
        const list = state.generatedPost.skillAnalysis.requiredSkills;
        if (list[action.payload.index]) {
          list[action.payload.index] = {
            ...list[action.payload.index],
            ...action.payload.updated,
          };
        }
      }
    },

    deleteHardSkill(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.requiredSkills =
          state.generatedPost.skillAnalysis.requiredSkills.filter(
            (_, i) => i !== action.payload
          );
      }
    },

    // ------------------------------------------
    // SOFT SKILLS EDIT / DELETE
    // ------------------------------------------
    editSoftSkill(
      state,
      action: PayloadAction<{ index: number; updated: Partial<SoftSkill> }>
    ) {
      if (state.generatedPost) {
        const list = state.generatedPost.skillAnalysis.softSkills;
        if (list[action.payload.index]) {
          list[action.payload.index] = {
            ...list[action.payload.index],
            ...action.payload.updated,
          };
        }
      }
    },

    deleteSoftSkill(state, action: PayloadAction<number>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.softSkills =
          state.generatedPost.skillAnalysis.softSkills.filter(
            (_, i) => i !== action.payload
          );
      }
    },

    addHardSkill(state, action: PayloadAction<HardSkill>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.requiredSkills.push(action.payload);
      }
    },

    addSoftSkill(state, action: PayloadAction<SoftSkill>) {
      if (state.generatedPost) {
        state.generatedPost.skillAnalysis.softSkills.push(action.payload);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(generatePost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        generatePost.fulfilled,
        (state, action: PayloadAction<PostGenerationResponse>) => {
          state.loading = false;
          state.generatedPost = action.payload;
          state.generatedAt = Date.now();
        }
      )

      .addCase(generatePost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error generating post";
      });
  },
});

// ------------------------------------------------------
// Actions Export
// ------------------------------------------------------

export const {
  clearPost,
  setPromptDescription,
  setGenerationType,
  setWorkMode,
  setEmploymentType,
  setSalary,
  updateSalaryField,
  editHardSkill,
  deleteHardSkill,
  editSoftSkill,
  deleteSoftSkill,
  addHardSkill,
  addSoftSkill,

  updateJobField,
  editRequirement,
  addRequirement,
  deleteRequirement,
  editResponsibility,
  addResponsibility,
  deleteResponsibility,
} = postGenerationSlice.actions;

// ------------------------------------------------------
// Selectors
// ------------------------------------------------------

export const selectGeneratedPost = (state: any) =>
  state.postGeneration.generatedPost;

export const selectJobDetails = (state: any) =>
  state.postGeneration.generatedPost?.jobDetails;

export const selectHardSkills = (state: any) =>
  state.postGeneration.generatedPost?.skillAnalysis.requiredSkills ?? [];

export const selectSoftSkills = (state: any) =>
  state.postGeneration.generatedPost?.skillAnalysis.softSkills ?? [];

export const selectLinkedinPost = (state: any) =>
  state.postGeneration.generatedPost?.linkedinPost.finalPost;

export const selectLoading = (state: any) => state.postGeneration.loading;

export const selectError = (state: any) => state.postGeneration.error;

export default postGenerationSlice.reducer;
