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
import profileReducer from './slices/profileSlice';
import bidReducer from './slices/bidSlice';
import todoReducer from './slices/todoSlice';
import userReducer from './slices/userSlice';
import postReducer from './slices/postSlice';
import hrAgentsReducer from './slices/hrAgentsSlice';
import tokenReducer from './slices/tokenSlice';
import agentConfigReducer from './slices/agentConfigSlice';
import tokenPurchaseReducer from './slices/tokenPurchaseSlice';

const rootReducer = combineReducers({
  user: userReducer,

  auth: authReducer,
  profile: profileReducer,
  bid: bidReducer,
  todo: todoReducer,
  // project slice removed
  post: postReducer,
  hrAgents: hrAgentsReducer,
  token: tokenReducer,
  agentConfig: agentConfigReducer,
  tokenPurchase: tokenPurchaseReducer
});

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
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
