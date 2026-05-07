import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { paymentService } from "@/services/paymentService";
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

export interface CombinedSubscriptionDetails {
  subscriptions: {
    id: string;
    planName: string;
    status: string;
    startDate: string;
    endDate: string;
    postsUsed: number;
    postsLimit: number;
    monthlyInterviewsUsed: number;
    monthlyInterviewLimit: number;
    autoRenew: boolean;
  }[];
  combined: {
    planNames: string[];
    daysRemaining: number;
    soonestExpiry: string;
    usage: {
      posts: { used: number; limit: number; remaining: number };
      monthlyInterviews: { used: number; limit: number; remaining: number };
    };
  };
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
  combinedDetails: CombinedSubscriptionDetails | null;
  combinedDetailsLoading: boolean;
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
  combinedDetails: null,
  combinedDetailsLoading: false,
  limitCheck: null,
  limitCheckLoading: false,
};

export const verifyPayment = createAsyncThunk<Payment, { sessionId: string }, { rejectValue: string }>(
  "payment/verify",
  async ({ sessionId }, { rejectWithValue }) => {
    try {
      return await paymentService.verifyPayment(sessionId) as Payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to verify payment");
    }
  }
);

export const cancelSubscription = createAsyncThunk<void, { subscriptionId: string; reason?: string }, { rejectValue: string }>(
  "payment/cancel",
  async ({ subscriptionId, reason }, { rejectWithValue }) => {
    try {
      await paymentService.cancelSubscription(subscriptionId, reason);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to cancel subscription");
    }
  }
);

export const enableAutoRenew = createAsyncThunk<void, { subscriptionId: string }, { rejectValue: string }>(
  "payment/enableAutoRenew",
  async ({ subscriptionId }, { rejectWithValue }) => {
    try {
      await paymentService.enableAutoRenew(subscriptionId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to enable auto-renewal");
    }
  }
);

export const scheduleDowngrade = createAsyncThunk<void, { subscriptionId: string; newPlanId: string }, { rejectValue: string }>(
  "payment/scheduleDowngrade",
  async ({ subscriptionId, newPlanId }, { rejectWithValue }) => {
    try {
      await paymentService.scheduleDowngrade(subscriptionId, newPlanId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to schedule downgrade");
    }
  }
);

export const fetchCompanyPaymentHistory = createAsyncThunk<Payment[], void, { rejectValue: string }>(
  "payment/fetchCompanyHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.fetchCompanyPaymentHistory() as Payment[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch payment history");
    }
  }
);

export const fetchActiveSubscription = createAsyncThunk<ActiveSubscription, void, { rejectValue: string }>(
  "payment/fetchActiveSubscription",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.fetchActiveSubscription() as ActiveSubscription;
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
      return await paymentService.fetchCompanySubscriptions() as CompanySubscription[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to fetch subscriptions");
    }
  }
);

export const fetchCombinedSubscriptionDetails = createAsyncThunk<CombinedSubscriptionDetails, void, { rejectValue: string }>(
  "payment/fetchCombinedDetails",
  async (_, { rejectWithValue }) => {
    try {
      return await paymentService.fetchCombinedSubscriptionDetails() as CombinedSubscriptionDetails;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "No active subscriptions");
    }
  }
);

export const fetchSubscriptionDetails = createAsyncThunk<SubscriptionDetails, string, { rejectValue: string }>(
  "payment/fetchSubscriptionDetails",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      return await paymentService.fetchSubscriptionDetails(subscriptionId) as SubscriptionDetails;
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
      return await paymentService.checkSubscriptionLimit(companyProfileId, limitType) as LimitCheck;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to check limit");
    }
  }
);

export const createCheckoutSession = createAsyncThunk<
  { url: string; sessionId: string; paymentId: string },
  string,
  { rejectValue: string }
>(
  "payment/createCheckoutSession",
  async (planId, { rejectWithValue }) => {
    try {
      return await paymentService.createCheckoutSession(planId) as { url: string; sessionId: string; paymentId: string };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create checkout session");
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
      return await paymentService.updatePaymentStatus(paymentId, status, additionalData) as Payment;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to update payment status");
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {},
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
        state.combinedDetails = null;
      })
      .addCase(cancelSubscription.rejected, (state, action) => { state.cancelling = false; state.error = action.payload || "Failed to cancel subscription"; });

    builder
      .addCase(enableAutoRenew.pending, (state) => { state.cancelling = true; state.error = null; })
      .addCase(enableAutoRenew.fulfilled, (state) => {
        state.cancelling = false;
        state.activeSubscription = null;
        state.subscriptionDetails = null;
        state.combinedDetails = null;
      })
      .addCase(enableAutoRenew.rejected, (state, action) => { state.cancelling = false; state.error = action.payload || "Failed to enable auto-renewal"; });

    builder
      .addCase(scheduleDowngrade.pending, (state) => { state.cancelling = true; state.error = null; })
      .addCase(scheduleDowngrade.fulfilled, (state) => { state.cancelling = false; })
      .addCase(scheduleDowngrade.rejected, (state, action) => { state.cancelling = false; state.error = action.payload || "Failed to schedule downgrade"; });

    builder
      .addCase(fetchCompanyPaymentHistory.pending, (state) => { state.historyLoading = true; })
      .addCase(fetchCompanyPaymentHistory.fulfilled, (state, action) => { state.historyLoading = false; state.history = action.payload; })
      .addCase(fetchCompanyPaymentHistory.rejected, (state) => { state.historyLoading = false; });

    builder
      .addCase(fetchActiveSubscription.pending, (state) => { state.activeSubscriptionLoading = true; })
      .addCase(fetchActiveSubscription.fulfilled, (state, action) => { state.activeSubscriptionLoading = false; state.activeSubscription = action.payload; })
      .addCase(fetchActiveSubscription.rejected, (state) => { state.activeSubscriptionLoading = false; state.activeSubscription = null; });

    builder
      .addCase(fetchCombinedSubscriptionDetails.pending, (state) => { state.combinedDetailsLoading = true; })
      .addCase(fetchCombinedSubscriptionDetails.fulfilled, (state, action) => { state.combinedDetailsLoading = false; state.combinedDetails = action.payload; })
      .addCase(fetchCombinedSubscriptionDetails.rejected, (state) => { state.combinedDetailsLoading = false; state.combinedDetails = null; });

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
      .addCase(createCheckoutSession.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createCheckoutSession.fulfilled, (state) => { state.loading = false; })
      .addCase(createCheckoutSession.rejected, (state, action) => { state.loading = false; state.error = action.payload || "Failed to create checkout session"; });

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
export const selectCombinedDetails = (state: RootState) => state.payment.combinedDetails;
export const selectCombinedDetailsLoading = (state: RootState) => state.payment.combinedDetailsLoading;
export const selectCompanySubscriptions = (state: RootState) => state.payment.companySubscriptions;
export const selectCompanySubscriptionsLoading = (state: RootState) => state.payment.companySubscriptionsLoading;
export const selectSubscriptionDetails = (state: RootState) => state.payment.subscriptionDetails;
export const selectSubscriptionDetailsLoading = (state: RootState) => state.payment.subscriptionDetailsLoading;
export const selectLimitCheck = (state: RootState) => state.payment.limitCheck;
export const selectLimitCheckLoading = (state: RootState) => state.payment.limitCheckLoading;

export default paymentSlice.reducer;
