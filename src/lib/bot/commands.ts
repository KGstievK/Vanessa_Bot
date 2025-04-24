import { Telegraf } from 'telegraf';
import { store } from '@/store/store';
import { telegramApi } from '@/features/telegram/telegramApi';
import { setVideoChatActive } from '@/features/telegram/telegramSlice';
import { BotContext, BotPermissions } from '@/types/telegram';

export function setupCommands(bot: Telegraf<BotContext>) {
  bot.command('start_video_chat', async (ctx) => {
    if (!ctx.chat || !ctx.from || !ctx.state.isAdmin) {
      return ctx.reply('🚫 Только администраторы могут использовать эту команду.');
    }

    try {
      await ctx.sendChatAction('record_video');
      
      const result = await store.dispatch(
        telegramApi.endpoints.sendVideoChat.initiate({
          chat_id: ctx.chat.id,
          title: '24/7 Video Chat',
        })
      ).unwrap();

      store.dispatch(setVideoChatActive({ 
        chatId: String(ctx.chat.id), 
        active: result.ok 
      }));
      
      await ctx.reply(result.ok ? '✅ Видеочат запущен!' : '❌ Ошибка запуска');
    } catch (error) {
      console.error('Ошибка запуска видеочата:', error);
      await ctx.reply('❌ Ошибка запуска видеочата');
    }
  });

  bot.command('stop_video_chat', async (ctx) => {
    if (!ctx.chat || !ctx.from || !ctx.state.isAdmin) {
      return ctx.reply('🚫 Только администраторы могут использовать эту команду.');
    }

    store.dispatch(setVideoChatActive({ 
      chatId: String(ctx.chat.id), 
      active: false 
    }));
    await ctx.reply('⏹️ Видеочат остановлен');
  });

  bot.command('status', async (ctx) => {
    const state = store.getState();
    const isActive = state.telegram.activeVideoChats[String(ctx.chat?.id || '')] || false;
    
    await ctx.replyWithMarkdownV2(
      `*Статус бота*\n` +
      `Видеочат: ${isActive ? '✅ Вкл' : '❌ Выкл'}\n` +
      `Админ: ${ctx.state.isAdmin ? '✅ Да' : '❌ Нет'}`
    );
  });

  bot.command('set_permissions', async (ctx) => {
    if (!ctx.chat || !ctx.from || !ctx.state.isAdmin) {
      return ctx.reply('🚫 Только администраторы могут использовать эту команду.');
    }

    try {
      const permissions: BotPermissions = {
        can_send_messages: true,
        can_send_media: true,
        can_send_polls: true,
        can_send_other_messages: true,
        can_add_web_page_previews: false,
      };

      await store.dispatch(
        telegramApi.endpoints.setChatPermissions.initiate({
          chat_id: ctx.chat.id,
          permissions,
        })
      ).unwrap();

      await ctx.reply('✅ Настройки чата обновлены');
    } catch (error) {
      console.error('Ошибка настройки прав:', error);
      await ctx.reply('❌ Ошибка настройки прав');
    }
  });
}