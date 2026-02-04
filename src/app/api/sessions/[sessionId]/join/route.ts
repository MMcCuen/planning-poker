import { NextRequest, NextResponse } from 'next/server';
import { joinSession } from '@/lib/session-store';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  const body = await request.json();
  const { playerName } = body;

  if (!playerName) {
    return NextResponse.json(
      { error: 'Player name is required' },
      { status: 400 }
    );
  }

  const player = joinSession(sessionId, playerName);

  if (!player) {
    return NextResponse.json(
      { error: 'Session not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ player });
}
