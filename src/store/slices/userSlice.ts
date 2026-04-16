import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axiosInstance from "@/utils/axiosInstance";

interface UserState {
  connectedUser: {
    user: any | null;
    profile: any | null;
    planLimits: any | null;
    companyMembership: any | null;
    loading: boolean;
    error: string | null;
  };
  targetUser: {
    user: any | null;
    profile: any | null;
    planLimits: any | null;
    companyMembership: any | null;
    loading: boolean;
    error: string | null;
  };
  userType: "company" | "candidate" | "employee" | null;
  currentSpace?: "personal" | "membership" | null;
}

const initialState: UserState = {
  connectedUser: {
    user: null,
    profile: null,
    planLimits: null,
    companyMembership: null,
    loading: false,
    error: null,
  },
  targetUser: {
    user: null,
    profile: null,
    planLimits: null,
    companyMembership: null,
    loading: false,
    error: null,
  },
  userType: null,
  currentSpace: null,
};

export const createOrUpdateProfile = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>("user/createOrUpdateProfile", async (profileData, { rejectWithValue }) => {
  const endpoint =
    profileData.type === "company"
      ? "profiles/createOrUpdateCompanyProfile"
      : "profiles/createOrUpdateProfile";

  try {
    const response = await axiosInstance.post(endpoint, profileData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred while creating/updating profile"
    );
  }
});

export const updateProfile = createAsyncThunk<
  any,
  { payload: any; targetUserId?: string },
  { rejectValue: string }
>("user/updateProfile", async ({ payload: updatePayload, targetUserId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const connectedUser = state.user.connectedUser.user;
    const userId = targetUserId || connectedUser?._id || connectedUser?.id;
    const response = await axiosInstance.put(`profiles/${userId}`, updatePayload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred while updating profile"
    );
  }
});

export const getMyProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("user/getMyProfile", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("profiles/me");
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred while fetching profile"
    );
  }
});

export const uploadProfileImage = createAsyncThunk<
  any,
  { file: File; targetUserId?: string },
  { rejectValue: string }
>("user/uploadProfileImage", async ({ file, targetUserId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as any;
    const connectedUser = state.user.connectedUser.user;
    const userId = targetUserId || connectedUser?._id || connectedUser?.id;
    const formData = new FormData();
    formData.append("user_image", file);

    const response = await axiosInstance.put(`profiles/${userId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred while uploading profile image"
    );
  }
});

export const getProfileById = createAsyncThunk<
  any,
  string,
  { rejectValue: string; state: RootState }
>("user/getProfileById", async (userId, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get(`profiles/${userId}`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "An error occurred while fetching profile"
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setConnectedUser(state, action: PayloadAction<any>) {
      state.connectedUser.user = action.payload.user;
      state.connectedUser.profile = action.payload.profile;
      state.connectedUser.planLimits = action.payload.planLimits;
      state.connectedUser.companyMembership = action.payload.companyMembership;
    },
    setTargetUser(state, action: PayloadAction<any>) {
      state.targetUser.user = action.payload.user;
      state.targetUser.profile = action.payload.profile;
    },
    clearConnectedUser(state) {
      state.connectedUser.user = null;
      state.connectedUser.profile = null;
      state.connectedUser.planLimits = null;
      state.connectedUser.companyMembership = null;
    },
    clearTargetUser(state) {
      state.targetUser.user = null;
      state.targetUser.profile = null;
    },
    setUserType(state, action: PayloadAction<"company" | "candidate" | "employee">) {
      state.userType = action.payload;
    },
    setCurrentSpace(state, action: PayloadAction<"personal" | "membership">) {
      state.currentSpace = action.payload;
    },
    updateProfileQuota(state, action: PayloadAction<number>) {
      if (state?.connectedUser?.profile?.quota !== undefined) {
        state.connectedUser.profile.quota = action.payload;
      }
    },
    updateProfileSkills(state, action: PayloadAction<string[]>) {
      if (state?.connectedUser?.profile.skills !== null) {
        state.connectedUser.profile.skills = action.payload;
      }
    },
    updateProfileSoftSkill(state, action: PayloadAction<string[]>) {
      if (state?.connectedUser?.profile.softSkills !== null) {
        state.connectedUser.profile.softSkills = action.payload;
      }
    },
    updatePlanUsage(state, action: PayloadAction<any>) {
      if (state?.connectedUser?.profile) {
        state.connectedUser.profile.planUsage = action.payload;
      }
    },
  },
    extraReducers: (builder) => {
      builder
        //CREATE OR UPDATE PROFILE
        .addCase(createOrUpdateProfile.pending, (state: UserState) => {
          state.connectedUser.loading = true;
          state.connectedUser.error = null;
        })
        .addCase(
          createOrUpdateProfile.fulfilled,
          (state: UserState, action: PayloadAction<any>) => {
            state.connectedUser.loading = false;
            state.connectedUser.profile = action.payload.profile;
            state.connectedUser.companyMembership = action.payload.companyMembership;
            state.connectedUser.user = action.payload.user;
          }
        )
        .addCase(
          createOrUpdateProfile.rejected,
          (state: UserState) => {
            state.connectedUser.loading = false;
          }
        )
        //UPDATE PROFILE
        .addCase(updateProfile.pending, (state: UserState) => {
          state.connectedUser.loading = true;
          state.connectedUser.error = null;
        })
        .addCase(
          updateProfile.fulfilled,
          (state: UserState, action: PayloadAction<any>) => {
            state.connectedUser.loading = false;
            state.connectedUser.profile = action.payload.profile;
            state.connectedUser.companyMembership = action.payload.companyMembership;
            state.connectedUser.user = action.payload.user;
          }
        )
        .addCase(
          updateProfile.rejected,
          (state: UserState) => {
            state.connectedUser.loading = false;
          }
        )
        //UPLOAD PROFILE IMAGE
        .addCase(uploadProfileImage.pending, (state: UserState) => {
          state.connectedUser.loading = true;
          state.connectedUser.error = null;
        })
        .addCase(
          uploadProfileImage.fulfilled,
          (state: UserState, action: PayloadAction<any>) => {
            state.connectedUser.loading = false;
            state.connectedUser.profile = action.payload.profile;
            state.connectedUser.user = action.payload.user;
          }
        )
        .addCase(
          uploadProfileImage.rejected,
          (state: UserState) => {
            state.connectedUser.loading = false;
          }
        )
        //GET MY PROFILE
        .addCase(getMyProfile.pending, (state: UserState) => {
          state.connectedUser.loading = true;
          state.connectedUser.error = null;
        })
        .addCase(
          getMyProfile.fulfilled,
          (state: UserState, action: PayloadAction<any>) => {
            state.connectedUser.loading = false;
            state.connectedUser.profile = action.payload.profile;
            state.connectedUser.planLimits = action.payload.planLimits;
            state.connectedUser.companyMembership = action.payload.companyMembership;
            state.connectedUser.user = action.payload.user;
          }
        )
        .addCase(
          getMyProfile.rejected,
          (state: UserState) => {
            state.connectedUser.loading = false;
          }
        )
        //GET PROFILE BY ID
        .addCase(getProfileById.pending, (state: UserState) => {
          state.targetUser.loading = true;
          state.targetUser.error = null;
        })
        .addCase(
          getProfileById.fulfilled,
          (state: UserState, action: PayloadAction<any>) => {
            state.targetUser.loading = false;
            state.targetUser.profile = action.payload.profile;
            state.targetUser.planLimits = action.payload.planLimits || null;
            state.targetUser.user = action.payload.user;
            state.targetUser.companyMembership = action.payload.companyMembership || null;
          }
        )
        .addCase(
          getProfileById.rejected,
          (state: UserState, action: PayloadAction<any>) => {
            state.targetUser.loading = false;
            state.targetUser.error = action.payload;
          }
        );
    },
  });

export const {
  setConnectedUser,
  setTargetUser,
  clearConnectedUser,
  clearTargetUser,
  setUserType,
  setCurrentSpace,
  updateProfileQuota,
  updateProfileSoftSkill,
  updateProfileSkills,
  updatePlanUsage,
} = userSlice.actions;

export default userSlice.reducer;
