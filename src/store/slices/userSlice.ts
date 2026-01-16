import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface UserState {
  connectedUser: {
    user: any | null;
    profile: any | null;
    companyMembership: any | null;
    loading: boolean;
    error: string | null;
  };
  targetUser: {
    user: any | null;
    profile: any | null;
    loading: boolean;
    error: string | null;
  };
  userType: "company" | "candidate" | null;
  currentSpace?: "personal" | "membership" | null;
}

const initialState: UserState = {
  connectedUser: {
    user: null,
    profile: null,
    companyMembership: null,
    loading: false,
    error: null,
  },
  targetUser: {
    user: null,
    profile: null,
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
  const token = localStorage.getItem("api_token");
  if (!token) {
    return rejectWithValue("No authentication token found");
  }

  // Determine endpoint based on user type
  const endpoint =
    profileData.type === "company"
      ? "profiles/createOrUpdateCompanyProfile"
      : "profiles/createOrUpdateProfile";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      }
    );

    if (!response.ok) {
      return rejectWithValue("Failed to create/update profile");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue(
      "An error occurred while creating/updating profile"
    );
  }
});

export const updateProfile = createAsyncThunk<
  any,
  any,
  { rejectValue: string }
>("user/updateProfile", async (updatePayload, { rejectWithValue }) => {

  const token = localStorage.getItem("api_token");
  if (!token) {
    return rejectWithValue("No authentication token found");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      }
    );

    if (!response.ok) {
      return rejectWithValue("Failed to update profile");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue("An error occurred while updating profile");
  }
});

export const getMyProfile = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("user/getMyProfile", async (_, { rejectWithValue, getState }) => {

  const token = localStorage.getItem("api_token");
  if (!token) {
    return rejectWithValue("No authentication token found");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/me`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {

      return rejectWithValue("Failed to fetch profile");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue("An error occurred while fetching profile");
  }
});

export const uploadProfileImage = createAsyncThunk<
  any,
  File,
  { rejectValue: string }
>("user/uploadProfileImage", async (file, { rejectWithValue }) => {
  const token = localStorage.getItem("api_token");
  if (!token) {
    return rejectWithValue("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append('user_image', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      return rejectWithValue("Failed to upload profile image");
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    return rejectWithValue("An error occurred while uploading profile image");
  }
});

export const getProfileById = createAsyncThunk<
  any,
  string,
  { rejectValue: string; state: RootState }
>("user/getProfileById", async (userId, { rejectWithValue, getState }) => {
  const token = localStorage.getItem("api_token");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/${userId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );

    if (!response.ok) {
      return rejectWithValue("Failed to fetch profile");
    }

    const data = await response.json();

    return data;
  } catch (error: any) {
    return rejectWithValue("An error occurred while fetching profile");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setConnectedUser(state, action: PayloadAction<any>) {
      state.connectedUser.user = action.payload.user;
      state.connectedUser.profile = action.payload.profile;
      state.connectedUser.companyMembership = action.payload.companyMembership;
    },
    setTargetUser(state, action: PayloadAction<any>) {
      state.targetUser.user = action.payload.user;
      state.targetUser.profile = action.payload.profile;
    },
    clearConnectedUser(state) {
      state.connectedUser.user = null;
      state.connectedUser.profile = null;
      state.connectedUser.companyMembership = null;
    },
    clearTargetUser(state) {
      state.targetUser.user = null;
      state.targetUser.profile = null;
    },
    setUserType(state, action: PayloadAction<"company" | "candidate">) {
      state.userType = action.payload;
    },
    setCurrentSpace(state, action: PayloadAction<"personal" | "membership">) {
      state.currentSpace = action.payload;
    },
    updateProfileQuota(state, action: PayloadAction<number>) {
      if(state?.connectedUser?.profile?.quota){
        state.connectedUser.profile.quota = action.payload;
      }
    }
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
          state.targetUser.user = action.payload.user;
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
} = userSlice.actions;

export default userSlice.reducer;
