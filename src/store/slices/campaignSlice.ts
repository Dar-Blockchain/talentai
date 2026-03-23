import {
  Campaign,
  CampaignMetrics,
  CampaignParticipant,
  CampaignSession,
  CampaignStatus,
  CreateCampaignPayload,
  CampaignsResponse,
} from "@/types/campaign";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCampaigns = createAsyncThunk<
  CampaignsResponse,
  { status?: CampaignStatus; page?: number; limit?: number },
  { rejectValue: string }
>("campaign/fetchCampaigns", async (params, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("internal-campaigns", {
      params: {
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.page ? { page: params.page } : {}),
        ...(params?.limit ? { limit: params.limit } : {}),
      },
    });
    return response.data as CampaignsResponse;
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
    const response = await axiosInstance.post("internal-campaigns", payload);
    return response.data.data as Campaign;
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
      const response = await axiosInstance.patch(`internal-campaigns/${campaignId}/status`, { status });
      return response.data.data as Campaign;
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
    await axiosInstance.delete(`internal-campaigns/${campaignId}`);
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
    const response = await axiosInstance.get(`internal-campaigns/${campaignId}`);
    return response.data.data as Campaign;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const updateCampaign = createAsyncThunk<
  Campaign,
  { campaignId: string; updatePayload: Partial<Campaign> },
  { rejectValue: string }
>(
  "campaign/updateCampaign",
  async ({ campaignId, updatePayload }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`internal-campaigns/${campaignId}`, { ...updatePayload });
      return response.data.data as Campaign;
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
    const response = await axiosInstance.get("internal-campaigns/metrics");
    return response.data.data as CampaignMetrics;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchCampaignParticipants = createAsyncThunk<
  { data: CampaignParticipant[]; total: number },
  { campaignId: string; search?: string; page?: number; limit?: number },
  { rejectValue: string }
>("campaign/fetchParticipants", async ({ campaignId, ...params }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`internal-campaigns/${campaignId}/participants`, { params });
    return { data: response.data.data as CampaignParticipant[], total: response.data.count ?? response.data.total ?? response.data.data?.length ?? 0 };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchCampaignSessions = createAsyncThunk<
  { data: CampaignSession[]; total: number },
  { campaignId: string; search?: string; page?: number; limit?: number },
  { rejectValue: string }
>("campaign/fetchSessions", async ({ campaignId, ...params }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`internal-campaigns/${campaignId}/sessions`, { params });
    return { data: response.data.data as CampaignSession[], total: response.data.total ?? response.data.data?.length ?? 0 };
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

  savingLoading: boolean;
  saveError: string | null;

  metrics: CampaignMetrics | null;
  metricsLoading: boolean;
  metricsError: string | null;

  page: number;
  limit: number;
  count: number;

  participants: CampaignParticipant[];
  participantsLoading: boolean;
  participantsError: string | null;
  participantsTotal: number;

  sessions: CampaignSession[];
  sessionsLoading: boolean;
  sessionsError: string | null;
  sessionsTotal: number;
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

  savingLoading: false,
  saveError: null,

  metrics: null,
  metricsLoading: false,
  metricsError: null,

  page: 1,
  limit: 6,
  count: 0,

  participants: [],
  participantsLoading: false,
  participantsError: null,
  participantsTotal: 0,

  sessions: [],
  sessionsLoading: false,
  sessionsError: null,
  sessionsTotal: 0,
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
        if (state.selectedCampaign) {
          state.selectedCampaign.status = action.payload.status;
        }
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

    // updateCampaign
    builder
      .addCase(updateCampaign.pending, (state) => {
        state.savingLoading = true;
        state.saveError = null;
      })
      .addCase(
        updateCampaign.fulfilled,
        (state, action: PayloadAction<Campaign>) => {
          state.savingLoading = false;
          state.selectedCampaign = action.payload;
        },
      )
      .addCase(updateCampaign.rejected, (state, action) => {
        state.savingLoading = false;
        state.saveError = action.payload || "Failed to save campaign";
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

    // fetchCampaignParticipants
    builder
      .addCase(fetchCampaignParticipants.pending, (state) => {
        state.participantsLoading = true;
        state.participantsError = null;
      })
      .addCase(fetchCampaignParticipants.fulfilled, (state, action) => {
        state.participantsLoading = false;
        state.participants = action.payload.data;
        state.participantsTotal = action.payload.total;
      })
      .addCase(fetchCampaignParticipants.rejected, (state, action) => {
        state.participantsLoading = false;
        state.participantsError = action.payload || "Failed to load participants";
      });

    // fetchCampaignSessions
    builder
      .addCase(fetchCampaignSessions.pending, (state) => {
        state.sessionsLoading = true;
        state.sessionsError = null;
      })
      .addCase(fetchCampaignSessions.fulfilled, (state, action) => {
        state.sessionsLoading = false;
        state.sessions = action.payload.data;
        state.sessionsTotal = action.payload.total;
      })
      .addCase(fetchCampaignSessions.rejected, (state, action) => {
        state.sessionsLoading = false;
        state.sessionsError = action.payload || "Failed to load sessions";
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

export const selectCampaignPage = (state: any) => state.campaign.page as number;
export const selectCampaignLimit = (state: any) => state.campaign.limit as number;
export const selectCampaignCount = (state: any) => state.campaign.count as number;

export const selectCampaignMetrics = (state: any) =>
  state.campaign.metrics as CampaignMetrics | null;

export const selectCampaignMetricsLoading = (state: any) =>
  state.campaign.metricsLoading as boolean;

export const selectCampaignMetricsError = (state: any) =>
  state.campaign.metricsError as string | null;

export const selectSavingLoading = (state: any) =>
  state.campaign.savingLoading as boolean;

export const selectSaveError = (state: any) =>
  state.campaign.saveError as string | null;

export const selectCampaignParticipants = (state: any) =>
  state.campaign.participants as CampaignParticipant[];
export const selectCampaignParticipantsLoading = (state: any) =>
  state.campaign.participantsLoading as boolean;
export const selectCampaignParticipantsError = (state: any) =>
  state.campaign.participantsError as string | null;
export const selectCampaignParticipantsTotal = (state: any) =>
  state.campaign.participantsTotal as number;

export const selectCampaignSessions = (state: any) =>
  state.campaign.sessions as CampaignSession[];
export const selectCampaignSessionsLoading = (state: any) =>
  state.campaign.sessionsLoading as boolean;
export const selectCampaignSessionsError = (state: any) =>
  state.campaign.sessionsError as string | null;
export const selectCampaignSessionsTotal = (state: any) =>
  state.campaign.sessionsTotal as number;

export default campaignSlice.reducer;
