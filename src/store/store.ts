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
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import candidateReducer from './slices/candidateSlice';
import postGenerationReducer from './slices/postGenerationSlice';
import interviewReducer from './slices/interviewSlice';
import jobDetailsReducer from './slices/jobDetailsSlice';
import manualPostReducer from './slices/manualPostSlice';
import notificationReducer from './slices/notificationSlice';
import memberReducer from './slices/memberSlice';
import chatReducer from './slices/chatSlice';
import teamChatReducer from '@/modules/team-chat/store/teamChatSlice';
import candidateChatReducer from '@/modules/candidate-chat/store/candidateChatSlice';
import adminReducer from './slices/adminSlice';
import planLimitsReducer from './slices/planLimitsSlice';
import campaignReducer from './slices/campaignSlice';
import companyReducer from './slices/companySlice';
import departmentReducer from './slices/departmentSlice';
import jobApplicationReducer from './slices/jobApplicationSlice';
import apiKeyReducer from './slices/apiKeySlice';
import feedbackReducer from './slices/feedbackSlice';
import paymentReducer from './slices/paymentSlice';
import { socketMiddleware } from './middleware/socketMiddleware';

const rootReducer = combineReducers({
  user: userReducer,
  auth: authReducer,
  post: postReducer,
  candidate: candidateReducer,
  postGeneration: postGenerationReducer,
  interview: interviewReducer,
  jobDetails: jobDetailsReducer,
  manualPost: manualPostReducer,
  notifications: notificationReducer,
  member: memberReducer,
  chat: chatReducer,
  teamChat: teamChatReducer,
  candidateChat: candidateChatReducer,
  admin: adminReducer,
  planLimits: planLimitsReducer,
  campaign: campaignReducer,
  company: companyReducer,
  department: departmentReducer,
  jobApplications: jobApplicationReducer,
  apiKeys: apiKeyReducer,
  feedback: feedbackReducer,
  payment: paymentReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'user', 'planLimits']
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
