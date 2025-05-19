import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import profileReducer from './features/profileSlice';
import bidReducer from './slices/bidSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        profile: profileReducer,
        bid: bidReducer
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 

export default store;
