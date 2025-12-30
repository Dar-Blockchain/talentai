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
  status: "available" | "busy" | "offline";
  description: string;
  skills: string[];
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface AsyncState<T> {
  data: T;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface HRAgentsState {
  agents: AsyncState<HRAgent[]>;
  selectedAgent: AsyncState<HRAgent | null>;
  createdAgent: AsyncState<HRAgent | null>;
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
  createdAgent: {
    data: null,
    status: "idle",
    error: null,
  },
};

// ----------------------------------------------------------------------
// 1️⃣ Create HR Agent (POST)
// ----------------------------------------------------------------------
export const createHRAgent = createAsyncThunk(
  "hrAgents/createHRAgent",
  async (
    {
      agentData,
      configData,
    }: {
      agentData: any;
      configData: any;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const agentName = `${agentData?.companyName}_${agentData?.companyId}${agentData?.postTitle}_${agentData?.jobId}`;
      const avatarName = `${agentData?.companyName}_${agentData?.companyId}${agentData?.postTitle}_${agentData?.jobId}`;
      const agentConfig = {
        name: agentName,
        postId: agentData?.jobId,
        avatarName: avatarName,
        role: "Technical Leadership Specialist",
        description: `Agent of ${agentData?.companyName} for the ${agentData?.postTitle} Post ${agentData?.jobId}`,
        Company: agentData?.companyId,
        hcs11CustomProfile: {
          agentPersonality: {
            communicationStyle: "technical_analytical",
            approachMethod: "systematic_deep_dive",
            evaluationPhilosophy:
              "Focus on scalable architecture and clean code practices",
          },
          specializedCapabilities: [
            "system_architecture_assessment",
            "api_design_evaluation",
          ],
          evaluationFramework: {
            primaryFocus: "backend_systems",
            assessmentCriteria: ["system_design_thinking", "code_architecture"],
          },
          domainExpertise: {
            primaryTechnologies:
              agentData?.jobSkills.length > 0
                ? agentData?.jobSkills
                : ["Node.js", "Python", "Java"],
            specializations: ["API_gateway_design", "microservices"],
          },
        },
      };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}hr-agents/initialize`,
        {
          agentData: [agentConfig],
          configData,
        },
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
          "Failed to create HR agent"
      );
    }
  }
);

// ----------------------------------------------------------------------
// 2️⃣ Fetch All Agents
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 3️⃣ Fetch Single Agent
// ----------------------------------------------------------------------
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

// ----------------------------------------------------------------------
// 4️⃣ Place Bid
// ----------------------------------------------------------------------
export const placeHRAgentBid = createAsyncThunk(
  "hrAgents/placeHRAgentBid",
  async (
    bidData: { agentId: string; bidAmount: number; message?: string },
    { rejectWithValue }
  ) => {
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

// ----------------------------------------------------------------------
// Slice
// ----------------------------------------------------------------------
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
    clearCreatedAgent: (state) => {
      state.createdAgent = {
        data: null,
        status: "idle",
        error: null,
      };
    },
  },

  extraReducers: (builder) => {
    builder
      // ----------------------------------------------------------------------
      // createHRAgent
      // ----------------------------------------------------------------------
      .addCase(createHRAgent.pending, (state) => {
        state.createdAgent.status = "loading";
        state.createdAgent.error = null;
      })
      .addCase(createHRAgent.fulfilled, (state, action: PayloadAction<any>) => {
        state.createdAgent.status = "succeeded";
        state.createdAgent.data =
          action.payload.agent || action?.payload?.data[0] || action.payload;
      })
      .addCase(createHRAgent.rejected, (state, action) => {
        state.createdAgent.status = "failed";
        state.createdAgent.error = action.payload as string;
      })

      // ----------------------------------------------------------------------
      // fetchHRAgents
      // ----------------------------------------------------------------------
      .addCase(fetchHRAgents.pending, (state) => {
        state.agents.status = "loading";
        state.agents.error = null;
      })
      .addCase(fetchHRAgents.fulfilled, (state, action: PayloadAction<any>) => {
        state.agents.status = "succeeded";
        state.agents.data =
          action.payload.results ||
          action.payload.agents ||
          action.payload.data ||
          action.payload;
      })
      .addCase(fetchHRAgents.rejected, (state, action) => {
        state.agents.status = "failed";
        state.agents.error = action.payload as string;
      })

      // ----------------------------------------------------------------------
      // fetchHRAgent
      // ----------------------------------------------------------------------
      .addCase(fetchHRAgent.pending, (state) => {
        state.selectedAgent.status = "loading";
        state.selectedAgent.error = null;
      })
      .addCase(fetchHRAgent.fulfilled, (state, action: PayloadAction<any>) => {
        state.selectedAgent.status = "succeeded";
        state.selectedAgent.data =
          action.payload.agent || action.payload.data || action.payload;
      })
      .addCase(fetchHRAgent.rejected, (state, action) => {
        state.selectedAgent.status = "failed";
        state.selectedAgent.error = action.payload as string;
      })

      // ----------------------------------------------------------------------
      // placeHRAgentBid
      // ----------------------------------------------------------------------
      .addCase(placeHRAgentBid.pending, () => {})
      .addCase(placeHRAgentBid.fulfilled, () => {})
      .addCase(placeHRAgentBid.rejected, () => {});
  },
});

export const { clearSelectedAgent, clearCreatedAgent } = hrAgentsSlice.actions;
export default hrAgentsSlice.reducer;

// ----------------------------------------------------------------------
// Selectors
// ----------------------------------------------------------------------
export const selectHRAgents = (state: { hrAgents: HRAgentsState }) =>
  state.hrAgents.agents;

export const selectSelectedHRAgent = (state: { hrAgents: HRAgentsState }) =>
  state.hrAgents.selectedAgent;

export const selectCreatedAgent = (state: { hrAgents: HRAgentsState }) =>
  state.hrAgents.createdAgent;
