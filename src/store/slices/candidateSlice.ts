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
  reducers: {},
});

/* -------------------------------------------------------------
   Exports
------------------------------------------------------------- */

export default candidateSlice.reducer;
