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
import memberReducer from './slices/memberSlice';
import chatReducer from './slices/chatSlice';
import teamChatReducer from '@/modules/chat/team-chat/store/teamChatSlice';
import candidateChatReducer from '@/modules/chat/candidate-chat/store/candidateChatSlice';
import adminReducer from './slices/adminSlice';
import planLimitsReducer from './slices/planLimitsSlice';
import campaignReducer from './slices/campaignSlice';
import departmentReducer from './slices/departmentSlice';
import paymentReducer from './slices/paymentSlice';
import postDetailsReducer from '../modules/company/posts/details/store/postSlice';

const rootReducer = combineReducers({
  user: userReducer,
  post: postReducer,
  member: memberReducer,
  chat: chatReducer,
  teamChat: teamChatReducer,
  candidateChat: candidateChatReducer,
  admin: adminReducer,
  planLimits: planLimitsReducer,
  campaign: campaignReducer,
  department: departmentReducer,
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
