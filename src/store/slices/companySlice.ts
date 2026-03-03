import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

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
      const token = Cookies.get("api_token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}dashboard/statsCards`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      const json = await res.json();
      return json.data as DashboardStats;
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
