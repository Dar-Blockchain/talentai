import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import axios from 'axios';

// Types
export interface TokenState {
  balance: number;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  transactions: TokenTransaction[];
  transactionsLoading: boolean;
  pricingPlans: PricingData;
  pricingPlansLoading: boolean;
  pricingPlansError: string | null;
}

export interface TokenTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  hederaAccountId?: string;
}

export interface PurchaseTokensPayload {
  amount: number;
  paymentMethod: 'hedera' | 'hashpack';
  walletAddress?: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  priceUsd: number;
  hbarPrice: number;
  gasFeeHbar: number;
  totalHbar: number;
  gasFeeUsd: number;
  popular?: boolean;
  currentHbarRate: number;
  lastUpdated: string;
}

interface TAITokenConfig {
  tokenId: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  description: string;
}

interface PricingData {
  plans: PricingPlan[];
  taiToken: TAITokenConfig;
  hbarPrice: number;
  lastUpdated: string;
}

// Initial state
const initialState: TokenState = {
  balance: 0,
  loading: false,
  error: null,
  lastUpdated: null,
  transactions: [],
  transactionsLoading: false,
  pricingPlans: null,
  pricingPlansLoading: false,
  pricingPlansError: null,
};

// Async thunks
export const fetchTokenBalance = createAsyncThunk(
  'token/fetchBalance',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Fetching token balance from Hedera Mirror Node...');
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}tokens/balance`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('api_token')}`,
        },
      });
      console.log('✅ Token balance received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch token balance:', error);

      if (error.response) {
        return rejectWithValue(error.response.data?.message || 'Failed to fetch token balance');
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message || 'Failed to fetch token balance');
      }
    }
  }
);

export const purchaseTokens = createAsyncThunk(
  'token/purchase',
  async (payload: PurchaseTokensPayload, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}tokens/purchase`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('api_token')}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to purchase tokens:', error);

      if (error.response) {
        return rejectWithValue(error.response.data?.message || 'Failed to purchase tokens');
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message || 'Failed to purchase tokens');
      }
    }
  }
);

export const fetchTokenTransactions = createAsyncThunk(
  'token/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}tokens/transactions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('api_token')}`,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch token transactions:', error);

      if (error.response) {
        return rejectWithValue(error.response.data?.message || 'Failed to fetch transactions');
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message || 'Failed to fetch transactions');
      }
    }
  }
);

export const verifyPayment = createAsyncThunk(
  'token/verifyPayment',
  async (transactionHash: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}tokens/verify-payment`,
        { transactionHash },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('api_token')}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Failed to verify payment:', error);

      if (error.response) {
        return rejectWithValue(error.response.data?.message || 'Failed to verify payment');
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message || 'Failed to verify payment');
      }
    }
  }
);

// Add the fetchPricingPlans async thunk
export const fetchPricingPlans = createAsyncThunk(
  'token/fetchPricingPlans',
  async (_, { rejectWithValue }) => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}payment/plans`;
      console.log('📊 Fetching pricing plans from:', apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('api_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch pricing plans');
      }

      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching pricing plans:', error);

      if (error.response) {
        return rejectWithValue(error.response.data?.message || 'Failed to fetch pricing plans');
      } else if (error.request) {
        return rejectWithValue('Network error: Unable to connect to server');
      } else {
        return rejectWithValue(error.message || 'Failed to fetch pricing plans');
      }
    }
  }
);

// Token slice
const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.pricingPlansError = null;
    },
    updateBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    addTransaction: (state, action: PayloadAction<TokenTransaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<{ id: string; updates: Partial<TokenTransaction> }>) => {
      const { id, updates } = action.payload;
      const transactionIndex = state.transactions.findIndex(t => t.id === id);
      if (transactionIndex !== -1) {
        state.transactions[transactionIndex] = {
          ...state.transactions[transactionIndex],
          ...updates
        };
      }
    },
    resetTokenState: (state) => {
      return initialState;
    },
    setPricingPlans: (state, action: PayloadAction<PricingData | null>) => {
      state.pricingPlans = action.payload;
    },
    clearPricingPlansError: (state) => {
      state.pricingPlansError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch token balance
      .addCase(fetchTokenBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTokenBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.lastUpdated = new Date().toISOString();
        state.error = null;
      })
      .addCase(fetchTokenBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Purchase tokens
      .addCase(purchaseTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(purchaseTokens.fulfilled, (state, action) => {
        state.loading = false;

        // Add pending transaction
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }

        state.error = null;
      })
      .addCase(purchaseTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch transactions
      .addCase(fetchTokenTransactions.pending, (state) => {
        state.transactionsLoading = true;
      })
      .addCase(fetchTokenTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false;
        state.transactions = action.payload.transactions || [];
      })
      .addCase(fetchTokenTransactions.rejected, (state, action) => {
        state.transactionsLoading = false;
        state.error = action.payload as string;
      })

      // Verify payment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.loading = false;

        // Update balance if payment verified
        if (action.payload.verified) {
          state.balance = action.payload.newBalance;
          state.lastUpdated = new Date().toISOString();

          // Update transaction status
          const transactionIndex = state.transactions.findIndex(
            t => t.transactionHash === action.payload.transactionHash
          );
          if (transactionIndex !== -1) {
            state.transactions[transactionIndex].status = 'completed';
          }
        }

        state.error = null;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch pricing plans
      .addCase(fetchPricingPlans.pending, (state) => {
        state.pricingPlansLoading = true;
        state.pricingPlansError = null;
      })
      .addCase(fetchPricingPlans.fulfilled, (state, action) => {
        state.pricingPlansLoading = false;
        state.pricingPlans = action.payload;
        state.pricingPlansError = null;
      })
      .addCase(fetchPricingPlans.rejected, (state, action) => {
        state.pricingPlansLoading = false;
        state.pricingPlansError = action.payload as string;
      });
  },
});

// Selectors
export const selectTokenBalance = (state: RootState) => state.token.balance;
export const selectTokenLoading = (state: RootState) => state.token.loading;
export const selectTokenError = (state: RootState) => state.token.error;
export const selectTokenLastUpdated = (state: RootState) => state.token.lastUpdated;
export const selectTokenTransactions = (state: RootState) => state.token.transactions;
export const selectTokenTransactionsLoading = (state: RootState) => state.token.transactionsLoading;
export const selectTokenState = (state: RootState) => state.token;

// New pricing plans selectors
export const selectPricingPlans = (state: RootState) => state.token.pricingPlans;
export const selectPricingPlansLoading = (state: RootState) => state.token.pricingPlansLoading;
export const selectPricingPlansError = (state: RootState) => state.token.pricingPlansError;

// Actions
export const {
  clearError,
  updateBalance,
  addTransaction,
  updateTransaction,
  resetTokenState,
  setPricingPlans,
  clearPricingPlansError,
} = tokenSlice.actions;

export default tokenSlice.reducer;