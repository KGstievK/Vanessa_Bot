  import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
  import {
    ChatMember,
    BotPermissions,
    TelegramMessage,
    TelegramUser,
    TelegramApiResponse // Теперь этот тип доступен
  } from '@/types/telegram';

  const TelegramToken = process.env.NEXT_PUBLIC_TELEGRAM_API_TOKEN;
  if (!TelegramToken) {
    throw new Error('TELEGRAM_API_TOKEN is not defined');
  }

  const TELEGRAM_API_URL = `https://api.telegram.org/bot${TelegramToken}`;

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
    baseQuery: fetchBaseQuery({ baseUrl: TELEGRAM_API_URL }),
    endpoints: (builder) => ({
      deleteMessage: builder.mutation<TelegramApiResponse<boolean>, DeleteMessageParams>({
        query: (params) => ({
          url: '/deleteMessage',
          method: 'POST',
          body: params,
        }),
      }),
      restrictChatMember: builder.mutation<TelegramApiResponse<boolean>, RestrictChatMemberParams>({
        query: (params) => ({
          url: '/restrictChatMember',
          method: 'POST',
          body: params,
        }),
      }),
      sendVideoChat: builder.mutation<TelegramApiResponse<TelegramMessage>, SendVideoChatParams>({
        query: (params) => ({
          url: '/sendVideoNote',
          method: 'POST',
          body: params,
        }),
      }),
      getChatAdministrators: builder.query<TelegramApiResponse<ChatMember[]>, number>({
        query: (chat_id) => ({
          url: '/getChatAdministrators',
          method: 'POST',
          body: { chat_id },
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
          body: params,
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