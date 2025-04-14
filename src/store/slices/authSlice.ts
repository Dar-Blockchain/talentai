import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

interface SignInResponse {
    user: User;
    token: string;
}

const initialState: AuthState = {
    user: null,
    token: null,
    loading: false,
    error: null,
};

export const signIn = createAsyncThunk<SignInResponse, { email: string; password: string }, { rejectValue: string }>(
    'auth/signIn',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error.message || 'Invalid email or password');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue('An error occurred. Please try again.');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        signOut: (state: AuthState) => {
            state.user = null;
            state.token = null;
            state.error = null;
        },
        clearError: (state: AuthState) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signIn.pending, (state: AuthState) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(signIn.fulfilled, (state: AuthState, action: PayloadAction<SignInResponse>) => {
                state.loading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
            })
            .addCase(signIn.rejected, (state: AuthState, action: PayloadAction<string | undefined>) => {
                state.loading = false;
                state.error = action.payload || 'An error occurred';
            });
    },
});

export const { signOut, clearError } = authSlice.actions;

export const selectAuth = (state: RootState) => state.auth;

export default authSlice.reducer; 