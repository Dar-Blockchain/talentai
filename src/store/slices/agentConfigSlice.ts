import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface AgentConfigUpdatePayload {
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
}

const initialState: AgentConfigState = {
  updateConfig: {
    status: "idle",
    error: null,
  },
};

// Async: update agent configuration
export const updateAgentConfig = createAsyncThunk(
  "agentConfig/update",
  async ({ id, data }: { id: string; data: AgentConfigUpdatePayload }, { rejectWithValue }) => {
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
  },
  extraReducers: (builder) => {
    builder
      // updateAgentConfig
      .addCase(updateAgentConfig.pending, (state) => {
        state.updateConfig.status = "loading";
        state.updateConfig.error = null;
      })
      .addCase(updateAgentConfig.fulfilled, (state, action: PayloadAction<any>) => {
        state.updateConfig.status = "succeeded";
      })
      .addCase(updateAgentConfig.rejected, (state, action) => {
        state.updateConfig.status = "failed";
        state.updateConfig.error = action.payload as string;
      });
  },
});

export const { resetUpdateStatus } = agentConfigSlice.actions;
export default agentConfigSlice.reducer;
