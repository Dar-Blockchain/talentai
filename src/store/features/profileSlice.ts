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

interface Profile {
    _id: string;
    userId: User;
    type: string;
    skills: Skill[];
    requiredSkills: string[];
    requiredExperienceLevel: string;
    companyDetails?: CompanyDetails;
    createdAt: string;
    updatedAt: string;
    overallScore: string;
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

export const getMyProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
    'profile/getMyProfile',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('api_token');
            if (!token) {
                return rejectWithValue('No authentication token found');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}profiles/getMyProfile`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Failed to fetch profile');
            }

            const data = await response.json();
            return data;
        } catch (error) {
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