import { NextResponse } from 'next/server';
import { bot, launchBot } from '@/lib/bot/bot';
import { Update } from 'telegraf/types';

// Инициализация бота
let botInitialized = false;

export async function POST(req: Request): Promise<NextResponse> {
  if (!botInitialized) {
    launchBot({
      webhook: {
        domain: process.env.NEXT_PUBLIC_TELEGRAM_WEBHOOK_URL || '',
        port: Number(process.env.PORT) || 3000,
      },
    });
    botInitialized = true;
  }

  try {
    const body: Update = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram update:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}