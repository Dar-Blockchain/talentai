// store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userType: "company" | "candidate" | null;
  currentSpace?: 'personal' | 'membership' | null;
}

const initialState: UserState = {
  userType: null,
  currentSpace: null
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserType(state, action: PayloadAction<"company" | "candidate">) {
      state.userType = action.payload;
    },
    setCurrentSpace(state, action: PayloadAction<"personal" | "membership">) {
      state.currentSpace = action.payload;
    },
  },
});

export const { setUserType, setCurrentSpace } = userSlice.actions;
export default userSlice.reducer;
