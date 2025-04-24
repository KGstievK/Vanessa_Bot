import { Telegraf } from 'telegraf';
import { Update, Message } from 'telegraf/types';
import { store } from '@/store/store';
import { telegramApi } from '@/features/telegram/telegramApi';
import { addRestrictedUser, removeRestrictedUser } from '@/features/telegram/telegramSlice';
import { BotContext, ChatMember } from '@/types/telegram';

const SYSTEM_MESSAGE_TYPES = [
  'new_chat_members', 'left_chat_member', 'new_chat_title',
  'new_chat_photo', 'delete_chat_photo', 'group_chat_created',
  'supergroup_chat_created', 'channel_chat_created', 'pinned_message'
] as const;

const SUSPICIOUS_DOMAINS = ['bit.ly', 'tinyurl.com', 'goo.gl'];
const ALLOWED_DOMAINS = ['youtube.com', 'twitter.com', 'vk.com'];

function isMessageUpdate(update: unknown): update is Update.MessageUpdate {
  return typeof update === 'object' && update !== null && 'message' in update;
}

function hasText(message: unknown): message is Message.TextMessage {
  return typeof message === 'object' && message !== null && 'text' in message;
}

function hasCaption(message: unknown): message is Message.CaptionableMessage {
  return typeof message === 'object' && message !== null && 'caption' in message;
}

export function setupMiddleware(bot: Telegraf<BotContext>) {
  bot.use(async (ctx, next) => {
    if (!ctx.chat || ctx.chat.type === 'private') return next();
    
    try {
      const result = await store.dispatch(
        telegramApi.endpoints.getChatAdministrators.initiate(ctx.chat.id)
      );
      
      if ('data' in result) {
        ctx.state.isAdmin = (result.data?.result || []).some(
          (admin: ChatMember) => 'user' in admin && admin.user === ctx.from?.id
        );
      }
    } catch (error) {
      console.error('Ошибка проверки админа:', error);
      ctx.state.isAdmin = false;
    }
    
    return next();
  });

  bot.on(SYSTEM_MESSAGE_TYPES as any, async (ctx) => {
    try {
      if (isMessageUpdate(ctx.update)) {
        await ctx.deleteMessage();
      }
    } catch (error) {
      console.error('Ошибка удаления системного сообщения:', error);
    }
  });

  bot.on('text', async (ctx) => {
    if (isMessageUpdate(ctx.update)) {
      await handleMessage(ctx, ctx.update.message);
    }
  });

  bot.on(['photo', 'video'], async (ctx) => {
    if (isMessageUpdate(ctx.update) && hasCaption(ctx.update.message)) {
      await handleMessage(ctx, ctx.update.message);
    }
  });

  async function handleMessage(ctx: BotContext, message: Message) {
    if (!ctx.from || !ctx.chat) return;

    const text = hasText(message) ? message.text : 
                hasCaption(message) ? message.caption : '';
    
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
          
          await ctx.restrictChatMember(ctx.from.id, {
            permissions: {
              can_send_messages: false,
              // can_send_media: false,
              can_send_polls: false,
              can_send_other_messages: false,
              can_add_web_page_previews: false,
            },
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