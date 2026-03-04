import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

interface DashboardStats {
  totalEmployees: number;
  avgInterviewScore: number;
  activeJobPosts: number;
  activeCampaigns: number;
}

interface CompanyState {
  dashboardStats: {
    data: DashboardStats | null;
    loading: boolean;
    error: string | null;
  };
}

const initialState: CompanyState = {
  dashboardStats: {
    data: null,
    loading: false,
    error: null,
  },
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

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.dashboardStats.loading = true;
        state.dashboardStats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.data = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.dashboardStats.loading = false;
        state.dashboardStats.error = action.payload as string;
      });
  },
});

export default companySlice.reducer;

// Selectors
export const selectDashboardStats = (state: { company: CompanyState }) =>
  state.company.dashboardStats.data;
export const selectDashboardStatsLoading = (state: { company: CompanyState }) =>
  state.company.dashboardStats.loading;
