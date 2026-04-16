import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

interface DashboardStats {
  totalEmployees: number;
  avgInterviewScore: number;
  activeJobPosts: number;
  activeCampaigns: number;
}

interface RichStats {
  scoreDistribution: { range: string; count: number }[];
  trend: { _id: string; count: number; avgScore: number }[];
  topJobs: { _id: string; title: string; count: number; avgScore: number }[];
  passRate: number;
  totalInterviews: number;
}

interface CompanyState {
  dashboardStats: { data: DashboardStats | null; loading: boolean; error: string | null };
  richStats: { data: RichStats | null; loading: boolean; error: string | null };
}

const initialState: CompanyState = {
  dashboardStats: { data: null, loading: false, error: null },
  richStats: { data: null, loading: false, error: null },
};

export const fetchDashboardStats = createAsyncThunk(
  "company/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("dashboard/statsCards");
      return response.data.data as DashboardStats;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch dashboard stats");
    }
  }
);

export const fetchRichStats = createAsyncThunk(
  "company/fetchRichStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("dashboard/richStats");
      return response.data.data as RichStats;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch rich stats");
    }
  }
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => { state.dashboardStats.loading = true; state.dashboardStats.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => { state.dashboardStats.loading = false; state.dashboardStats.data = action.payload; })
      .addCase(fetchDashboardStats.rejected, (state, action) => { state.dashboardStats.loading = false; state.dashboardStats.error = action.payload as string; })
      .addCase(fetchRichStats.pending, (state) => { state.richStats.loading = true; state.richStats.error = null; })
      .addCase(fetchRichStats.fulfilled, (state, action) => { state.richStats.loading = false; state.richStats.data = action.payload; })
      .addCase(fetchRichStats.rejected, (state, action) => { state.richStats.loading = false; state.richStats.error = action.payload as string; });
  },
});

export default companySlice.reducer;

export const selectDashboardStats = (state: { company: CompanyState }) => state.company.dashboardStats.data;
export const selectDashboardStatsLoading = (state: { company: CompanyState }) => state.company.dashboardStats.loading;
export const selectRichStats = (state: { company: CompanyState }) => state.company.richStats.data;
export const selectRichStatsLoading = (state: { company: CompanyState }) => state.company.richStats.loading;
