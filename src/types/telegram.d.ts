import { Context, Update, Message, Chat, User } from "telegraf";
import { MessageSubTypes } from "telegraf/types";

declare module "telegraf" {
  interface Context {
    state: {
      isAdmin?: boolean;
    };
  }
}

export type BotContext = Context & {
  state: {
    isAdmin?: boolean;
  };
  update: Update.MessageUpdate | Update.EditedMessageUpdate;
};

export interface TelegramUser extends User {}
export interface TelegramChat extends Chat {}
export interface TelegramMessage extends Message {}

export interface BotPermissions {
  can_send_media_messages?: boolean;
  can_send_messages?: boolean;
  can_send_media?: boolean; // Изменено с can_send_media_messages
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
}

export interface ChatMember {
  user: TelegramUser;
  status:
    | "creator"
    | "administrator"
    | "member"
    | "restricted"
    | "left"
    | "kicked";
  is_anonymous?: boolean;
  custom_title?: string;
  until_date?: number;
  can_be_edited?: boolean;
  can_manage_chat?: boolean;
  can_post_messages?: boolean;
  can_edit_messages?: boolean;
  can_delete_messages?: boolean;
  can_send_media?: boolean; // Изменено с can_send_media_messages
  can_manage_video_chats?: boolean;
  can_restrict_members?: boolean;
  can_promote_members?: boolean;
  can_change_info?: boolean;
  can_invite_users?: boolean;
  can_pin_messages?: boolean;
  permissions?: BotPermissions;
}

export interface TelegramState {
  activeVideoChats: Record<string, boolean>;
  restrictedUsers: Record<string, number>;
}

export interface TelegramApiResponse<T = any> {
  ok: boolean;
  result?: T;
  description?: string;
  error_code?: number;
}