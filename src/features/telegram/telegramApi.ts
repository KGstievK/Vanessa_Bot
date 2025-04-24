import { createApi } from '@reduxjs/toolkit/query/react';
import { telegramAxios } from '@/lib/utils/axios';
import {
  ChatMember,
  BotPermissions,
  TelegramMessage,
  TelegramUser,
  TelegramApiResponse
} from '@/types/telegram';

interface DeleteMessageParams {
  chat_id: number;
  message_id: number;
}

interface RestrictChatMemberParams {
  chat_id: number;
  user_id: number;
  permissions: BotPermissions;
  until_date?: number;
}

interface SendVideoChatParams {
  chat_id: number;
  title: string;
}

interface SetChatPermissionsParams {
  chat_id: number;
  permissions: BotPermissions;
}

export const telegramApi = createApi({
  reducerPath: 'telegramApi',
  baseQuery: async (args) => {
    try {
      const response = await telegramAxios(args);
      return { data: response.data };
    } catch (error: unknown) {
      const err = error as { response?: { status?: number; data?: unknown } };
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || (error instanceof Error ? error.message : 'Unknown error'),
        },
      };
    }
  },
  endpoints: (builder) => ({
    deleteMessage: builder.mutation<TelegramApiResponse<boolean>, DeleteMessageParams>({
      query: (params) => ({
        url: '/deleteMessage',
        method: 'POST',
        data: params,
      }),
    }),
    restrictChatMember: builder.mutation<TelegramApiResponse<boolean>, RestrictChatMemberParams>({
      query: (params) => ({
        url: '/restrictChatMember',
        method: 'POST',
        data: params,
      }),
    }),
    sendVideoChat: builder.mutation<TelegramApiResponse<TelegramMessage>, SendVideoChatParams>({
      query: (params) => ({
        url: '/sendVideoNote',
        method: 'POST',
        data: params,
      }),
    }),
    getChatAdministrators: builder.query<TelegramApiResponse<ChatMember[]>, number>({
      query: (chat_id) => ({
        url: '/getChatAdministrators',
        method: 'POST',
        data: { chat_id },
      }),
    }),
    getMe: builder.query<TelegramApiResponse<TelegramUser>, void>({
      query: () => ({
        url: '/getMe',
        method: 'POST',
      }),
    }),
    setChatPermissions: builder.mutation<TelegramApiResponse<boolean>, SetChatPermissionsParams>({
      query: (params) => ({
        url: '/setChatPermissions',
        method: 'POST',
        data: params,
      }),
    }),
  }),
});

export const {
  useDeleteMessageMutation,
  useRestrictChatMemberMutation,
  useSendVideoChatMutation,
  useGetChatAdministratorsQuery,
  useGetMeQuery,
  useSetChatPermissionsMutation,
} = telegramApi;