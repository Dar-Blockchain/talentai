import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ParticipantStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Participant {
  _id: string;
  campaign: string;
  employee?: string | null;
  email?: string | null;
  anonymousToken?: string | null;
  status: ParticipantStatus;
  accessedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddParticipantPayload {
  campaignId: string;
  email?: string;
  employeeId?: string;
  anonymousToken?: string;
}

export interface BulkAddPayload {
  campaignId: string;
  participants: Array<{ email?: string; employeeId?: string; anonymousToken?: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getToken = () =>
  localStorage.getItem("api_token") ||
  document.cookie
    .split("; ")
    .find((r) => r.startsWith("api_token="))
    ?.split("=")[1] ||
  "";

/**
 * Generate a cryptographically random anonymous token (16 bytes → 32 hex chars).
 * Falls back to Math.random when crypto is unavailable (SSR).
 */
export const generateAnonymousToken = (): string => {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const arr = new Uint8Array(16);
    window.crypto.getRandomValues(arr);
    return Array.from(arr)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback
  return Array.from({ length: 32 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
};

const BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}campaign-participants`;

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchParticipants = createAsyncThunk<
  { campaignId: string; participants: Participant[] },
  string,
  { rejectValue: string }
>("participant/fetchParticipants", async (campaignId, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}/participants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch participants");
    return { campaignId, participants: data.data as Participant[] };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addParticipant = createAsyncThunk<
  { campaignId: string; participant: Participant },
  AddParticipantPayload,
  { rejectValue: string }
>("participant/addParticipant", async ({ campaignId, ...body }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}/participants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add participant");
    return { campaignId, participant: data.data as Participant };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const addAnonymousParticipant = createAsyncThunk<
  { campaignId: string; participant: Participant; anonymousToken: string },
  { campaignId: string; anonymousToken: string },
  { rejectValue: string }
>("participant/addAnonymous", async ({ campaignId, anonymousToken }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}/participants`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ anonymousToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to add anonymous participant");
    return { campaignId, participant: data.data as Participant, anonymousToken };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const bulkAddParticipants = createAsyncThunk<
  { campaignId: string; participants: Participant[] },
  BulkAddPayload,
  { rejectValue: string }
>("participant/bulkAdd", async ({ campaignId, participants }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${campaignId}/participants/bulk`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ participants }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to bulk add participants");
    return { campaignId, participants: data.data as Participant[] };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

export const removeParticipant = createAsyncThunk<
  { campaignId: string; participantId: string },
  { campaignId: string; participantId: string },
  { rejectValue: string }
>("participant/remove", async ({ campaignId, participantId }, { rejectWithValue }) => {
  try {
    const token = getToken();
    const res = await fetch(`${BASE}/${participantId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to remove participant");
    return { campaignId, participantId };
  } catch (err: any) {
    return rejectWithValue(err.message);
  }
});

// ─── State ────────────────────────────────────────────────────────────────────

interface ParticipantState {
  // keyed by campaignId
  byCampaign: Record<string, Participant[]>;
  loading: Record<string, boolean>;
  adding: boolean;
  addError: string | null;
  addSuccess: boolean;
  error: string | null;
}

const initialState: ParticipantState = {
  byCampaign: {},
  loading: {},
  adding: false,
  addError: null,
  addSuccess: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const participantSlice = createSlice({
  name: "participant",
  initialState,
  reducers: {
    clearAddStatus(state) {
      state.addSuccess = false;
      state.addError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchParticipants
    builder
      .addCase(fetchParticipants.pending, (state, action) => {
        state.loading[action.meta.arg] = true;
        state.error = null;
      })
      .addCase(fetchParticipants.fulfilled, (state, action) => {
        state.loading[action.payload.campaignId] = false;
        state.byCampaign[action.payload.campaignId] = action.payload.participants;
      })
      .addCase(fetchParticipants.rejected, (state, action) => {
        state.loading[action.meta.arg] = false;
        state.error = action.payload || "Failed to load participants";
      });

    // addParticipant
    builder
      .addCase(addParticipant.pending, (state) => {
        state.adding = true;
        state.addError = null;
        state.addSuccess = false;
      })
      .addCase(addParticipant.fulfilled, (state, action) => {
        state.adding = false;
        state.addSuccess = true;
        const { campaignId, participant } = action.payload;
        if (!state.byCampaign[campaignId]) state.byCampaign[campaignId] = [];
        state.byCampaign[campaignId].unshift(participant);
      })
      .addCase(addParticipant.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload || "Failed to add participant";
      });

    // bulkAddParticipants
    builder
      .addCase(bulkAddParticipants.pending, (state) => {
        state.adding = true;
        state.addError = null;
        state.addSuccess = false;
      })
      .addCase(bulkAddParticipants.fulfilled, (state, action) => {
        state.adding = false;
        state.addSuccess = true;
        const { campaignId, participants } = action.payload;
        if (!state.byCampaign[campaignId]) state.byCampaign[campaignId] = [];
        state.byCampaign[campaignId] = [...participants, ...state.byCampaign[campaignId]];
      })
      .addCase(bulkAddParticipants.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload || "Failed to add participants";
      });

    // addAnonymousParticipant
    builder
      .addCase(addAnonymousParticipant.pending, (state) => {
        state.adding = true;
        state.addError = null;
        state.addSuccess = false;
      })
      .addCase(addAnonymousParticipant.fulfilled, (state, action) => {
        state.adding = false;
        state.addSuccess = true;
        const { campaignId, participant } = action.payload;
        if (!state.byCampaign[campaignId]) state.byCampaign[campaignId] = [];
        state.byCampaign[campaignId].unshift(participant);
      })
      .addCase(addAnonymousParticipant.rejected, (state, action) => {
        state.adding = false;
        state.addError = action.payload || "Failed to add anonymous participant";
      });

    // removeParticipant
    builder.addCase(removeParticipant.fulfilled, (state, action) => {
      const { campaignId, participantId } = action.payload;
      if (state.byCampaign[campaignId]) {
        state.byCampaign[campaignId] = state.byCampaign[campaignId].filter(
          (p) => p._id !== participantId
        );
      }
    });
  },
});

export const { clearAddStatus } = participantSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectParticipants = (campaignId: string) => (state: any) =>
  (state.participant.byCampaign[campaignId] ?? []) as Participant[];

export const selectParticipantsLoading = (campaignId: string) => (state: any) =>
  (state.participant.loading[campaignId] ?? false) as boolean;

export const selectParticipantAdding = (state: any) => state.participant.adding as boolean;
export const selectParticipantAddError = (state: any) => state.participant.addError as string | null;
export const selectParticipantAddSuccess = (state: any) => state.participant.addSuccess as boolean;

export default participantSlice.reducer;
