import { NextRequest, NextResponse } from 'next/server';
import { getSessionState } from '@/lib/session-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const state = getSessionState(sessionId);

  if (!state) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(state);
}
