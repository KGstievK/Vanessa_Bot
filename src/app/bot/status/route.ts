import { NextResponse } from 'next/server';
import { checkBotStatus } from '@/lib/bot/bot';

export async function GET() {
  try {
    return NextResponse.json({
      status: checkBotStatus(),
      timestamp: new Date().toISOString()
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 'error'
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}