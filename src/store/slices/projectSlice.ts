import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types based on backend projectModel
export interface ProjectTeamMember {
  email: string;
  validated?: boolean;
  activationToken?: string;
}

// Technical Data Types
export interface Architecture {
  title: string;
  type: string;
  choiceExplanation: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface ScalabilityApproach {
  strategy: string;
  choiceExplanation: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export type TechStackComponentType = 'coreTechnology' | 'integrationTool' | 'hederaService';
export type TechStackComplexity = 'Beginner' | 'Intermediate' | 'Advanced';
export type TechStackModernity = 'outdated' | 'average' | 'modern' | 'cutting-edge';

export interface TechStack {
  title: string;
  componentType: TechStackComponentType;
  choiceExplanation: string[];
  score?: number;
  complexity: TechStackComplexity;
  modernity: TechStackModernity;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface TechnicalData {
  track: string;
  techStack: TechStack[];
  architecture: Architecture;
  scalabilityApproach: ScalabilityApproach;
  overallScore?: number;
  summary?: string;
  createdAt?: number;
}

// Business Data Types
export interface BusinessModel {
  model: string;
  choiceExplanation: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface MarketPotential {
  range: string;
  estimatedMarketSize: string;
  targetRegion: string;
  choiceExplanation: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface BusinessData {
  problem: string;
  targetUsers: string[];
  addedValues: string[];
  businessModel: BusinessModel;
  competitors: string[];
  marketPotential: MarketPotential;
  overallScore?: number;
  summary?: string;
  createdAt?: number;
}

export interface ProjectAssessmentRef {
  _id: string;
  user?: string; // ObjectId as string
  project: string; // ObjectId as string
  technicalData?: TechnicalData;
  businessData?: BusinessData;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  track: string;
  team: ProjectTeamMember[];
  leaderId: string;
  leaderProfile?: string;
  assessment: ProjectAssessmentRef;
  createdAt?: string;
  updatedAt?: string;
  // Optionally add more fields as needed
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  total: 0,
  totalPages: 0,
};

// Filters for getAllProjects
type GetAllProjectsParams = {
  name?: string;
  track?: string | null;
  sort?: string;
  page?: number;
  limit?: number;
};

export const getAllProjects = createAsyncThunk<
  { projects: Project[]; total: number, totalPages: number },
  GetAllProjectsParams | void,
  { rejectValue: string }
>(
  "projects/getAll",
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      // Build query string from params
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.name) q.append('name', params.name);
        if (params.track) q.append('track', params.track);
        if (params.sort) q.append('sort', params.sort);
        if (params.page !== undefined) q.append('page', String(params.page));
        if (params.limit !== undefined) q.append('limit', String(params.limit));
        query = '?' + q.toString();
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}project/getAllProjects${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      return { projects: data.projects, total: data.total, totalPages: data.totalPages };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const getProjectById = createAsyncThunk<Project, string>(
  "projects/getOne",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch project");
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

export const addProject = createAsyncThunk<Project, Partial<Project>>(
  "projects/add",
  async (project, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) {
        return rejectWithValue('No authentication token found');
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/projects`,
        {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project),
        }
      );
      if (!res.ok) throw new Error("Failed to add project");
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const projectSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get all projects
      .addCase(getAllProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProjects.fulfilled, (state, action: PayloadAction<{ projects: Project[]; total: number, totalPages: number }>) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get one project
      .addCase(
        getProjectById.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        getProjectById.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.currentProject = action.payload;
        }
      )
      .addCase(getProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Add project
      .addCase(
        addProject.pending,
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addCase(
        addProject.fulfilled,
        (state, action: PayloadAction<Project>) => {
          state.loading = false;
          state.projects.push(action.payload);
        }
      )
      .addCase(addProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default projectSlice.reducer;

export const selectTotalProjects = (state: { project: ProjectState }) => state.project.total;
export const selectTotalPages = (state: { project: ProjectState }) => state.project.totalPages;
