import { configureStore } from '@reduxjs/toolkit';
import { telegramApi } from '@/features/telegram/telegramApi';
import telegramReducer from '@/features/telegram/telegramSlice';
import { setupListeners } from '@reduxjs/toolkit/query';

export const store = configureStore({
  reducer: {
    [telegramApi.reducerPath]: telegramApi.reducer,
    telegram: telegramReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(telegramApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;