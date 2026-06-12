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
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import candidateReducer from './slices/candidateSlice';
import postGenerationReducer from './slices/postGenerationSlice';
import interviewReducer from './slices/interviewSlice';
import jobDetailsReducer from './slices/jobDetailsSlice';
import memberReducer from './slices/memberSlice';
import chatReducer from './slices/chatSlice';
import teamChatReducer from '@/modules/chat/team-chat/store/teamChatSlice';
import candidateChatReducer from '@/modules/chat/candidate-chat/store/candidateChatSlice';
import adminReducer from './slices/adminSlice';
import planLimitsReducer from './slices/planLimitsSlice';
import campaignReducer from './slices/campaignSlice';
import companyReducer from './slices/companySlice';
import departmentReducer from './slices/departmentSlice';
import jobApplicationReducer from './slices/jobApplicationSlice';
import feedbackReducer from './slices/feedbackSlice';
import paymentReducer from './slices/paymentSlice';
import postDetailsReducer from '../modules/company/posts/details/store/postSlice';

const rootReducer = combineReducers({
  user: userReducer,
  post: postReducer,
  candidate: candidateReducer,
  postGeneration: postGenerationReducer,
  interview: interviewReducer,
  jobDetails: jobDetailsReducer,
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
  feedback: feedbackReducer,
  payment: paymentReducer,
  postDetails: postDetailsReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['user', 'planLimits']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
