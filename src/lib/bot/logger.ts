import { NextFunction } from 'express';
import { telegramBot } from './bot';
import { BotContext } from '@/types/telegram';
// import { NextFunction } from 'telegraf';

export function setupLogger() {
  telegramBot.use(async (ctx: BotContext, next: NextFunction) => {
    const start = Date.now();
    await next();
    const responseTime = Date.now() - start;
    
    const logData: {
      timestamp: string;
      updateType?: string;
      chatId?: number;
      userId?: number;
      isAdmin: boolean;
      responseTime: string;
      messageText?: string;
    } = {
      timestamp: new Date().toISOString(),
      updateType: ctx.updateType,
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      isAdmin: ctx.state.isAdmin || false,
      responseTime: `${responseTime}ms`,
    };

    if (ctx.updateType === 'message' && 'message' in ctx.update && ctx.update.message && 'text' in ctx.update.message) {
      logData.messageText = ctx.update.message.text.substring(0, 50);
    }

    console.log(JSON.stringify(logData, null, 2));
  });
}