import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axiosInstance from "@/utils/axiosInstance";

// ─── Types ───────────────────────────────────────────────

interface TopSkill {
  _id: string;
  count: number;
  avgLevel: number;
}

interface DashboardStats {
  users: number;
  posts: number;
  jobAssessments: number;
  jobAssessmentsWithScore: number;
  jobAssessmentsWithScorePercentage: number;
  feedback: number;
  bids: number;
  avgOverallScore: number;
  totalSkills: number;
  totalHardSkills: number;
  totalSoftSkills: number;
  hardSkillsPercentage: number;
  softSkillsPercentage: number;
  topSkills: TopSkill[];
}

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: "Admin" | "Company" | "Candidate" | "jury";
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  ip?: string;
  Localisation?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    location?: string;
    company?: string;
    position?: string;
  };
}

interface FetchUsersParams {
  page?: number;
  limit?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
}

interface AdminState {
  stats: DashboardStats;
  statsLoading: boolean;
  statsError: string | null;
  allUsersForMap: AdminUser[];
  allUsersForMapLoading: boolean;
  userGrowthData: any[];
  userGrowthLoading: boolean;
  skillsData: Array<{ skill: string; count: number }>;
  skillsLoading: boolean;
  permissionsSaving: boolean;
  permissionsError: string | null;
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  totalUsers: number;
  postInterviewAssessments: {
    items: any[];
    total: number;
    loading: boolean;
    error: string | null;
  };
  skillInterviewAssessments: {
    data: any[];
    total: number;
    loading: boolean;
    error: string | null;
  };
}

// ─── Initial State ───────────────────────────────────────

const defaultStats: DashboardStats = {
  users: 0,
  posts: 0,
  jobAssessments: 0,
  jobAssessmentsWithScore: 0,
  jobAssessmentsWithScorePercentage: 0,
  feedback: 0,
  bids: 0,
  avgOverallScore: 0,
  totalSkills: 0,
  totalHardSkills: 0,
  totalSoftSkills: 0,
  hardSkillsPercentage: 0,
  softSkillsPercentage: 0,
  topSkills: [],
};

const initialState: AdminState = {
  stats: defaultStats,
  statsLoading: false,
  statsError: null,
  allUsersForMap: [],
  allUsersForMapLoading: false,
  userGrowthData: [],
  userGrowthLoading: false,
  skillsData: [],
  skillsLoading: false,
  permissionsSaving: false,
  permissionsError: null,
  users: [],
  usersLoading: false,
  usersError: null,
  totalUsers: 0,
  postInterviewAssessments: {
    items: [],
    total: 0,
    loading: false,
    error: null,
  },
  skillInterviewAssessments: {
    data: [],
    total: 0,
    loading: false,
    error: null,
  },
};

// ─── Thunks ──────────────────────────────────────────────

export const fetchAdminStats = createAsyncThunk<
  DashboardStats,
  undefined,
  { rejectValue: string }
>("admin/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("dashboard/getCounts");
    const data = response.data;
    if (data.success && data.data) {
      return {
        users: data.data.users || 0,
        posts: data.data.posts || 0,
        jobAssessments: data.data.jobAssessments || 0,
        jobAssessmentsWithScore: data.data.jobAssessmentsWithScore || 0,
        jobAssessmentsWithScorePercentage:
          data.data.jobAssessmentsWithScorePercentage || 0,
        feedback: data.data.feedback || 0,
        bids: data.data.bids || 0,
        avgOverallScore: data.data.avgOverallScore || 0,
        totalSkills: data.data.totalSkills || 0,
        totalHardSkills: data.data.totalHardSkills || 0,
        totalSoftSkills: data.data.totalSoftSkills || 0,
        hardSkillsPercentage: data.data.hardSkillsPercentage || 0,
        softSkillsPercentage: data.data.softSkillsPercentage || 0,
        topSkills: data.data.topSkills || [],
      } as DashboardStats;
    }
    return defaultStats;
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching stats");
  }
});

export const fetchAllUsersForMap = createAsyncThunk<
  AdminUser[],
  undefined,
  { rejectValue: string }
>("admin/fetchAllUsersForMap", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("dashboard/getAllUsers", { params: { limit: 1000 } });
    return response.data?.users || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching users for map");
  }
});

export const fetchUserGrowthData = createAsyncThunk<
  any[],
  undefined,
  { rejectValue: string }
>("admin/fetchUserGrowthData", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("dashboard/getUserCountsByDay");
    const data = response.data;
    if (data.success && data.data) {
      const processedData = data.data.usersCreatedByDay.map((item: any) => ({
        day: new Date(item.day).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: item.userCount,
        posts: 0,
        assessments: 0,
        fullDate: item.day,
      }));

      if (data.data.postsCreatedByDay) {
        data.data.postsCreatedByDay.forEach((postItem: any) => {
          const existingDay = processedData.find(
            (item: any) => item.fullDate === postItem.day
          );
          if (existingDay) {
            existingDay.posts = postItem.postCount;
          } else {
            processedData.push({
              day: new Date(postItem.day).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }),
              users: 0,
              posts: postItem.postCount,
              assessments: 0,
              fullDate: postItem.day,
            });
          }
        });
      }

      if (data.data.jobAssessmentsCreatedByDay) {
        data.data.jobAssessmentsCreatedByDay.forEach(
          (assessmentItem: any) => {
            const existingDay = processedData.find(
              (item: any) => item.fullDate === assessmentItem.day
            );
            if (existingDay) {
              existingDay.assessments = assessmentItem.jobAssessmentCount;
            } else {
              processedData.push({
                day: new Date(assessmentItem.day).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                users: 0,
                posts: 0,
                assessments: assessmentItem.jobAssessmentCount,
                fullDate: assessmentItem.day,
              });
            }
          }
        );
      }

      processedData.sort(
        (a: any, b: any) =>
          new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
      );

      return processedData;
    }
    return [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching user growth data");
  }
});

export const fetchAdminPostAssessments = createAsyncThunk<
  { items: any[]; total: number },
  { page?: number; limit?: number; company?: string },
  { rejectValue: string }
>("admin/fetchPostAssessments", async (params, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 10, company } = params;
    const response = await axiosInstance.get("post-interview-assessments", {
      params: { page, limit, ...(company ? { company } : {}) },
    });
    const data = response.data;
    const assessments = data.data || data.results || [];
    const total =
      data.pagination?.totalCount ||
      data.total ||
      data.count ||
      data.totalCount ||
      assessments.length;
    return { items: assessments, total };
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching admin assessments");
  }
});

export const fetchAdminSkillAssessments = createAsyncThunk<
  { results: any[]; total: number },
  { page: number; limit: number; skill?: string },
  { rejectValue: string }
>("admin/fetchSkillAssessments", async ({ page, limit, skill }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("skill-interview-assessments", {
      params: { page: page + 1, limit, ...(skill ? { skill } : {}) },
    });
    const data = response.data;
    if (data.success || data.data || data.results) {
      const results = data.data || data.results || [];
      const total =
        data.pagination?.totalCount ||
        data.total ||
        data.count ||
        data.totalCount ||
        results.length;
      return { results, total };
    }
    return rejectWithValue("Failed to fetch skill interview assessments");
  } catch (error: any) {
    return rejectWithValue(
      error.message || "Error fetching skill interview assessments"
    );
  }
});

export const fetchAdminUsers = createAsyncThunk<
  { users: AdminUser[]; total: number },
  FetchUsersParams,
  { rejectValue: string }
>("admin/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("dashboard/getAllUsers", {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        ...(params.username ? { username: params.username } : {}),
        ...(params.email ? { email: params.email } : {}),
        ...(params.role ? { role: params.role } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
    });
    const data = response.data;
    return {
      users: data.users || [],
      total: data.pagination?.totalUsers ?? data.total ?? 0,
    };
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching users");
  }
});

export const saveCompanyPermissions = createAsyncThunk<
  any,
  { companyId: string; permissions: any },
  { rejectValue: string }
>(
  "admin/saveCompanyPermissions",
  async ({ companyId, permissions }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `admin/companies/${companyId}/permissions`,
        { permissions }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Error saving permissions");
    }
  }
);

// ─── Slice ───────────────────────────────────────────────

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchAdminStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
        state.skillsData = (action.payload.topSkills || [])
          .map((item) => ({ skill: item._id, count: item.count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload || "Error fetching stats";
        state.stats = defaultStats;
      });

    // All users for map
    builder
      .addCase(fetchAllUsersForMap.pending, (state) => {
        state.allUsersForMapLoading = true;
      })
      .addCase(fetchAllUsersForMap.fulfilled, (state, action) => {
        state.allUsersForMapLoading = false;
        state.allUsersForMap = action.payload;
      })
      .addCase(fetchAllUsersForMap.rejected, (state) => {
        state.allUsersForMapLoading = false;
        state.allUsersForMap = [];
      });

    // User growth data
    builder
      .addCase(fetchUserGrowthData.pending, (state) => {
        state.userGrowthLoading = true;
      })
      .addCase(fetchUserGrowthData.fulfilled, (state, action) => {
        state.userGrowthLoading = false;
        state.userGrowthData = action.payload;
      })
      .addCase(fetchUserGrowthData.rejected, (state) => {
        state.userGrowthLoading = false;
        state.userGrowthData = [];
      });

    // Post Interview Assessments
    builder
      .addCase(fetchAdminPostAssessments.pending, (state) => {
        state.postInterviewAssessments.loading = true;
        state.postInterviewAssessments.error = null;
      })
      .addCase(fetchAdminPostAssessments.fulfilled, (state, action) => {
        state.postInterviewAssessments.loading = false;
        state.postInterviewAssessments.items = action.payload.items;
        state.postInterviewAssessments.total = action.payload.total;
      })
      .addCase(fetchAdminPostAssessments.rejected, (state, action) => {
        state.postInterviewAssessments.loading = false;
        state.postInterviewAssessments.error =
          action.payload || "Error fetching assessments";
      });

    // Skill Interview Assessments
    builder
      .addCase(fetchAdminSkillAssessments.pending, (state) => {
        state.skillInterviewAssessments.loading = true;
        state.skillInterviewAssessments.error = null;
      })
      .addCase(fetchAdminSkillAssessments.fulfilled, (state, action) => {
        state.skillInterviewAssessments.loading = false;
        state.skillInterviewAssessments.data = action.payload.results;
        state.skillInterviewAssessments.total = action.payload.total;
      })
      .addCase(fetchAdminSkillAssessments.rejected, (state, action) => {
        state.skillInterviewAssessments.loading = false;
        state.skillInterviewAssessments.error =
          action.payload || "Error fetching skill assessments";
        state.skillInterviewAssessments.data = [];
        state.skillInterviewAssessments.total = 0;
      });

    // Users
    builder
      .addCase(fetchAdminUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.total;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload || "Error fetching users";
      });

    // Save permissions
    builder
      .addCase(saveCompanyPermissions.pending, (state) => {
        state.permissionsSaving = true;
        state.permissionsError = null;
      })
      .addCase(saveCompanyPermissions.fulfilled, (state) => {
        state.permissionsSaving = false;
      })
      .addCase(saveCompanyPermissions.rejected, (state, action) => {
        state.permissionsSaving = false;
        state.permissionsError =
          action.payload || "Error saving permissions";
      });
  },
});

// ─── Selectors ───────────────────────────────────────────

export const selectAdminStats = (state: RootState) => state.admin.stats;
export const selectAdminStatsLoading = (state: RootState) =>
  state.admin.statsLoading;
export const selectAdminStatsError = (state: RootState) =>
  state.admin.statsError;
export const selectAllUsersForMap = (state: RootState) =>
  state.admin.allUsersForMap;
export const selectUserGrowthData = (state: RootState) =>
  state.admin.userGrowthData;
export const selectSkillsData = (state: RootState) => state.admin.skillsData;
export const selectAdminAssessments = (state: RootState) =>
  state.admin.postInterviewAssessments.items;
export const selectAdminAssessmentsLoading = (state: RootState) =>
  state.admin.postInterviewAssessments.loading;
export const selectAdminAssessmentsError = (state: RootState) =>
  state.admin.postInterviewAssessments.error;
export const selectAdminAssessmentsTotal = (state: RootState) =>
  state.admin.postInterviewAssessments.total;
export const selectAdminSkillAssessments = (state: RootState) =>
  state.admin.skillInterviewAssessments.data;
export const selectAdminSkillAssessmentsLoading = (state: RootState) =>
  state.admin.skillInterviewAssessments.loading;
export const selectAdminSkillAssessmentsError = (state: RootState) =>
  state.admin.skillInterviewAssessments.error;
export const selectAdminSkillAssessmentsTotal = (state: RootState) =>
  state.admin.skillInterviewAssessments.total;
export const selectSkillDistribution = (state: RootState) => [
  {
    name: "Hard Skills",
    value: state.admin.stats.hardSkillsPercentage || 0,
    color: "#8884d8",
  },
  {
    name: "Soft Skills",
    value: state.admin.stats.softSkillsPercentage || 0,
    color: "#82ca9d",
  },
];
export const selectPermissionsSaving = (state: RootState) =>
  state.admin.permissionsSaving;
export const selectAdminUsers = (state: RootState) => state.admin.users;
export const selectAdminUsersLoading = (state: RootState) =>
  state.admin.usersLoading;
export const selectAdminUsersError = (state: RootState) =>
  state.admin.usersError;
export const selectAdminTotalUsers = (state: RootState) =>
  state.admin.totalUsers;

export default adminSlice.reducer;
