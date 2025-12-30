import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface AgentConfigurationFormValues {
  agentId: string;
  postId: string;
  thresholdPercent?: number;
  bidBudgetMin?: number;
  bidBudgetMax?: number;
  bidStep?: number;
  maxCandidatesToBid?: number;
  agentLifetimeDays?: number;
  bidLifetimeDays?: number;
  autoSubmitTopMatch: boolean;
  maxDailySpending?: number;
  isActive: boolean;
}
// Default config
export const DEFAULT_AGENT_CONFIG: AgentConfigurationFormValues = {
  agentId: "",
  postId: "",
  thresholdPercent: 80,
  bidBudgetMin: 20,
  bidBudgetMax: 500,
  bidStep: 10,
  maxCandidatesToBid: 2,
  agentLifetimeDays: 30,
  bidLifetimeDays: 7,
  autoSubmitTopMatch: true,
  maxDailySpending: 150,
  isActive: true,
};

export interface AgentConfigUpdatePayload {
  thresholdPercent?: number;
  bidBudgetMin?: number;
  bidBudgetMax?: number;
  bidStep?: number;
  maxCandidatesToBid?: number;
  agentLifetimeDays?: number;
  bidLifetimeDays?: number;
  autoSubmitTopMatch?: boolean;
  maxDailySpending?: number;
  isActive?: boolean;
}

interface AgentConfigState {
  updateConfig: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  createConfig: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
    value: AgentConfigurationFormValues;
  };
}

const initialState: AgentConfigState = {
  updateConfig: {
    status: "idle",
    error: null,
  },
  createConfig: {
    status: "idle",
    error: null,
    value: { ...DEFAULT_AGENT_CONFIG },
  },
};

// Async: create agent configuration
export const createAgentConfig = createAsyncThunk(
  "agentConfig/create",
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const state: any = getState();
      const data = state.agentConfig.createConfig.value;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}agent-config/createAgentConfig`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update agent configuration. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async: update agent configuration
export const updateAgentConfig = createAsyncThunk(
  "agentConfig/update",
  async (
    { id, data }: { id: string; data: AgentConfigUpdatePayload },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}agent-config/updateAgentConfig/${id}`,
        data,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update agent configuration. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);

const agentConfigSlice = createSlice({
  name: "agentConfig",
  initialState,
  reducers: {
    resetUpdateStatus: (state) => {
      state.updateConfig.status = "idle";
      state.updateConfig.error = null;
    },
    resetCreateConfig(state) {
      state.createConfig.value = { ...DEFAULT_AGENT_CONFIG };
      state.createConfig.status = "idle";
      state.createConfig.error = null;
    },
    updateCreateConfigValue(
      state,
      action: PayloadAction<Partial<AgentConfigurationFormValues>>
    ) {
      state.createConfig.value = {
        ...state.createConfig.value,
        ...action.payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createAgentConfig.pending, (state) => {
        state.createConfig.status = "loading";
        state.createConfig.error = null;
      })
      .addCase(
        createAgentConfig.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.createConfig.status = "succeeded";
        }
      )
      .addCase(createAgentConfig.rejected, (state, action) => {
        state.createConfig.status = "failed";
        state.createConfig.error = action.payload as string;
      })
      // updateAgentConfig
      .addCase(updateAgentConfig.pending, (state) => {
        state.updateConfig.status = "loading";
        state.updateConfig.error = null;
      })
      .addCase(
        updateAgentConfig.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.updateConfig.status = "succeeded";
        }
      )
      .addCase(updateAgentConfig.rejected, (state, action) => {
        state.updateConfig.status = "failed";
        state.updateConfig.error = action.payload as string;
      });
  },
});

export const { resetCreateConfig, resetUpdateStatus, updateCreateConfigValue } =
  agentConfigSlice.actions;
export default agentConfigSlice.reducer;
