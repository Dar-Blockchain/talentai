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

export interface ActiveSubscription {
  _id: string;
  companyProfileId: string;
  planId: {
    _id: string;
    name: string;
    priceUsd: number;
    postsLimit: number;
    monthlyInterviewLimit: number;
    durationDays: number;
  };
  paymentId: string;
  startDate: string;
  endDate: string;
  renewalDate?: string;
  postsUsed: number;
  monthlyInterviewsUsed: number;
  status: "active" | "expired" | "cancelled" | "suspended";
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  planName: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  usage: {
    posts: { used: number; limit: number; remaining: number; percentageUsed: number };
    monthlyInterviews: { used: number; limit: number; remaining: number };
  };
  autoRenew: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LimitCheck {
  canUse: boolean;
  message: string;
  limitData: {
    used: number;
    limit: number;
    remaining: number;
    planName: string;
    subscriptionId: string;
    expiresAt: string;
  } | null;
}

interface PaymentState {
  loading: boolean;
  cancelling: boolean;
  error: string | null;
  lastUpdated: Payment | null;
  history: Payment[];
  historyLoading: boolean;
  activeSubscription: ActiveSubscription | null;
  activeSubscriptionLoading: boolean;
  subscriptionDetails: SubscriptionDetails | null;
  subscriptionDetailsLoading: boolean;
  companySubscriptions: CompanySubscription[];
  companySubscriptionsLoading: boolean;
  limitCheck: LimitCheck | null;
  limitCheckLoading: boolean;
}

const initialState: PaymentState = {
  loading: false,
  cancelling: false,
  error: null,
  lastUpdated: null,
  history: [],
  historyLoading: false,
  activeSubscription: null,
  activeSubscriptionLoading: false,
  subscriptionDetails: null,
  subscriptionDetailsLoading: false,
  companySubscriptions: [],
  companySubscriptionsLoading: false,
  limitCheck: null,
  limitCheckLoading: false,
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

export const cancelSubscription = createAsyncThunk<void, { subscriptionId: string; reason?: string }, { rejectValue: string }>(
  "payment/cancel",
  async ({ subscriptionId, reason }, { rejectWithValue }) => {
    try {
      await axiosInstance.post(`subscriptions/${subscriptionId}/cancel`, { reason: reason || "" });
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

export const fetchActiveSubscription = createAsyncThunk<ActiveSubscription, void, { rejectValue: string }>(
  "payment/fetchActiveSubscription",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("subscriptions/active");
      return res.data.data as ActiveSubscription;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "No active subscription");
    }
  }
);

export interface CompanySubscription {
  _id: string;
  planId: { _id: string; name: string; priceUsd: number };
  paymentId: string;
  status: "active" | "expired" | "cancelled" | "suspended";
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  createdAt: string;
}

export const fetchCompanySubscriptions = createAsyncThunk<CompanySubscription[], void, { rejectValue: string }>(
  "payment/fetchCompanySubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("subscriptions/");
      return (res.data.data || []) as CompanySubscription[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch subscriptions");
    }
  }
);

export const fetchSubscriptionDetails = createAsyncThunk<SubscriptionDetails, string, { rejectValue: string }>(
  "payment/fetchSubscriptionDetails",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`subscriptions/${subscriptionId}/details`);
      return res.data.data as SubscriptionDetails;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch subscription details");
    }
  }
);

export const checkSubscriptionLimit = createAsyncThunk<
  LimitCheck,
  { companyProfileId: string; limitType: "posts" | "monthlyInterviews" },
  { rejectValue: string }
>(
  "payment/checkLimit",
  async ({ companyProfileId, limitType }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`subscriptions/${companyProfileId}/check-limit/${limitType}`);
      return res.data as LimitCheck;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to check limit");
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
      .addCase(cancelSubscription.fulfilled, (state) => {
        state.cancelling = false;
        state.activeSubscription = null;
        state.subscriptionDetails = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => { state.cancelling = false; state.error = action.payload || "Failed to cancel subscription"; });

    builder
      .addCase(fetchCompanyPaymentHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchCompanyPaymentHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
      .addCase(fetchCompanyPaymentHistory.rejected, (state) => { state.historyLoading = false; });

    builder
      .addCase(fetchActiveSubscription.pending, (state) => { state.activeSubscriptionLoading = true; })
      .addCase(fetchActiveSubscription.fulfilled, (state, action) => { state.activeSubscriptionLoading = false; state.activeSubscription = action.payload; })
      .addCase(fetchActiveSubscription.rejected, (state) => { state.activeSubscriptionLoading = false; state.activeSubscription = null; });

    builder
      .addCase(fetchCompanySubscriptions.pending, (state) => { state.companySubscriptionsLoading = true; })
      .addCase(fetchCompanySubscriptions.fulfilled, (state, action) => { state.companySubscriptionsLoading = false; state.companySubscriptions = action.payload; })
      .addCase(fetchCompanySubscriptions.rejected, (state) => { state.companySubscriptionsLoading = false; });

    builder
      .addCase(fetchSubscriptionDetails.pending, (state) => { state.subscriptionDetailsLoading = true; })
      .addCase(fetchSubscriptionDetails.fulfilled, (state, action) => { state.subscriptionDetailsLoading = false; state.subscriptionDetails = action.payload; })
      .addCase(fetchSubscriptionDetails.rejected, (state) => { state.subscriptionDetailsLoading = false; state.subscriptionDetails = null; });

    builder
      .addCase(checkSubscriptionLimit.pending, (state) => { state.limitCheckLoading = true; })
      .addCase(checkSubscriptionLimit.fulfilled, (state, action) => { state.limitCheckLoading = false; state.limitCheck = action.payload; })
      .addCase(checkSubscriptionLimit.rejected, (state) => { state.limitCheckLoading = false; state.limitCheck = null; });

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
export const selectActiveSubscription = (state: RootState) => state.payment.activeSubscription;
export const selectActiveSubscriptionLoading = (state: RootState) => state.payment.activeSubscriptionLoading;
export const selectCompanySubscriptions = (state: RootState) => state.payment.companySubscriptions;
export const selectCompanySubscriptionsLoading = (state: RootState) => state.payment.companySubscriptionsLoading;
export const selectSubscriptionDetails = (state: RootState) => state.payment.subscriptionDetails;
export const selectSubscriptionDetailsLoading = (state: RootState) => state.payment.subscriptionDetailsLoading;
export const selectLimitCheck = (state: RootState) => state.payment.limitCheck;
export const selectLimitCheckLoading = (state: RootState) => state.payment.limitCheckLoading;

export const { clearPaymentError } = paymentSlice.actions;
export default paymentSlice.reducer;
