import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import bidReducer from './slices/bidSlice';
import todoReducer from './slices/todoSlice';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import hrAgentsReducer from './slices/hrAgentsSlice';
import tokenReducer from './slices/tokenSlice';
import agentConfigReducer from './slices/agentConfigSlice';
import tokenPurchaseReducer from './slices/tokenPurchaseSlice';
import candidateReducer from './slices/candidateSlice';
import postGenerationReducer from './slices/postGenerationSlice';
import interviewReducer from './slices/interviewSlice';
import jobDetailsReducer from './slices/jobDetailsSlice';
import manualPostReducer from './slices/manualPostSlice';
import notificationReducer from './slices/notificationSlice';
import memberReducer from './slices/memberSlice';
import { socketMiddleware } from './middleware/socketMiddleware';

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  bid: bidReducer,
  todo: todoReducer,
  post: postReducer,
  hrAgents: hrAgentsReducer,
  token: tokenReducer,
  agentConfig: agentConfigReducer,
  tokenPurchase: tokenPurchaseReducer,
  candidate: candidateReducer,
  postGeneration: postGenerationReducer,
  interview: interviewReducer,
  jobDetails: jobDetailsReducer,
  manualPost: manualPostReducer,
  notifications: notificationReducer,
  member: memberReducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    }).concat(socketMiddleware)
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
