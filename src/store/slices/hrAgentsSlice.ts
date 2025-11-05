import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface HRAgent {
  _id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  specialization: string[];
  experience: number;
  rating: number;
  bidAmount: number;
  status: 'available' | 'busy' | 'offline';
  description: string;
  skills: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface HRAgentsState {
  agents: {
    data: HRAgent[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  selectedAgent: {
    data: HRAgent | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}

const initialState: HRAgentsState = {
  agents: {
    data: [],
    status: "idle",
    error: null,
  },
  selectedAgent: {
    data: null,
    status: "idle",
    error: null,
  },
};

// Async: fetch HR agents for a company
export const fetchHRAgents = createAsyncThunk(
  "hrAgents/fetchHRAgents",
  async (companyId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}hr-agents/company`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to fetch HR agents"
      );
    }
  }
);

// Async: fetch single HR agent details
export const fetchHRAgent = createAsyncThunk(
  "hrAgents/fetchHRAgent",
  async (agentId: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}hr-agents/${agentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to fetch HR agent"
      );
    }
  }
);

// Async: place bid on HR agent
export const placeHRAgentBid = createAsyncThunk(
  "hrAgents/placeHRAgentBid",
  async (bidData: { agentId: string; bidAmount: number; message?: string }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}hr-agents/bid`,
        bidData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 
        error.response?.data?.message || 
        "Failed to place bid on HR agent"
      );
    }
  }
);

const hrAgentsSlice = createSlice({
  name: "hrAgents",
  initialState,
  reducers: {
    clearSelectedAgent: (state) => {
      state.selectedAgent = {
        data: null,
        status: "idle",
        error: null,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchHRAgents
      .addCase(fetchHRAgents.pending, (state) => {
        state.agents.status = "loading";
        state.agents.error = null;
      })
      .addCase(fetchHRAgents.fulfilled, (state, action: PayloadAction<any>) => {
        state.agents.status = "succeeded";
        state.agents.data = action.payload.agents || action.payload.data || action.payload;
      })
      .addCase(fetchHRAgents.rejected, (state, action) => {
        state.agents.status = "failed";
        state.agents.error = action.payload as string;
      })

      // fetchHRAgent
      .addCase(fetchHRAgent.pending, (state) => {
        state.selectedAgent.status = "loading";
        state.selectedAgent.error = null;
      })
      .addCase(fetchHRAgent.fulfilled, (state, action: PayloadAction<any>) => {
        state.selectedAgent.status = "succeeded";
        state.selectedAgent.data = action.payload.agent || action.payload.data || action.payload;
      })
      .addCase(fetchHRAgent.rejected, (state, action) => {
        state.selectedAgent.status = "failed";
        state.selectedAgent.error = action.payload as string;
      })

      // placeHRAgentBid
      .addCase(placeHRAgentBid.pending, (state) => {
        // You might want to add a separate state for bid placement
      })
      .addCase(placeHRAgentBid.fulfilled, (state, action: PayloadAction<any>) => {
        // Handle successful bid placement
      })
      .addCase(placeHRAgentBid.rejected, (state, action) => {
        // Handle bid placement error
      });
  },
});

export const { clearSelectedAgent } = hrAgentsSlice.actions;
export default hrAgentsSlice.reducer;

// Selectors
export const selectHRAgents = (state: { hrAgents: HRAgentsState }) => state.hrAgents.agents;
export const selectSelectedHRAgent = (state: { hrAgents: HRAgentsState }) => state.hrAgents.selectedAgent;
