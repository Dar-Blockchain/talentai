// store/slices/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userType: "company" | "candidate" | null;
}

const initialState: UserState = {
  userType: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserType(state, action: PayloadAction<"company" | "candidate">) {
      state.userType = action.payload;
    },
  },
});

export const { setUserType } = userSlice.actions;
export default userSlice.reducer;
