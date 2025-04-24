import { Telegraf } from 'telegraf';
import { Update, Message } from 'telegraf/types';
import { store } from '@/store/store';
import { telegramApi } from '@/features/telegram/telegramApi';
import { addRestrictedUser, removeRestrictedUser } from '@/features/telegram/telegramSlice';
import { BotContext, ChatMember } from '@/types/telegram';

// Определяем тип для системных сообщений
type SystemMessageType = 
  | 'new_chat_members'
  | 'left_chat_member'
  | 'new_chat_title'
  | 'new_chat_photo'
  | 'delete_chat_photo'
  | 'group_chat_created'
  | 'supergroup_chat_created'
  | 'channel_chat_created'
  | 'pinned_message';

const SYSTEM_MESSAGE_TYPES: SystemMessageType[] = [
  'new_chat_members',
  'left_chat_member',
  'new_chat_title',
  'new_chat_photo',
  'delete_chat_photo',
  'group_chat_created',
  'supergroup_chat_created',
  'channel_chat_created',
  'pinned_message'
];

const SUSPICIOUS_DOMAINS: string[] = ['bit.ly', 'tinyurl.com', 'goo.gl'];
const ALLOWED_DOMAINS: string[] = ['youtube.com', 'twitter.com', 'vk.com'];

// Улучшенные guard-функции
function isMessageUpdate(update: Update): update is Update.MessageUpdate {
  return 'message' in update;
}

function hasText(message: Message): message is Message.TextMessage {
  return 'text' in message;
}

function hasCaption(message: Message): message is Message & { caption?: string } {
  return 'caption' in message;
}

interface ChatPermissions {
  can_send_messages?: boolean;
  can_send_media?: boolean;
  can_send_polls?: boolean;
  can_send_other_messages?: boolean;
  can_add_web_page_previews?: boolean;
}

export function setupMiddleware(bot: Telegraf<BotContext>): void {
  // Middleware для проверки администратора
  bot.use(async (ctx, next) => {
    if (!ctx.chat || ctx.chat.type === 'private') return next();
    
    try {
      const result = await store.dispatch(
        telegramApi.endpoints.getChatAdministrators.initiate(ctx.chat.id)
      );
      
      if ('data' in result) {
        const admins = result.data?.result || [];
        const isAdmin = admins.some((admin: ChatMember) => 
          'user' in admin && admin.user.id === ctx.from?.id
        );
        
        ctx.state.isAdmin = isAdmin;
      }
    } catch (error) {
      console.error('Ошибка проверки админа:', error);
      ctx.state.isAdmin = false;
    }
    
    return next();
  });

  // Обработка системных сообщений
  SYSTEM_MESSAGE_TYPES.forEach((type) => {
    bot.on(type, async (ctx) => {
      try {
        if (isMessageUpdate(ctx.update)) {
          await ctx.deleteMessage();
        }
      } catch (error) {
        console.error('Ошибка удаления системного сообщения:', error);
      }
    });
  });

  // Обработка текстовых сообщений
  bot.on('text', async (ctx) => {
    if (isMessageUpdate(ctx.update)) {
      await handleMessage(ctx, ctx.update.message);
    }
  });

  // Обработка медиа сообщений
  bot.on(['photo', 'video'], async (ctx) => {
    if (isMessageUpdate(ctx.update) && hasCaption(ctx.update.message)) {
      await handleMessage(ctx, ctx.update.message);
    }
  });

  async function handleMessage(ctx: BotContext, message: Message): Promise<void> {
    if (!ctx.from || !ctx.chat || !('message_id' in message)) return;

    const text = hasText(message) 
      ? message.text 
      : hasCaption(message) 
        ? message.caption 
        : null;
    
    if (!text) return;

    const hasBadLinks = (text.match(/https?:\/\/[^\s]+/g) || []).some(url => {
      try {
        const domain = new URL(url).hostname.replace('www.', '');
        return SUSPICIOUS_DOMAINS.some(d => domain.includes(d)) && 
              !ALLOWED_DOMAINS.some(d => domain.includes(d));
      } catch {
        return false;
      }
    });

    if (hasBadLinks) {
      try {
        await ctx.deleteMessage();
        
        if (!ctx.state.isAdmin) {
          const untilDate = Math.floor(Date.now() / 1000) + 3600;
          
          const permissions: ChatPermissions = {
            can_send_messages: false,
            can_send_media: false,
            can_send_polls: false,
            can_send_other_messages: false,
            can_add_web_page_previews: false,
          };

          await ctx.restrictChatMember(ctx.from.id, {
            permissions,
            until_date: untilDate,
          });

          store.dispatch(addRestrictedUser({ 
            userId: ctx.from.id, 
            until: untilDate 
          }));
          
          await ctx.reply(
            `@${ctx.from.username || ctx.from.first_name} ` +
            `заблокирован на 1 час за подозрительные ссылки.`
          );
        }
      } catch (error) {
        console.error('Ошибка обработки ссылки:', error);
      }
    }
  }

  // Проверка заблокированных пользователей
  bot.use(async (ctx, next) => {
    if (ctx.from) {
      const restriction = store.getState().telegram.restrictedUsers[ctx.from.id];
      if (restriction && restriction < Math.floor(Date.now() / 1000)) {
        store.dispatch(removeRestrictedUser({ userId: ctx.from.id }));
      }
    }
    return next();
  });
}