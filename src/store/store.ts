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
import chatReducer from './slices/chatSlice';
import teamChatReducer from '@/modules/chat/team-chat/store/teamChatSlice';
import candidateChatReducer from '@/modules/chat/candidate-chat/store/candidateChatSlice';
import planLimitsReducer from './slices/planLimitsSlice';
import paymentReducer from './slices/paymentSlice';
import postDetailsReducer from '../modules/company/posts/details/store/postSlice';
import postGenerationReducer from '../modules/company/posts/create/store/createPostSlice';

const rootReducer = combineReducers({
  user: userReducer,
  chat: chatReducer,
  teamChat: teamChatReducer,
  candidateChat: candidateChatReducer,
  planLimits: planLimitsReducer,
  payment: paymentReducer,
  postDetails: postDetailsReducer,
  postGeneration: postGenerationReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  // postGeneration: so an accidental refresh/tab-close mid-draft (create-post
  // form) doesn't lose the candidate's work — see createPostSlice.ts, it's
  // pure serializable form data with no loading flags mixed in.
  whitelist: ['user', 'planLimits', 'postGeneration']
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
