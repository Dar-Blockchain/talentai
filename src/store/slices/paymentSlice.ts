import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { RootState } from "../store";

export interface Payment {
  _id: string;
  userId: string;
  companyProfileId: string;
  planId: string;
  planName: string;
  planPrice: number;
  stripeSessionId: string;
  status: "pending" | "completed" | "failed" | "cancelled";
  amountCents: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentState {
  loading: boolean;
  cancelling: boolean;
  error: string | null;
  lastUpdated: Payment | null;
  history: Payment[];
  historyLoading: boolean;
}

const initialState: PaymentState = {
  loading: false,
  cancelling: false,
  error: null,
  lastUpdated: null,
  history: [],
  historyLoading: false,
};

export const verifyPayment = createAsyncThunk<Payment, { sessionId: string }, { rejectValue: string }>(
  "payment/verify",
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("payments/verify", { sessionId });
      return res.data.data as Payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to verify payment");
    }
  }
);

export const cancelSubscription = createAsyncThunk<void, void, { rejectValue: string }>(
  "payment/cancel",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("payments/cancel");
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to cancel subscription");
    }
  }
);

export const fetchCompanyPaymentHistory = createAsyncThunk<Payment[], void, { rejectValue: string }>(
  "payment/fetchCompanyHistory",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("payments/user/history");
      return (res.data.data || res.data) as Payment[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch payment history");
    }
  }
);

export const updatePaymentStatus = createAsyncThunk<
  Payment,
  { paymentId: string; status: Payment["status"]; additionalData?: Record<string, any> },
  { rejectValue: string }
>(
  "payment/updateStatus",
  async ({ paymentId, status, additionalData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`payments/${paymentId}/status`, {
        status,
        ...(additionalData ? { additionalData } : {}),
      });
      return res.data.data as Payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update payment status");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyPayment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(verifyPayment.fulfilled, (state, action) => { state.loading = false; state.lastUpdated = action.payload; })
      .addCase(verifyPayment.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Failed to verify payment"; });

    builder
      .addCase(cancelSubscription.pending, (state) => { state.cancelling = true; state.error = null; })
      .addCase(cancelSubscription.fulfilled, (state) => { state.cancelling = false; })
      .addCase(cancelSubscription.rejected, (state, action) => { state.cancelling = false; state.error = action.payload || "Failed to cancel subscription"; });

    builder
      .addCase(fetchCompanyPaymentHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchCompanyPaymentHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
      .addCase(fetchCompanyPaymentHistory.rejected, (state) => { state.historyLoading = false; });

    builder
      .addCase(updatePaymentStatus.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => { state.loading = false; state.lastUpdated = action.payload; })
      .addCase(updatePaymentStatus.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Failed to update payment status"; });
  },
});

export const selectPaymentLoading = (state: RootState) => state.payment.loading;
export const selectCancellingSubscription = (state: RootState) => state.payment.cancelling;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectLastUpdatedPayment = (state: RootState) => state.payment.lastUpdated;
export const selectPaymentHistory = (state: RootState) => state.payment.history;
export const selectPaymentHistoryLoading = (state: RootState) => state.payment.historyLoading;

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
