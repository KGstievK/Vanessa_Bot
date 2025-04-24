import { Telegraf } from 'telegraf';
import axios from 'axios';
import { setupCommands } from './commands';
import { setupMiddleware } from './middleware';
import { setupLogger } from './logger';
import { startVideoChatScheduler } from './videoChatManager';
import { BotContext } from '@/types/telegram';

const token = process.env.NEXT_PUBLIC_TELEGRAM_API_TOKEN;
if (!token) throw new Error('TELEGRAM_API_TOKEN is not set');

export const telegramBot = new Telegraf<BotContext>(token);
let isBotRunning = false;

const setWebhook = async (url: string) => {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${token}/setWebhook`,
      { url }
    );
    
    if (!response.data.ok) {
      throw new Error(`Failed to set webhook: ${response.data.description}`);
    }
    
    console.log('Webhook set successfully:', url);
    return true;
  } catch (error: unknown) {
    console.error('Error setting webhook:', error instanceof Error ? error.message : error);
    return false;
  }
};

export const initializeBot = () => {
  if (isBotRunning) return;
  
  setupMiddleware(telegramBot);
  setupCommands(telegramBot);
  setupLogger();
  
  telegramBot.catch((err, ctx) => {
    console.error(`Error in ${ctx.updateType}:`, err);
    ctx.reply('❌ An error occurred').catch(console.error);
  });
};

export const startBot = async () => {
  if (isBotRunning) {
    console.log('Bot is already running');
    return telegramBot;
  }

  initializeBot();
  isBotRunning = true;

  if (process.env.VERCEL_ENV === 'production' && process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL) {
    try {
      await setWebhook(`${process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL}/api/telegram`);
      startVideoChatScheduler();
      console.log('Bot started in webhook mode');
      return telegramBot;
    } catch (error) {
      console.error('Failed to start in webhook mode, falling back to polling', error);
      await telegramBot.launch();
    }
  } else {
    await telegramBot.launch();
    console.log('Bot started in polling mode');
  }

  process.once('SIGINT', () => telegramBot.stop('SIGINT'));
  process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));

  return telegramBot;
};

export const checkBotStatus = () => {
  return isBotRunning ? 'running' : 'stopped';
};