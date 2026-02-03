import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

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

interface Assessment {
  _id: string;
  jobId?: any;
  jobName?: string;
  jobDescription?: string;
  numberOfAttempts: number;
  averageScore: number;
  totalQuestions: number;
  assessments: any[];
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
  assessments: Assessment[];
  assessmentsLoading: boolean;
  assessmentsError: string | null;
  permissionsSaving: boolean;
  permissionsError: string | null;
  users: AdminUser[];
  usersLoading: boolean;
  usersError: string | null;
  totalUsers: number;
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
  assessments: [],
  assessmentsLoading: false,
  assessmentsError: null,
  permissionsSaving: false,
  permissionsError: null,
  users: [],
  usersLoading: false,
  usersError: null,
  totalUsers: 0,
};

// ─── Helper ──────────────────────────────────────────────

const getToken = () => localStorage.getItem("api_token");

// ─── Thunks ──────────────────────────────────────────────

export const fetchAdminStats = createAsyncThunk<
  DashboardStats,
  undefined,
  { rejectValue: string }
>("admin/fetchStats", async (_, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getCounts`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
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
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?limit=1000`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data?.users || [];
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
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getUserCountsByDay`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
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

export const fetchAdminAssessments = createAsyncThunk<
  Assessment[],
  undefined,
  { rejectValue: string }
>("admin/fetchAssessments", async (_, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/job-assessment-results-grouped`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return data.results || [];
  } catch (error: any) {
    return rejectWithValue(error.message || "Error fetching assessments");
  }
});

export const fetchAdminUsers = createAsyncThunk<
  { users: AdminUser[]; total: number },
  FetchUsersParams,
  { rejectValue: string }
>("admin/fetchUsers", async (params, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found");
    const queryParams = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 10),
    });
    if (params.username) queryParams.append("username", params.username);
    if (params.email) queryParams.append("email", params.email);
    if (params.role) queryParams.append("role", params.role);
    if (params.status) queryParams.append("status", params.status);
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/getAllUsers?${queryParams.toString()}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) throw new Error(`Failed to fetch users: ${res.status}`);
    const data = await res.json();
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
      const token = getToken();
      if (!token) throw new Error("Authentication required");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}admin/companies/${companyId}/permissions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ permissions }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update permissions");
      }
      return await response.json();
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

    // Assessments
    builder
      .addCase(fetchAdminAssessments.pending, (state) => {
        state.assessmentsLoading = true;
        state.assessmentsError = null;
      })
      .addCase(fetchAdminAssessments.fulfilled, (state, action) => {
        state.assessmentsLoading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAdminAssessments.rejected, (state, action) => {
        state.assessmentsLoading = false;
        state.assessmentsError = action.payload || "Error fetching assessments";
        state.assessments = [];
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
  state.admin.assessments;
export const selectAdminAssessmentsLoading = (state: RootState) =>
  state.admin.assessmentsLoading;
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
