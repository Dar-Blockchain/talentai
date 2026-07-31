import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
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
  language?: string;
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
    language?: string;
  };

  quota?: number;
  skills?: { name?: string; [key: string]: unknown }[] | null;
  softSkills?: unknown[] | null;
  planUsage?: unknown;
  overallScore?: number;
  interviewDetails?: unknown[];
  resume?: string;
  isPublicProfile?: boolean;
  createdAt?: string;
  _id?: string;
}

export interface UserProfileResponsePayload {
  data?: UserProfileResponsePayload;
  user?: ConnectedUserEntity;
  profile?: ConnectedUserProfile;
  planLimits?: UserPlanLimitsInfo | null;
  companyMembership?: CompanyMembershipInfo | null;
}

export interface UserPlanLimitsInfo {
  name?: string;
  planName?: string;
  plan?: { name?: string; [key: string]: unknown };
  planId?: { name?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface CompanyMembershipInfo {
  _id?: string;
  role?: string;
  company?: {
    _id?: string;
    username?: string;
    profile?: {
      companyDetails?: { name?: string };
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

interface UserState {
  connectedUser: {
    user: ConnectedUserEntity | null;
    profile: ConnectedUserProfile | null;
    planLimits: UserPlanLimitsInfo | null;
    companyMembership: CompanyMembershipInfo | null;
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
  userType: null,
  currentSpace: null,
};

export const updateProfile = createAsyncThunk<
  UserProfileResponsePayload,
  { payload: Record<string, unknown>; targetUserId?: string },
  { rejectValue: string }
>("user/updateProfile", async ({ payload: updatePayload, targetUserId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const connectedUser = state.user.connectedUser.user;
    const userId = targetUserId || connectedUser?._id || connectedUser?.id;
    return await userService.updateProfile(userId as string, updatePayload);
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "An error occurred while updating profile"
    );
  }
});

export const getMyProfile = createAsyncThunk<
  UserProfileResponsePayload,
  void,
  { rejectValue: string }
>("user/getMyProfile", async (_, { rejectWithValue }) => {
  try {
    return await userService.getMyProfile();
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "An error occurred while fetching profile"
    );
  }
});

export const uploadProfileImage = createAsyncThunk<
  UserProfileResponsePayload,
  { file: File; targetUserId?: string },
  { rejectValue: string }
>("user/uploadProfileImage", async ({ file, targetUserId }, { getState, rejectWithValue }) => {
  try {
    const state = getState() as RootState;
    const connectedUser = state.user.connectedUser.user;
    const userId = targetUserId || connectedUser?._id || connectedUser?.id;
    return await userService.uploadProfileImage(userId as string, file);
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return rejectWithValue(
      axiosError.response?.data?.message || "An error occurred while uploading profile image"
    );
  }
});


const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setConnectedUser(state, action: PayloadAction<UserProfileResponsePayload>) {
      // Normalize: some APIs wrap the response in a `data` key, others don't
      const p = action.payload?.data ?? action.payload;
      state.connectedUser.user = p.user ?? state.connectedUser.user;
      state.connectedUser.profile = p.profile ?? state.connectedUser.profile;
      state.connectedUser.planLimits = p.planLimits ?? state.connectedUser.planLimits;
      state.connectedUser.companyMembership = p.companyMembership ?? state.connectedUser.companyMembership;
    },
    clearConnectedUser(state) {
      state.connectedUser.user = null;
      state.connectedUser.profile = null;
      state.connectedUser.planLimits = null;
      state.connectedUser.companyMembership = null;
    },
    setUserType(state, action: PayloadAction<"company" | "candidate" | "employee">) {
      state.userType = action.payload;
    },
    updateProfileQuota(state, action: PayloadAction<number>) {
      if (state?.connectedUser?.profile?.quota !== undefined) {
        state.connectedUser.profile.quota = action.payload;
      }
    },
    updateProfileSkills(state, action: PayloadAction<{ name?: string; [key: string]: unknown }[]>) {
      if (state?.connectedUser?.profile) {
        state.connectedUser.profile.skills = action.payload;
      }
    },
    updateProfileSoftSkill(state, action: PayloadAction<string[]>) {
      if (state?.connectedUser?.profile) {
        state.connectedUser.profile.softSkills = action.payload;
      }
    },
    updateProfileResume(state, action: PayloadAction<string>) {
      if (state?.connectedUser?.profile) {
        state.connectedUser.profile.resume = action.payload;
      }
    },
    updatePlanUsage(state, action: PayloadAction<unknown>) {
      if (state?.connectedUser?.profile) {
        state.connectedUser.profile.planUsage = action.payload;
      }
    },
  },
    extraReducers: (builder) => {
      builder
        //UPDATE PROFILE
        .addCase(updateProfile.pending, (state: UserState) => {
          state.connectedUser.loading = true;
          state.connectedUser.error = null;
        })
        .addCase(
          updateProfile.fulfilled,
          (state: UserState, action: PayloadAction<UserProfileResponsePayload>) => {
            state.connectedUser.loading = false;
            if (action.payload.profile !== undefined)           state.connectedUser.profile           = action.payload.profile;
            if (action.payload.companyMembership !== undefined) state.connectedUser.companyMembership = action.payload.companyMembership;
            if (action.payload.user !== undefined)              state.connectedUser.user              = action.payload.user;
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
          (state: UserState, action: PayloadAction<UserProfileResponsePayload>) => {
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
          (state: UserState, action: PayloadAction<UserProfileResponsePayload>) => {
            const p = action.payload?.data ?? action.payload;
            state.connectedUser.loading = false;
            state.connectedUser.profile = p.profile ?? state.connectedUser.profile;
            state.connectedUser.planLimits = p.planLimits ?? state.connectedUser.planLimits;
            state.connectedUser.companyMembership = p.companyMembership ?? state.connectedUser.companyMembership;
            state.connectedUser.user = p.user ?? state.connectedUser.user;
          }
        )
        .addCase(
          getMyProfile.rejected,
          (state: UserState) => {
            state.connectedUser.loading = false;
          }
        )
    },
  });

export const {
  setConnectedUser,
  clearConnectedUser,
  setUserType,
  updateProfileQuota,
  updateProfileSoftSkill,
  updateProfileSkills,
  updateProfileResume,
  updatePlanUsage,
} = userSlice.actions;

export default userSlice.reducer;
