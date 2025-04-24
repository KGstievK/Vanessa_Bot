import { NextResponse } from 'next/server';
import { telegramBot } from '@/lib/bot/bot';
import { Update } from 'telegraf/types';

export async function POST(req: Request) {
  try {
    const body = await req.json() as Update;
    await telegramBot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling update:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}