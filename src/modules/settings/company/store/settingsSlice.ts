import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SettingsState } from '../types';

const initialState: SettingsState = {
  user:              null,
  profile:           null,
  companyMembership: null,
  planLimits:        null,
  loading:           false,
  error:             null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearSettingsError(state) {
      state.error = null;
    },
    setSettingsLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { clearSettingsError, setSettingsLoading } = settingsSlice.actions;
export default settingsSlice.reducer;
