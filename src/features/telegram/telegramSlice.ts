import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TelegramState } from '@/types/telegram';

const initialState: TelegramState = {
  activeVideoChats: {},
  restrictedUsers: {},
};

export const telegramSlice = createSlice({
  name: 'telegram',
  initialState,
  reducers: {
    setVideoChatActive: (state, action: PayloadAction<{ chatId: string; active: boolean }>) => {
      const { chatId, active } = action.payload;
      state.activeVideoChats[chatId] = active;
    },
    addRestrictedUser: (state, action: PayloadAction<{ userId: number; until: number }>) => {
      const { userId, until } = action.payload;
      state.restrictedUsers[userId] = until;
    },
    removeRestrictedUser: (state, action: PayloadAction<{ userId: number }>) => {
      const { userId } = action.payload;
      delete state.restrictedUsers[userId];
    },
  },
});

export const { setVideoChatActive, addRestrictedUser, removeRestrictedUser } =
  telegramSlice.actions;

export default telegramSlice.reducer;