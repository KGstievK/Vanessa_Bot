import { NextResponse } from 'next/server';
import { startBot } from '@/lib/bot/bot';

export async function POST() {
  try {
    await startBot();
    return NextResponse.json({
      success: true,
      status: 'running'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start',
      status: 'error'
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}