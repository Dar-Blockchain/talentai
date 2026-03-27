import {
  Campaign,
  CampaignMetrics,
  CampaignModule,
  CampaignParticipant,
  CampaignSession,
  CampaignStatus,
  CampaignType,
  AnonymityMode,
  CreateCampaignPayload,
  CampaignsResponse,
  ParticipantStatus,
  NonParticipant,
} from "@/types/campaign";

// ─── Employee campaign entry (campaign + participant context) ─────────────────

export interface EmployeeCampaignEntry {
  campaignId: string;
  title: string;
  description?: string;
  type: CampaignType;
  status: CampaignStatus;
  anonymityMode: AnonymityMode;
  module: CampaignModule;
  deadline?: string;
  company: string | { _id: string; name: string };
  participantStatus: ParticipantStatus;
  accessedAt?: string;
  completedAt?: string;
  joinedAt?: string;
  score?: number;
  progress?: number;
  totalParticipants?: number;
}
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchCampaigns = createAsyncThunk<
  CampaignsResponse,
  { status?: CampaignStatus; page?: number; limit?: number; search?: string; period?: string },
  { rejectValue: string }
>("campaign/fetchCampaigns", async (params, { rejectWithValue }) => {
  try {
    const p: Record<string, any> = {};
    if (params?.status) p.status = params.status;
    if (params?.page)   p.page   = params.page;
    if (params?.limit)  p.limit  = params.limit;
    if (params?.search) p.search = params.search;
    if (params?.period) p.period = params.period;
    const response = await axiosInstance.get("internal-campaigns", { params: p });
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
    const payload = response.data.data; // { total, page, limit, pages, data: [...] }
    return { data: payload.data as CampaignParticipant[], total: payload.total ?? payload.data?.length ?? 0 };
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

export interface EmployeeCampaignFilters {
  userId: string;
  search?: string;
  participantStatus?: string;
  period?: string;
}

export const fetchEmployeeCampaigns = createAsyncThunk<
  EmployeeCampaignEntry[],
  EmployeeCampaignFilters,
  { rejectValue: string }
>("campaign/fetchEmployeeCampaigns", async ({ userId, search, participantStatus, period }, { rejectWithValue }) => {
  try {
    const params: Record<string, string> = {};
    if (search)            params.search            = search;
    if (participantStatus) params.participantStatus = participantStatus;
    if (period)            params.period            = period;
    const response = await axiosInstance.get(`internal-campaigns/employee/${userId}`, { params });
    return response.data.data as EmployeeCampaignEntry[];
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchEmployeeCampaignMetrics = createAsyncThunk<
  { total: number; invited: number; inProgress: number; completed: number },
  string,
  { rejectValue: string }
>("campaign/fetchEmployeeCampaignMetrics", async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`internal-campaigns/employee/${userId}/metrics`);
    return response.data.data;
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const fetchNonParticipants = createAsyncThunk<
  { data: NonParticipant[]; total: number },
  {
    campaignId: string;
    search?: string;
    department?: string;
    role?: string;
    sortBy?: string;
    order?: string;
    page?: number;
    limit?: number;
  },
  { rejectValue: string }
>("campaign/fetchNonParticipants", async ({ campaignId, ...params }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`internal-campaigns/${campaignId}/non-participants`, { params });
    const payload = response.data.data;
    return { data: payload.data as NonParticipant[], total: payload.total ?? 0 };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});

export const addCampaignParticipant = createAsyncThunk<
  CampaignParticipant,
  { campaignId: string; employeeId: string },
  { rejectValue: string }
>("campaign/addParticipant", async ({ campaignId, employeeId }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post(`internal-campaigns/${campaignId}/participate/${employeeId}`);
    return response.data.data as CampaignParticipant;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
  }
});

export const removeCampaignParticipant = createAsyncThunk<
  string,
  { campaignId: string; participantId: string },
  { rejectValue: string }
>("campaign/removeParticipant", async ({ campaignId, participantId }, { rejectWithValue }) => {
  try {
    await axiosInstance.delete(`internal-campaigns/${campaignId}/participate/${participantId}`);
    return participantId;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message ?? err.message);
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

  employeeCampaigns: EmployeeCampaignEntry[];
  employeeCampaignsLoading: boolean;
  employeeCampaignsError: string | null;

  employeeMetrics: { total: number; invited: number; inProgress: number; completed: number } | null;
  employeeMetricsLoading: boolean;

  participantActionLoading: boolean;
  participantActionError: string | null;

  nonParticipants: NonParticipant[];
  nonParticipantsLoading: boolean;
  nonParticipantsError: string | null;
  nonParticipantsTotal: number;
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

  employeeCampaigns: [],
  employeeCampaignsLoading: false,
  employeeCampaignsError: null,

  employeeMetrics: null,
  employeeMetricsLoading: false,

  participantActionLoading: false,
  participantActionError: null,

  nonParticipants: [],
  nonParticipantsLoading: false,
  nonParticipantsError: null,
  nonParticipantsTotal: 0,
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

    // fetchEmployeeCampaigns
    builder
      .addCase(fetchEmployeeCampaigns.pending, (state) => {
        state.employeeCampaignsLoading = true;
        state.employeeCampaignsError = null;
      })
      .addCase(fetchEmployeeCampaigns.fulfilled, (state, action) => {
        state.employeeCampaignsLoading = false;
        state.employeeCampaigns = action.payload;
      })
      .addCase(fetchEmployeeCampaigns.rejected, (state, action) => {
        state.employeeCampaignsLoading = false;
        state.employeeCampaignsError = action.payload || "Failed to load employee campaigns";
      });

    // fetchEmployeeCampaignMetrics
    builder
      .addCase(fetchEmployeeCampaignMetrics.pending, (state) => {
        state.employeeMetricsLoading = true;
      })
      .addCase(fetchEmployeeCampaignMetrics.fulfilled, (state, action) => {
        state.employeeMetricsLoading = false;
        state.employeeMetrics = action.payload;
      })
      .addCase(fetchEmployeeCampaignMetrics.rejected, (state) => {
        state.employeeMetricsLoading = false;
      });

    // fetchNonParticipants
    builder
      .addCase(fetchNonParticipants.pending, (state) => {
        state.nonParticipantsLoading = true;
        state.nonParticipantsError = null;
      })
      .addCase(fetchNonParticipants.fulfilled, (state, action) => {
        state.nonParticipantsLoading = false;
        state.nonParticipants = action.payload.data;
        state.nonParticipantsTotal = action.payload.total;
      })
      .addCase(fetchNonParticipants.rejected, (state, action) => {
        state.nonParticipantsLoading = false;
        state.nonParticipantsError = action.payload || "Failed to load employees";
      });

    // addCampaignParticipant
    builder
      .addCase(addCampaignParticipant.pending, (state) => {
        state.participantActionLoading = true;
        state.participantActionError = null;
      })
      .addCase(addCampaignParticipant.fulfilled, (state, action) => {
        state.participantActionLoading = false;
        state.participants.unshift(action.payload);
        state.participantsTotal += 1;
        // action.meta.arg carries the original { campaignId, employeeId } — use employeeId (User _id)
        // to remove the employee from the non-participants list immediately
        const addedUserId = action.meta.arg.employeeId;
        state.nonParticipants = state.nonParticipants.filter((e) => e._id !== addedUserId);
        state.nonParticipantsTotal = Math.max(0, state.nonParticipantsTotal - 1);
      })
      .addCase(addCampaignParticipant.rejected, (state, action) => {
        state.participantActionLoading = false;
        state.participantActionError = action.payload || "Failed to add participant";
      });

    // removeCampaignParticipant
    builder
      .addCase(removeCampaignParticipant.pending, (state) => {
        state.participantActionLoading = true;
        state.participantActionError = null;
      })
      .addCase(removeCampaignParticipant.fulfilled, (state, action) => {
        state.participantActionLoading = false;
        state.participants = state.participants.filter((p) => p._id !== action.payload);
        state.participantsTotal = Math.max(0, state.participantsTotal - 1);
      })
      .addCase(removeCampaignParticipant.rejected, (state, action) => {
        state.participantActionLoading = false;
        state.participantActionError = action.payload || "Failed to remove participant";
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

export const selectEmployeeCampaigns = (state: any) =>
  state.campaign.employeeCampaigns as Campaign[];
export const selectEmployeeCampaignsLoading = (state: any) =>
  state.campaign.employeeCampaignsLoading as boolean;
export const selectEmployeeCampaignsError = (state: any) =>
  state.campaign.employeeCampaignsError as string | null;

export const selectParticipantActionLoading = (state: any) =>
  state.campaign.participantActionLoading as boolean;
export const selectParticipantActionError = (state: any) =>
  state.campaign.participantActionError as string | null;

export const selectNonParticipants = (state: any) =>
  state.campaign.nonParticipants as NonParticipant[];
export const selectNonParticipantsLoading = (state: any) =>
  state.campaign.nonParticipantsLoading as boolean;
export const selectNonParticipantsError = (state: any) =>
  state.campaign.nonParticipantsError as string | null;
export const selectNonParticipantsTotal = (state: any) =>
  state.campaign.nonParticipantsTotal as number;

export default campaignSlice.reducer;
