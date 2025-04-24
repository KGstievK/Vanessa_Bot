import { NextResponse } from 'next/server';
import { telegramBot } from '@/lib/bot/bot';
import { Update } from 'telegraf/types';

let botInitialized = false;

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415 }
      );
    }

    const body = await req.json() as Update;
    
    if (!botInitialized) {
      // Инициализируем бота без параметров
      await telegramBot.launch();
      botInitialized = true;
    }
    
    // Асинхронная обработка без ожидания
    telegramBot.handleUpdate(body).catch(console.error);
    
    return NextResponse.json({ ok: true }, { status: 200 });
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