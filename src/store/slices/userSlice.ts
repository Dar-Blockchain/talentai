import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { userService } from "@/services/userService";

export interface ConnectedUserEntity {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  user_image?: string;
  role?: string;
  trafficCounter?: number;
  firstName?: string;
  lastName?: string;
}

export interface ConnectedUserProfile {
  userId?: ConnectedUserEntity;
  user_image?: string;
  type?: string;
  name?: string;
  email?: string;
  requiredExperienceLevel?: string;
  targetRole?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  country?: string;
  language?: string;
  timeZone?: string;
  timezone?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  personalWebsite?: string;
  location?: string;
  website?: string;
  industry?: string;
  size?: string;
  employmentType?: string;
  contactInformation?: {
    phone?: string;
    location?: string;
    address?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    personalWebsite?: string;
  };
  companyDetails?: {
    name?: string;
    email?: string;
    industry?: string;
    size?: string;
    employmentType?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    phone?: string;
    address?: string;
    personalWebsite?: string;
    requiredExperienceLevel?: string;
    requiredSkills?: string[];
    language?: string;
  };
  requiredSkills?: string[];
  quota?: number;
  skills?: any[] | null;
  softSkills?: any[] | null;
  planUsage?: any;
  overallScore?: number;
  interviewDetails?: any[];
  isPublicProfile?: boolean;
  createdAt?: string;
  _id?: string;
}

interface UserState {
  connectedUser: {
    user: ConnectedUserEntity | null;
    profile: ConnectedUserProfile | null;
    planLimits: any | null;
    companyMembership: any | null;
    loading: boolean;
    error: string | null;
  };
  targetUser: {
    user: ConnectedUserEntity | null;
    profile: ConnectedUserProfile | null;
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
  try {
    return await userService.createOrUpdateProfile(profileData);
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
    return await userService.updateProfile(userId, updatePayload);
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
    return await userService.getMyProfile();
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
    return await userService.uploadProfileImage(userId, file);
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
    return await userService.getProfileById(userId);
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
  clearConnectedUser,
  clearTargetUser,
  setUserType,
  updateProfileQuota,
  updateProfileSoftSkill,
  updateProfileSkills,
  updatePlanUsage,
} = userSlice.actions;

export default userSlice.reducer;
