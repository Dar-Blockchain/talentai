import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiKeyService } from '@/services/apiKeyService';

export interface ApiKey {
  id: string;
  name: string;
  serviceName: string;
  key?: string;
  keyPreview?: string;
  scopes: string[];
  rateLimit: number;
  isActive: boolean;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
  ipWhitelist?: string[];
}

interface ApiKeyState {
  keys: ApiKey[];
  loading: boolean;
  creating: boolean;
  error: string | null;
  newKey: string | null;
}

const initialState: ApiKeyState = {
  keys: [],
  loading: false,
  creating: false,
  error: null,
  newKey: null,
};

export const fetchApiKeys = createAsyncThunk('apiKeys/fetchAll', async () => {
  return await apiKeyService.fetchAll() as ApiKey[];
});

export const createApiKey = createAsyncThunk(
  'apiKeys/create',
  async (payload: { name: string; serviceName: string; scopes: string[]; rateLimit: number; expiresAt: string; ipWhitelist?: string[] }) => {
    return await apiKeyService.create(payload) as ApiKey;
  }
);

export const deleteApiKey = createAsyncThunk('apiKeys/delete', async (id: string) => {
  return await apiKeyService.delete(id);
});

export const toggleApiKey = createAsyncThunk('apiKeys/toggle', async (id: string) => {
  return await apiKeyService.toggle(id) as { id: string; isActive: boolean };
});

export const updateApiKey = createAsyncThunk(
  'apiKeys/update',
  async ({ id, data }: { id: string; data: Partial<Pick<ApiKey, 'name' | 'serviceName' | 'scopes' | 'rateLimit' | 'expiresAt' | 'ipWhitelist'>> }) => {
    return await apiKeyService.update(id, data) as ApiKey;
  }
);

export const regenerateApiKey = createAsyncThunk('apiKeys/regenerate', async (id: string) => {
  return await apiKeyService.regenerate(id) as { id: string; name: string; key: string };
});

const apiKeySlice = createSlice({
  name: 'apiKeys',
  initialState,
  reducers: {
    clearNewKey: (state) => { state.newKey = null; },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApiKeys.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchApiKeys.fulfilled, (state, action) => { state.loading = false; state.keys = action.payload; })
      .addCase(fetchApiKeys.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed to load'; })

      .addCase(createApiKey.pending, (state) => { state.creating = true; state.error = null; })
      .addCase(createApiKey.fulfilled, (state, action) => {
        state.creating = false;
        state.newKey = action.payload.key ?? null;
        const { key: _k, ...rest } = action.payload;
        state.keys.unshift(rest as ApiKey);
      })
      .addCase(createApiKey.rejected, (state, action) => { state.creating = false; state.error = action.error.message ?? 'Failed to create'; })

      .addCase(deleteApiKey.fulfilled, (state, action) => {
        state.keys = state.keys.filter((k) => k.id !== action.payload);
      })

      .addCase(toggleApiKey.fulfilled, (state, action) => {
        const k = state.keys.find((k) => k.id === action.payload.id);
        if (k) k.isActive = action.payload.isActive;
      })

      .addCase(updateApiKey.fulfilled, (state, action) => {
        const idx = state.keys.findIndex((k) => k.id === action.payload.id);
        if (idx !== -1) state.keys[idx] = { ...state.keys[idx], ...action.payload };
      })

      .addCase(regenerateApiKey.fulfilled, (state, action) => {
        state.newKey = action.payload.key;
      });
  },
});

export const { clearNewKey, clearError } = apiKeySlice.actions;
export default apiKeySlice.reducer;

export const selectApiKeys = (state: { apiKeys: ApiKeyState }) => state.apiKeys.keys;
export const selectApiKeysLoading = (state: { apiKeys: ApiKeyState }) => state.apiKeys.loading;
export const selectApiKeysCreating = (state: { apiKeys: ApiKeyState }) => state.apiKeys.creating;
export const selectApiKeysError = (state: { apiKeys: ApiKeyState }) => state.apiKeys.error;
export const selectNewKey = (state: { apiKeys: ApiKeyState }) => state.apiKeys.newKey;
