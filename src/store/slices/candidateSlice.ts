import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface CandidateState {
  loading: boolean;
  error: string | null;
}

const initialState: CandidateState = {
  loading: false,
  error: null,
};

const candidateSlice = createSlice({
  name: "candidate",
  initialState,
  reducers: {
    clearCandidateError: (state) => {
      state.error = null;
    },
  },
});

/* -------------------------------------------------------------
   Exports
------------------------------------------------------------- */

export const { clearCandidateError } = candidateSlice.actions;

export default candidateSlice.reducer;
