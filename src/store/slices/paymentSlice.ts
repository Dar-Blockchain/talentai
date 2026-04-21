import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/utils/axiosInstance";
import { RootState } from "../store";

// ─── Types ───────────────────────────────────────────────

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
  error: string | null;
  lastUpdated: Payment | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  lastUpdated: null,
};

// ─── Thunks ──────────────────────────────────────────────

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
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to update payment status"
      );
    }
  }
);

// ─── Slice ───────────────────────────────────────────────

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updatePaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.lastUpdated = action.payload;
      })
      .addCase(updatePaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update payment status";
      });
  },
});

// ─── Selectors ───────────────────────────────────────────

export const selectPaymentLoading = (state: RootState) => state.payment.loading;
export const selectPaymentError = (state: RootState) => state.payment.error;
export const selectLastUpdatedPayment = (state: RootState) => state.payment.lastUpdated;

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
