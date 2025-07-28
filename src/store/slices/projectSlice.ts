import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// Types based on backend projectModel
export interface ProjectTeamMember {
  name: string;
  email?: string;
  role: string;
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
  innovation?: Innovation;
  trackAlignment?: TrackAlignment;
  hederaEcosystemImpact?: HederaEcosystemImpact;
  businessModel: BusinessModel;
  competitors: string[];
  marketPotential: MarketPotential;
  overallScore?: number;
  summary?: string;
  createdAt?: number;
  addedValues?: any;
}

// Add eligibility types
export interface EligibilityCheck {
  type: string;
  status: string;
}

export interface Eligibility {
  checks: EligibilityCheck[];
  isEligible: boolean;
}

// Update ProjectAssessmentRef to include eligibility
export interface ProjectAssessmentRef {
  _id: string;
  user?: string; // ObjectId as string
  project: string; // ObjectId as string
  technicalData?: TechnicalData;
  businessData?: BusinessData;
  codeAnalysis?: any;
  eligibility?: Eligibility;
  overallScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  track: string;
  team: ProjectTeamMember[];
  leader: any;
  leaderProfile?: string;
  assessment: ProjectAssessmentRef;
  createdAt?: string;
  updatedAt?: string;
  // Optionally add more fields as needed
}

// Project stats type
export interface ProjectStats {
  totalProjects: number;
  totalTracks: number;
  averageScore: number;
  evaluatedProjects: number;
  totalTeamMembers: number;
}

// Type for projects by track
export interface ProjectsByTrack {
  track: string;
  count: number;
}

// Type for projects created per day
export interface ProjectsCreatedPerDay {
  date: string;
  count: number;
}

// Type for projects count by status
export interface ProjectsCountByStatus {
  status: string;
  count: number
}

// Define params and response types for top projects
export type GetTopProjectsParams = {
  page?: number;
  limit?: number;
  sort?: string;
  track?: string;
  name?: string;
};
export interface TopProjectsResponse {
  projects: Project[];
  total: number;
  totalPages: number;
}

interface TopProjectsState {
  data: Project[];
  total: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
}


interface InvitationData {
  memberEmail: string
  senderEmail: string
  projectId: string
  exp: number;
  iat: number;
}

interface InvitationState {
  loading: boolean
  error: string | null
  data: InvitationData | null
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  total: number;
  totalPages: number;
  stats: ProjectStats | null;
  tracks: string[];
  projectsByTrack: ProjectsByTrack[];
  projectsCreatedPerDay: ProjectsCreatedPerDay[];
  projectsCountByStatus: ProjectsCountByStatus[];
  topTechnicalProjects: TopProjectsState;
  topBusinessProjects: TopProjectsState;
  invitationData: InvitationState;
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: true,
  error: null,
  total: 0,
  totalPages: 0,
  stats: null,
  tracks: [],
  projectsByTrack: [],
  projectsCreatedPerDay: [],
  projectsCountByStatus: [],
  topTechnicalProjects: { data: [], total: 0, totalPages: 0, loading: false, error: null },
  topBusinessProjects: { data: [], total: 0, totalPages: 0, loading: false, error: null },
  invitationData: {loading: false, error: null, data: null}
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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectById/${id}`,
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

// Thunk to fetch project stats
export const getProjectStats = createAsyncThunk<ProjectStats, void, { rejectValue: string }>(
  'projects/getProjectStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/ProjectStats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch project stats');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch project tracks
export const getProjectTracks = createAsyncThunk<string[], void, { rejectValue: string }>(
  'projects/getProjectTracks',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/tracks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch project tracks');
      const data = await res.json();
      return data.tracks;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch number of projects by track
export const getProjectsByTrack = createAsyncThunk<ProjectsByTrack[], void, { rejectValue: string }>(
  'projects/getProjectsByTrack',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectTracks`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch projects by track');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch number of projects created per day
export const getProjectsCreatedPerDay = createAsyncThunk<ProjectsCreatedPerDay[], void, { rejectValue: string }>(
  'projects/getProjectsCreatedPerDay',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectsCreatedPerDay`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch projects created per day');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch number of projects by status
export const getProjectsCountByStatus = createAsyncThunk<ProjectsCountByStatus[], void, { rejectValue: string }>(
  'projects/getProjectsCountByStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getProjectsCountByStatus`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch projects count by status');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch top projects by technical score
export const getTopTechnicalProjects = createAsyncThunk<TopProjectsResponse, GetTopProjectsParams | void, { rejectValue: string }>(
  'projects/getTopTechnicalProjects',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.page !== undefined) q.append('page', String(params.page));
        if (params.limit !== undefined) q.append('limit', String(params.limit));
        if (params.sort) q.append('sort', params.sort);
        if (params.track) q.append('track', params.track);
        if (params.name) q.append('name', params.name);
        query = '?' + q.toString();
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getAllProjects${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch top technical projects');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Thunk to fetch top projects by business score
export const getTopBusinessProjects = createAsyncThunk<TopProjectsResponse, GetTopProjectsParams | void, { rejectValue: string }>(
  'projects/getTopBusinessProjects',
  async (params, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      let query = '';
      if (params) {
        const q = new URLSearchParams();
        if (params.page !== undefined) q.append('page', String(params.page));
        if (params.limit !== undefined) q.append('limit', String(params.limit));
        if (params.sort) q.append('sort', params.sort);
        if (params.track) q.append('track', params.track);
        if (params.name) q.append('name', params.name);
        query = '?' + q.toString();
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/getAllProjects${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to fetch top business projects');
      return await res.json();
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

// Async thunk to decode token
export const decodeInvitationToken = createAsyncThunk<
  InvitationData,
  string,
  { rejectValue: string }
>('invitation/decodeInvitationToken', async (token, { rejectWithValue }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/memberTokenData/${token}`)
    if (!res.ok) throw new Error('Failed to fetch top business projects');
      return await res.json();
  } catch (error: any) {
    const message =
      error.response?.data?.message || error.message || 'Failed to decode token'
    return rejectWithValue(message)
  }
})

// Add missing interfaces for innovation, trackAlignment, hederaEcosystemImpact
export interface Innovation {
  addedValues: string[];
  mentionnedInnovationAspects?: string[];
  approvedInnovationAspects?: string[];
  explanation?: string[];
  judgement?: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface TrackAlignment {
  track: string;
  explanation?: string[];
  judgement?: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export interface HederaEcosystemImpact {
  explanation?: string[];
  judgement?: string[];
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendation?: string[];
}

export const evaluateProjectCode = createAsyncThunk<
  { codeQualityScore: number },
  { projectId: string; githubLink: string },
  { rejectValue: string }
>(
  'projects/evaluateProjectCode',
  async ({ projectId, githubLink }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}repo-analyzer/analyze/${projectId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ githubLink, template: 'auto', hackathonName: 'HederaHacks' }),
      });
      if (!response.ok) {
        const error = await response.text();
        return rejectWithValue(error || 'Failed to evaluate code');
      }
      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to evaluate code');
    }
  }
);

export const downloadProjectPdf = createAsyncThunk<Blob, any, { rejectValue: string }>(
  'projects/downloadProjectPdf',
  async (projectId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('api_token');
      if (!token) return rejectWithValue('No authentication token found');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}project/${projectId}/export-pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      return blob;
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
      })
      .addCase(getProjectStats.fulfilled, (state, action: PayloadAction<ProjectStats>) => {
        state.stats = action.payload;
      })
      .addCase(getProjectTracks.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.tracks = action.payload;
      })
      .addCase(getProjectsByTrack.fulfilled, (state, action: PayloadAction<ProjectsByTrack[]>) => {
        state.projectsByTrack = action.payload;
      })
      .addCase(getProjectsCreatedPerDay.fulfilled, (state, action: PayloadAction<ProjectsCreatedPerDay[]>) => {
        state.projectsCreatedPerDay = action.payload;
      })
      .addCase(getProjectsCountByStatus.fulfilled, (state, action: PayloadAction<ProjectsCountByStatus[]>) => {
        state.projectsCountByStatus = action.payload;
      })
      .addCase(getTopTechnicalProjects.pending, (state) => {
        state.topTechnicalProjects.loading = true;
        state.topTechnicalProjects.error = null;
      })
      .addCase(getTopTechnicalProjects.fulfilled, (state, action: PayloadAction<TopProjectsResponse>) => {
        state.topTechnicalProjects.loading = false;
        state.topTechnicalProjects.data = action.payload.projects;
        state.topTechnicalProjects.total = action.payload.total;
        state.topTechnicalProjects.totalPages = action.payload.totalPages;
      })
      .addCase(getTopTechnicalProjects.rejected, (state, action) => {
        state.topTechnicalProjects.loading = false;
        state.topTechnicalProjects.error = action.payload as string;
      })
      .addCase(getTopBusinessProjects.pending, (state) => {
        state.topBusinessProjects.loading = true;
        state.topBusinessProjects.error = null;
      })
      .addCase(getTopBusinessProjects.fulfilled, (state, action: PayloadAction<TopProjectsResponse>) => {
        state.topBusinessProjects.loading = false;
        state.topBusinessProjects.data = action.payload.projects;
        state.topBusinessProjects.total = action.payload.total;
        state.topBusinessProjects.totalPages = action.payload.totalPages;
      })
      .addCase(getTopBusinessProjects.rejected, (state, action) => {
        state.topBusinessProjects.loading = false;
        state.topBusinessProjects.error = action.payload as string;
      })
      .addCase(decodeInvitationToken.pending, state => {
        state.invitationData.loading = true
        state.invitationData.error = null
      })
      .addCase(decodeInvitationToken.fulfilled, (state, action) => {
        state.invitationData.loading = false
        state.invitationData.data = action.payload
      })
      .addCase(decodeInvitationToken.rejected, (state, action) => {
        state.invitationData.loading = false
        state.invitationData.error = action.payload || 'Unknown error'
      });
  },
});

export default projectSlice.reducer;

export const selectTotalProjects = (state: { project: ProjectState }) => state.project.total;
export const selectTotalPages = (state: { project: ProjectState }) => state.project.totalPages;
export const selectProjectStats = (state: { project: ProjectState }) => state.project.stats;
export const selectProjectTracks = (state: { project: ProjectState }) => state.project.tracks;
export const selectProjectsByTrack = (state: { project: ProjectState }) => state.project.projectsByTrack;
export const selectProjectsCreatedPerDay = (state: { project: ProjectState }) => state.project.projectsCreatedPerDay;
export const selectProjectsCountByStatus = (state: { project: ProjectState }) => state.project.projectsCountByStatus;
export const selectTopTechnicalProjects = (state: { project: ProjectState }) => state.project.topTechnicalProjects;
export const selectTopBusinessProjects = (state: { project: ProjectState }) => state.project.topBusinessProjects;
export const selectInvitationData = (state: { project: ProjectState }) => state.project.invitationData;
