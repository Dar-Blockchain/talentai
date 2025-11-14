import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { isLoggingOutCheck, getAbortSignal } from "./authSlice";

interface User {
  _id: string;
  username: string;
  email: string;
  isVerified: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  role: string;
  profile: string;
  FirstName?: string;
  LastName?: string;
  user_image?: string;
}

interface CompanyDetails {
  name: string;
  industry: string;
  size: string;
  location: string;
}

interface Skill {
  _id: string;
  name: string;
  proficiencyLevel: number;
  experienceLevel: string;
}

interface SoftSkill {
  _id: string;
  name: string;
  category: string;
  experienceLevel: string;
  NumberTestPassed: number;
  ScoreTest: number;
}

export interface Profile {
  _id: string;
  userId: User;
  type: string;
  skills: Skill[];
  softSkills: SoftSkill[];
  requiredSkills: string[];
  requiredExperienceLevel: string;
  targetRole?: string;
  companyDetails?: CompanyDetails;
  createdAt: string;
  updatedAt: string;
  overallScore: string;
  quota: number;
  quotaUpdatedAt: string;
  user_image?: string;
}

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

let getMyProfileCallCount = 0;

export const getMyProfile = createAsyncThunk<
  Profile,
  void,
  { rejectValue: string }
>("profile/getMyProfile", async (_, { rejectWithValue, getState }) => {
  const callId = ++getMyProfileCallCount;
  console.log(`🔑 [ProfileSlice][Call-${callId}] getMyProfile CALLED`);

  // CRITICAL: Check if logging out - abort immediately
  if (isLoggingOutCheck()) {
    console.log(
      `🚫 [ProfileSlice][Call-${callId}] Logout in progress - aborting API call`
    );
    return rejectWithValue("Logout in progress");
  }

  // Early check - if no token, reject immediately without API call
  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error(
      `❌ [ProfileSlice][Call-${callId}] No token found - skipping API call`
    );
    return rejectWithValue("No authentication token found");
  }

  // Get abort signal for this request
  const abortSignal = getAbortSignal();

  try {
    console.log(
      `📡 [ProfileSlice][Call-${callId}] Fetching profile from API...`
    );
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        signal: abortSignal || undefined, // Add abort signal to cancel request
      }
    );

    // Check again if logging out after fetch
    if (isLoggingOutCheck()) {
      console.log(
        `🚫 [ProfileSlice][Call-${callId}] Logout detected after fetch - aborting`
      );
      return rejectWithValue("Logout in progress");
    }

    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        console.warn(
          `⚠️ [ProfileSlice][Call-${callId}] Unauthorized (401) - Token expired or invalid`
        );
        // Clear profile from state
        // Don't redirect here - let components handle it
        return rejectWithValue("Token expired or invalid - Please login again");
      }

      const error = await response
        .json()
        .catch(() => ({ message: "Failed to fetch profile" }));
      console.error(`❌ [ProfileSlice][Call-${callId}] API error:`, error);
      return rejectWithValue(error.message || "Failed to fetch profile");
    }

    const data = await response.json();

    // Final check before returning data
    if (isLoggingOutCheck()) {
      console.log(
        `🚫 [ProfileSlice][Call-${callId}] Logout detected after response - aborting`
      );
      return rejectWithValue("Logout in progress");
    }

    console.log(
      `✅ [ProfileSlice][Call-${callId}] Profile fetched successfully`
    );
    return data;
  } catch (error: any) {
    // Handle abort errors gracefully
    if (error.name === "AbortError" || isLoggingOutCheck()) {
      console.log(
        `🚫 [ProfileSlice][Call-${callId}] Request aborted due to logout`
      );
      return rejectWithValue("Logout in progress");
    }
    console.error(`❌ [ProfileSlice][Call-${callId}] Exception:`, error);
    return rejectWithValue("An error occurred while fetching profile");
  }
});

// ---------- Async thunk for create/update profile ----------
export const createOrUpdateProfile = createAsyncThunk<
  Profile, // return type
  any, // argument type (profile data)
  { rejectValue: string }
>("profile/createOrUpdateProfile", async (profileData, { rejectWithValue }) => {
  const token = localStorage.getItem("api_token");
  if (!token) {
    console.error("No token found");
    return rejectWithValue("No authentication token found");
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/createOrUpdateProfile`,
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
      const error = await response
        .json()
        .catch(() => ({ message: "Failed to create/update profile" }));
      console.error("API error:", error);
      return rejectWithValue(
        error.message || "Failed to create/update profile"
      );
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Exception while creating/updating profile:", error);
    return rejectWithValue("An error occurred while creating/updating profile");
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state: ProfileState) => {
      state.profile = null;
      state.error = null;
    },
    clearError: (state: ProfileState) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getMyProfile.pending, (state: ProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        getMyProfile.fulfilled,
        (state: ProfileState, action: PayloadAction<Profile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(
        getMyProfile.rejected,
        (state: ProfileState, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      )
      .addCase(createOrUpdateProfile.pending, (state: ProfileState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOrUpdateProfile.fulfilled,
        (state: ProfileState, action: PayloadAction<Profile>) => {
          state.loading = false;
          state.profile = action.payload;
        }
      )
      .addCase(
        createOrUpdateProfile.rejected,
        (state: ProfileState, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "An error occurred";
        }
      );
  },
});

export const { clearProfile, clearError } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile;

export default profileSlice.reducer;
