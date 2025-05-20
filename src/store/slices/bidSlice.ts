import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

interface BidState {
  placeBid: {
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
  bids: {
    data: any;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
  };
}

const initialState: BidState = {
  placeBid: {
    status: "idle",
    error: null,
  },
  bids: {
    data: [],
    status: "idle",
    error: null,
  },
};

// Async: place bid
export const placeBid = createAsyncThunk(
  "bids/placeBid",
  async (newBid: any, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/updateFinalBid`, newBid, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
        const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to place bid, Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);

// Async: fetch bids
export const fetchBids = createAsyncThunk(
  "bids/fetchBids",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("api_token");
      if (!token) {
        return rejectWithValue("No authentication token found");
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getCompanyBid`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || "Failed to fetch bids"
      );
    }
  }
);

const bidSlice = createSlice({
  name: "bids",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // placeBid
      .addCase(placeBid.pending, (state) => {
        state.placeBid.status = "loading";
        state.placeBid.error = null;
      })
      .addCase(placeBid.fulfilled, (state, action: PayloadAction<any>) => {
        state.placeBid.status = "succeeded";
      })
      .addCase(placeBid.rejected, (state, action) => {
        state.placeBid.status = "failed";
        state.placeBid.error = action.payload as string;
      })

      // fetchBids
      .addCase(fetchBids.pending, (state) => {
        state.bids.status = "loading";
        state.bids.error = null;
      })
      .addCase(fetchBids.fulfilled, (state, action: PayloadAction<any>) => {
        state.bids.status = "succeeded";
        state.bids.data = action.payload.bidedCandidates;
      })
      .addCase(fetchBids.rejected, (state, action) => {
        state.bids.status = "failed";
        state.bids.error = action.payload as string;
      });
  },
});

export default bidSlice.reducer;
