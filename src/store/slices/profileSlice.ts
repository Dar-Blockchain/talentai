import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

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

export const getMyProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
    'profile/getMyProfile',
    async (_, { rejectWithValue, getState }) => {
        const callId = ++getMyProfileCallCount;
        console.log(`🔑 [ProfileSlice][Call-${callId}] getMyProfile CALLED`);
        
        // Early check - if no token, reject immediately without API call
        const token = localStorage.getItem('api_token');
        if (!token) {
            console.error(`❌ [ProfileSlice][Call-${callId}] No token found - skipping API call`);
            return rejectWithValue('No authentication token found');
        }
        
        try {

            console.log(`📡 [ProfileSlice][Call-${callId}] Fetching profile from API...`);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                console.error(`❌ [ProfileSlice][Call-${callId}] API error:`, error);
                return rejectWithValue(error.message || 'Failed to fetch profile');
            }

            const data = await response.json();
            console.log(`✅ [ProfileSlice][Call-${callId}] Profile fetched successfully`);
            return data;
        } catch (error) {
            console.error(`❌ [ProfileSlice][Call-${callId}] Exception:`, error);
            return rejectWithValue('An error occurred while fetching profile');
        }
    }
);

const profileSlice = createSlice({
    name: 'profile',
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
            .addCase(getMyProfile.fulfilled, (state: ProfileState, action: PayloadAction<Profile>) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(getMyProfile.rejected, (state: ProfileState, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export const { clearProfile, clearError } = profileSlice.actions;

export const selectProfile = (state: RootState) => state.profile;

export default profileSlice.reducer; 