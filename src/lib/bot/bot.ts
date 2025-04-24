import { Telegraf } from 'telegraf';
import { setupCommands } from './commands';
import { setupMiddleware } from './middleware';
import { setupLogger } from './logger';
import { startVideoChatScheduler } from './videoChatManager';
import { BotContext, TelegramUser } from '@/types/telegram';

const token = process.env.NEXT_PUBLIC_TELEGRAM_API_TOKEN;
if (!token) throw new Error('TELEGRAM_API_TOKEN is not set');

export const bot = new Telegraf<BotContext>(token);

// Настройка бота
setupMiddleware(bot);
setupCommands(bot);
setupLogger();

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка в ${ctx.updateType}`, err);
});

interface BotLaunchOptions {
  webhook?: {
    domain: string;
    port: number;
  };
}

export const launchBot = (options?: BotLaunchOptions) => {
  if (process.env.NODE_ENV === 'production') {
    startVideoChatScheduler();
    
    if (options?.webhook) {
      bot.launch({
        webhook: {
          domain: options.webhook.domain,
          port: options.webhook.port,
        },
      });
    } else {
      bot.launch();
    }
  } else {
    bot.launch();
  }
  
  console.log('Бот запущен');
};

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export const getBotInfo = async (): Promise<TelegramUser | null> => {
  try {
    return await bot.telegram.getMe();
  } catch (error) {
    console.error('Ошибка получения информации о боте:', error);
    return null;
  }
};