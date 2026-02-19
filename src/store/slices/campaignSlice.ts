import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CampaignType =
  | "PRODUCTIVITY_DIAGNOSTIC"
  | "SKILLS_MAPPING"
  | "ENABLEMENT"
  | "CUSTOM";

export type CampaignStatus =
  | "DRAFT"
  | "ACTIVE"
  | "PAUSED"
  | "CLOSED"
  | "EXPIRED";

export type AnonymityMode = "ANONYMOUS" | "NOMINATIVE";
export type AccessMethod = "LINK" | "ACCOUNTS" | "BOTH";
export type ModuleType =
  | "QUESTIONNAIRE"
  | "AI_INTERVIEW"
  | "SKILL_TEST"
  | "TRAINING_PATH";

export interface CampaignModule {
  type: ModuleType;
  config: Record<string, any>;
  order: number;
}

export interface Campaign {
  _id: string;
  company: string;
  title: string;
  type: CampaignType;
  description?: string;
  status: CampaignStatus;
  anonymityMode: AnonymityMode;
  modules: CampaignModule[];
  accessMethod: AccessMethod;
  linkToken?: string | null;
  targetDepartment?: string;
  targetEmployeeCount?: number;
  deadline?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignPayload {
  title: string;
  type: CampaignType;
  description?: string;
  anonymityMode: AnonymityMode;
  modules: CampaignModule[];
  accessMethod: AccessMethod;
  targetDepartment?: string;
  targetEmployeeCount?: number;
  deadline?: string;
}

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
  Campaign[],
  { status?: CampaignStatus } | void,
  { rejectValue: string }
>("campaign/fetchCampaigns", async (params, { rejectWithValue }) => {
  try {
    const token = getToken();
    const url = new URL(BASE);
    if (params?.status) url.searchParams.set("status", params.status);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch campaigns");
    return data.data as Campaign[];
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
>("campaign/updateStatus", async ({ campaignId, status }, { rejectWithValue }) => {
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
});

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
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const campaignSlice = createSlice({
  name: "campaign",
  initialState,
  reducers: {
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
      .addCase(fetchCampaigns.fulfilled, (state, action: PayloadAction<Campaign[]>) => {
        state.loading = false;
        state.campaigns = action.payload;
      })
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
      .addCase(createCampaign.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.creating = false;
        state.createSuccess = true;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Error creating campaign";
      });

    // updateCampaignStatus
    builder
      .addCase(updateCampaignStatus.fulfilled, (state, action: PayloadAction<Campaign>) => {
        const idx = state.campaigns.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.campaigns[idx] = action.payload;
      });

    // deleteCampaign
    builder
      .addCase(deleteCampaign.fulfilled, (state, action: PayloadAction<string>) => {
        state.campaigns = state.campaigns.filter((c) => c._id !== action.payload);
      });

    // fetchCampaignById
    builder
      .addCase(fetchCampaignById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action: PayloadAction<Campaign>) => {
        state.detailLoading = false;
        state.selectedCampaign = action.payload;
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to load campaign";
      });
  },
});

export const { clearCreateStatus, clearError, clearSelectedCampaign } = campaignSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectCampaigns = (state: any) => state.campaign.campaigns as Campaign[];
export const selectCampaignLoading = (state: any) => state.campaign.loading as boolean;
export const selectCampaignCreating = (state: any) => state.campaign.creating as boolean;
export const selectCampaignError = (state: any) => state.campaign.error as string | null;
export const selectCreateSuccess = (state: any) => state.campaign.createSuccess as boolean;
export const selectCreateError = (state: any) => state.campaign.createError as string | null;
export const selectSelectedCampaign = (state: any) => state.campaign.selectedCampaign as Campaign | null;
export const selectDetailLoading = (state: any) => state.campaign.detailLoading as boolean;
export const selectDetailError = (state: any) => state.campaign.detailError as string | null;

export default campaignSlice.reducer;
