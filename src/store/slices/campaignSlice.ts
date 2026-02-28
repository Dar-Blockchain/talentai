import {
  Campaign,
  CampaignMetrics,
  CampaignModule,
  CampaignStatus,
  CreateCampaignPayload,
  CampaignsResponse,
  ModuleType,
} from "@/types/campaign";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () =>
  localStorage.getItem("api_token") ||
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("api_token="))
    ?.split("=")[1] ||
  "";

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}internal-campaigns`;

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCampaigns = createAsyncThunk<
  CampaignsResponse,
  { status?: CampaignStatus; page?: number; limit?: number },
  { rejectValue: string }
>("campaign/fetchCampaigns", async (params, { rejectWithValue }) => {
  try {
    const token = getToken();
    const url = new URL(BASE);

    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.page) url.searchParams.set("page", params.page.toString());
    if (params?.limit) url.searchParams.set("limit", params.limit.toString());

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch campaigns");

    return data as CampaignsResponse;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const createCampaign = createAsyncThunk<
  Campaign,
  CreateCampaignPayload,
  { rejectValue: string }
>("campaign/createCampaign", async (payload, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(BASE, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create campaign");
    return data.data as Campaign;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateCampaignStatus = createAsyncThunk<
  Campaign,
  { campaignId: string; status: CampaignStatus },
  { rejectValue: string }
>(
  "campaign/updateStatus",
  async ({ campaignId, status }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/${campaignId}/status`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update status");
      return data.data as Campaign;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const deleteCampaign = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("campaign/deleteCampaign", async (campaignId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete campaign");
    return campaignId;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchCampaignById = createAsyncThunk<
  Campaign,
  string,
  { rejectValue: string }
>("campaign/fetchCampaignById", async (campaignId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch campaign");
    return data.data as Campaign;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateModuleConfig = createAsyncThunk<
  Campaign,
  { campaignId: string; moduleType: ModuleType; config: NonNullable<CampaignModule["config"]> },
  { rejectValue: string }
>(
  "campaign/updateModuleConfig",
  async ({ campaignId, moduleType, config }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const res = await fetch(`${BASE}/${campaignId}/modules/${moduleType}/config`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ config }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update module config");
      return data.data as Campaign;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

export const fetchCampaignMetrics = createAsyncThunk<
  CampaignMetrics,
  void,
  { rejectValue: string }
>("campaign/fetchMetrics", async (_, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch metrics");

    return data.data as CampaignMetrics;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface CampaignState {
  campaigns: Campaign[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  createError: string | null;
  createSuccess: boolean;
  selectedCampaign: Campaign | null;
  detailLoading: boolean;
  detailError: string | null;

  savingConfig: boolean;
  saveConfigError: string | null;

  metrics: CampaignMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;

  page: number;
  limit: number;
  count: number;
}

const initialState: CampaignState = {
  campaigns: [],
  loading: false,
  creating: false,
  error: null,
  createError: null,
  createSuccess: false,
  selectedCampaign: null,
  detailLoading: false,
  detailError: null,

  savingConfig: false,
  saveConfigError: null,

  metrics: null,
  metricsLoading: false,
  metricsError: null,

  page: 1,
  limit: 6,
  count: 0,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setLimit(state, action: PayloadAction<number>) {
      state.limit = action.payload;
    },
    clearCreateStatus(state) {
      state.createSuccess = false;
      state.createError = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearSelectedCampaign(state) {
      state.selectedCampaign = null;
      state.detailError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchCampaigns
    builder
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCampaigns.fulfilled,
        (state, action: PayloadAction<CampaignsResponse>) => {
          state.loading = false;
          state.campaigns = action.payload.data;
          state.page = action.payload.pagination.page;
          state.limit = action.payload.pagination.limit;
          state.count = action.payload.pagination.total;
        },
      )
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Error fetching campaigns";
      });

    // createCampaign
    builder
      .addCase(createCampaign.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(
        createCampaign.fulfilled,
        (state, action: PayloadAction<Campaign>) => {
          state.creating = false;
          state.createSuccess = true;
          state.campaigns.unshift(action.payload);
        },
      )
      .addCase(createCampaign.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Error creating campaign";
      });

    // updateCampaignStatus
    builder.addCase(
      updateCampaignStatus.fulfilled,
      (state, action: PayloadAction<Campaign>) => {
        const idx = state.campaigns.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (idx !== -1) state.campaigns[idx] = action.payload;
        state.selectedCampaign.status = action.payload.status;
      },
    );

    // deleteCampaign
    builder.addCase(
      deleteCampaign.fulfilled,
      (state, action: PayloadAction<string>) => {
        state.campaigns = state.campaigns.filter(
          (c) => c._id !== action.payload,
        );
      },
    );

    // updateModuleConfig
    builder
      .addCase(updateModuleConfig.pending, (state) => {
        state.savingConfig = true;
        state.saveConfigError = null;
      })
      .addCase(updateModuleConfig.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.savingConfig = false;
        state.selectedCampaign = action.payload;
        const idx = state.campaigns.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
      })
      .addCase(updateModuleConfig.rejected, (state, action) => {
        state.savingConfig = false;
        state.saveConfigError = action.payload || "Failed to save module configuration";
      });

    // fetchCampaignById
    builder
      .addCase(fetchCampaignById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(
        fetchCampaignById.fulfilled,
        (state, action: PayloadAction<Campaign>) => {
          state.detailLoading = false;
          state.selectedCampaign = action.payload;
        },
      )
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to load campaign";
      });

    // fetchCampaignMetrics
    builder
      .addCase(fetchCampaignMetrics.pending, (state) => {
        state.metricsLoading = true;
        state.metricsError = null;
      })
      .addCase(
        fetchCampaignMetrics.fulfilled,
        (state, action: PayloadAction<CampaignMetrics>) => {
          state.metricsLoading = false;
          state.metrics = action.payload;
        },
      )
      .addCase(fetchCampaignMetrics.rejected, (state, action) => {
        state.metricsLoading = false;
        state.metricsError = action.payload || "Failed to load metrics";
      });
  },
});

export const { clearCreateStatus, clearError, clearSelectedCampaign, setPage, setLimit } =
  campaignSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCampaigns = (state: any) =>
  state.campaign.campaigns as Campaign[];
export const selectCampaignLoading = (state: any) =>
  state.campaign.loading as boolean;
export const selectCampaignCreating = (state: any) =>
  state.campaign.creating as boolean;
export const selectCampaignError = (state: any) =>
  state.campaign.error as string | null;
export const selectCreateSuccess = (state: any) =>
  state.campaign.createSuccess as boolean;
export const selectCreateError = (state: any) =>
  state.campaign.createError as string | null;
export const selectSelectedCampaign = (state: any) =>
  state.campaign.selectedCampaign as Campaign | null;
export const selectDetailLoading = (state: any) =>
  state.campaign.detailLoading as boolean;
export const selectDetailError = (state: any) =>
  state.campaign.detailError as string | null;
export const selectSavingConfig = (state: any) =>
  state.campaign.savingConfig as boolean;
export const selectSaveConfigError = (state: any) =>
  state.campaign.saveConfigError as string | null;

export const selectCampaignPage = (state: any) => state.campaign.page as number;
export const selectCampaignLimit = (state: any) => state.campaign.limit as number;
export const selectCampaignCount = (state: any) => state.campaign.count as number;

export const selectCampaignMetrics = (state: any) =>
  state.campaign.metrics as CampaignMetrics | null;

export const selectCampaignMetricsLoading = (state: any) =>
  state.campaign.metricsLoading as boolean;

export const selectCampaignMetricsError = (state: any) =>
  state.campaign.metricsError as string | null;

export default campaignSlice.reducer;
